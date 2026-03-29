import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const refreshTokenFromCookie = (request: {
  cookies?: { refresh_token?: string };
}) => request?.cookies?.refresh_token ?? null;

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        refreshTokenFromCookie,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    tenantId: string;
    role: string;
    jti?: string;
  }) {
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
