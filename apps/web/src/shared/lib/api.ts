import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { routes } from '@/config/routes';
import { setFlashToast } from '@/shared/lib/toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type ApiFetchInit = Omit<AxiosRequestConfig, 'url' | 'data'> & {
  json?: unknown;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let requestQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error?: unknown) {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  requestQueue = [];
}

api.interceptors.request.use((config) => {
  config.headers = AxiosHeaders.from(config.headers);
  if (!config.headers.get('Content-Type')) {
    config.headers.set('Content-Type', 'application/json');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryableRequest | undefined;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/logout');

    if (!original || status !== 401 || original._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve, reject) => {
        requestQueue.push({ resolve, reject });
      });
      return api(original);
    }

    isRefreshing = true;
    try {
      await api.post('/auth/refresh');
      flushQueue();
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const onPublicAuthPage =
          path === '/' || path === routes.login || path === routes.register;
        if (!onPublicAuthPage) {
          setFlashToast({
            title: 'Sessão expirada',
            description: 'Faça login novamente para continuar.',
            variant: 'warning',
          });
          window.location.href = routes.login;
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiFetch<T>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const { json, ...rest } = init;
  const response = await api.request<T>({
    url: path,
    data: json,
    ...rest,
  });
  return response.data;
}

/** Extrai mensagem do corpo NestJS (`message`) ou do Axios. */
export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(' ');
    if (typeof msg === 'string' && msg.trim()) return msg;
    return error.message || 'Erro na requisição.';
  }
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}
