export const Role = {
  MASTER: 'MASTER',
  USER: 'USER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
