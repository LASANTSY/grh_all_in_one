import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface RefreshPayload {
  sub: string;
  tokenId: string;
}

export interface RefreshContext {
  compteId: string;
  tokenId: string;
  refreshToken: string;
}

function extractRefreshFromCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.refresh_token ?? null;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.refreshSecret');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET manquant dans la configuration.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshFromCookie]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshPayload): RefreshContext {
    const refreshToken = extractRefreshFromCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_MISSING',
        message: 'Jeton de rafraichissement manquant.',
      });
    }

    return {
      compteId: payload.sub,
      tokenId: payload.tokenId,
      refreshToken,
    };
  }
}