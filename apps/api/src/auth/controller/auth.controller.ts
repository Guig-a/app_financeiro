import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../../commom/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import type { Response } from 'express';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
/** Cobre /auth/refresh e /auth/logout (refresh enviado em ambas as rotas). */
const REFRESH_COOKIE_PATH = '/auth';
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = this.isProduction();
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TTL_MS,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_TTL_MS,
    });
  }

  private clearAuthCookies(response: Response) {
    const secure = this.isProduction();
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: REFRESH_COOKIE_PATH,
    });
  }

  @Post('register')
  @SkipThrottle({ auth: true })
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.register(dto);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('login')
  @Throttle({ auth: { limit: 10, ttl: 10000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas. Tente novamente em alguns segundos.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.login(dto);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @SkipThrottle({ auth: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido ou revogado' })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser & { jti?: string },
  ) {
    if (!user.jti) throw new UnauthorizedException('Invalid token');
    const session = await this.auth.refresh(user.userId, user.jti);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  @SkipThrottle({ auth: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (revoga o refresh token enviado)' })
  @ApiResponse({ status: 200, description: 'Logout realizado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser & { jti?: string },
  ) {
    this.clearAuthCookies(res);
    if (user.jti) await this.auth.logout(user.userId, user.jti);
    return { ok: true };
  }
}
