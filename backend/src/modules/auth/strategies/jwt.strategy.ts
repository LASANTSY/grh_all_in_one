import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../../common/enums/type-compte.enum';

interface JwtPayload {
  sub: string;
  identifiant: string;
  typeCompte: TypeCompte;
  personnelId: string | null;
  unitePerimetreId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET manquant dans la configuration.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.typeCompte) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Jeton invalide.',
      });
    }

    return {
      compteId: payload.sub,
      identifiant: payload.identifiant,
      typeCompte: payload.typeCompte,
      personnelId: payload.personnelId,
      unitePerimetreId: payload.unitePerimetreId,
    };
  }
}