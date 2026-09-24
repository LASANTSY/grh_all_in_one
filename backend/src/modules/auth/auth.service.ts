import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { CompteUtilisateur } from '../utilisateurs/entities/compte-utilisateur.entity';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthenticatedUserDto } from './dto/auth-response.dto';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import { verifyPassword } from './utils/password.util';
import { AuditService } from '../audit/audit.service';
import { ActionAudit } from '../audit/entities/entree-audit.entity';

interface AccessTokenPayload {
  sub: string;
  identifiant: string;
  typeCompte: TypeCompte;
  personnelId: string | null;
  unitePerimetreId: string | null;
}

interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: AuthenticatedUserDto;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: AuthenticatedUserDto;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly utilisateursService: UtilisateursService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(
    identifiant: string,
    motDePasse: string,
    context: { adresseIp: string | null; userAgent: string | null },
  ): Promise<LoginResult> {
    const compte = await this.utilisateursService.findByIdentifiant(identifiant);

    if (!compte) {
      this.logger.warn(`Tentative de connexion avec identifiant inconnu : ${identifiant}`);
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Identifiant ou mot de passe incorrect.',
      });
    }

    if (!compte.actif) {
      throw new UnauthorizedException({
        code: 'AUTH_ACCOUNT_INACTIVE',
        message: 'Ce compte est desactive.',
      });
    }

    if (compte.compteVerrouille) {
      throw new UnauthorizedException({
        code: 'AUTH_ACCOUNT_LOCKED',
        message: 'Ce compte est verrouille. Contactez un administrateur.',
      });
    }

    const motDePasseValide = await verifyPassword(motDePasse, compte.motDePasseHash);

    if (!motDePasseValide) {
      const maxAttempts = this.configService.get<number>('app.maxLoginAttempts', 5);
      const lockoutMinutes = this.configService.get<number>('app.lockoutDurationMinutes', 15);
      await this.utilisateursService.recordFailedLogin(compte, maxAttempts, lockoutMinutes);
      this.logger.warn(`Echec de connexion pour identifiant : ${identifiant}`);

      await this.auditService.record(
        {
          action: ActionAudit.ECHEC_CONNEXION,
          entiteType: 'CompteUtilisateur',
          entiteId: compte.id,
          personnelId: compte.personnelId,
        },
        {
          auteurId: compte.id,
          adresseIp: context.adresseIp,
          userAgent: context.userAgent,
        },
      );

      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Identifiant ou mot de passe incorrect.',
      });
    }

    await this.utilisateursService.recordSuccessfulLogin(compte.id);

    const accessToken = this.signAccessToken(compte);
    const { refreshToken, refreshExpiresAt } = await this.signAndPersistRefreshToken(
      compte,
      context,
    );

    await this.auditService.record(
      {
        action: ActionAudit.CONNEXION,
        entiteType: 'CompteUtilisateur',
        entiteId: compte.id,
        personnelId: compte.personnelId,
      },
      {
        auteurId: compte.id,
        adresseIp: context.adresseIp,
        userAgent: context.userAgent,
      },
    );

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt,
      user: this.toAuthenticatedUserDto(compte),
    };
  }

  async refresh(refreshToken: string, tokenId: string): Promise<RefreshResult> {
    const hashed = this.hashToken(refreshToken);

    const stored = await this.refreshTokenRepository.findOne({
      where: { id: tokenId },
      relations: { compte: true },
    });

    if (!stored) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_NOT_FOUND',
        message: 'Session expiree. Veuillez vous reconnecter.',
      });
    }

    if (stored.revokedAt) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_REVOKED',
        message: 'Session revoquee. Veuillez vous reconnecter.',
      });
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_EXPIRED',
        message: 'Session expiree. Veuillez vous reconnecter.',
      });
    }

    if (stored.tokenHash !== hashed) {
      await this.refreshTokenRepository.update(stored.id, { revokedAt: new Date() });
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_INVALID',
        message: 'Session invalide. Veuillez vous reconnecter.',
      });
    }

    const compte = stored.compte;
    if (!compte || !compte.actif || compte.compteVerrouille) {
      throw new UnauthorizedException({
        code: 'AUTH_ACCOUNT_UNAVAILABLE',
        message: 'Ce compte n est plus disponible.',
      });
    }

    await this.refreshTokenRepository.update(stored.id, { revokedAt: new Date() });

    const accessToken = this.signAccessToken(compte);
    const { refreshToken: newRefreshToken, refreshExpiresAt } =
      await this.signAndPersistRefreshToken(compte, {
        adresseIp: stored.adresseIp,
        userAgent: stored.userAgent,
      });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshExpiresAt,
      user: this.toAuthenticatedUserDto(compte),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const hashed = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash: hashed },
      relations: { compte: true },
    });
    if (stored && !stored.revokedAt) {
      await this.refreshTokenRepository.update(stored.id, { revokedAt: new Date() });

      await this.auditService.record(
        {
          action: ActionAudit.DECONNEXION,
          entiteType: 'CompteUtilisateur',
          entiteId: stored.compteId,
          personnelId: stored.compte?.personnelId ?? null,
        },
        {
          auteurId: stored.compteId,
          adresseIp: stored.adresseIp,
          userAgent: stored.userAgent,
        },
      );
    }
  }

  async revokeAllForCompte(compteId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('compte_id = :compteId', { compteId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }

  private signAccessToken(compte: CompteUtilisateur): string {
    const payload: AccessTokenPayload = {
      sub: compte.id,
      identifiant: compte.identifiant,
      typeCompte: compte.typeCompte,
      personnelId: compte.personnelId,
      unitePerimetreId: compte.unitePerimetreId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
    });
  }

  private async signAndPersistRefreshToken(
    compte: CompteUtilisateur,
    context: { adresseIp: string | null; userAgent: string | null },
  ): Promise<{ refreshToken: string; refreshExpiresAt: Date }> {
    const tokenId = randomUUID();
    const payload: RefreshTokenPayload = { sub: compte.id, tokenId };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });

    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    const entity = this.refreshTokenRepository.create({
      id: tokenId,
      compteId: compte.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
      adresseIp: context.adresseIp,
      userAgent: context.userAgent,
    });

    await this.refreshTokenRepository.save(entity);

    return { refreshToken, refreshExpiresAt: expiresAt };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthenticatedUserDto(compte: CompteUtilisateur): AuthenticatedUserDto {
    return {
      compteId: compte.id,
      identifiant: compte.identifiant,
      typeCompte: compte.typeCompte,
      personnelId: compte.personnelId,
      unitePerimetreId: compte.unitePerimetreId,
    };
  }
}