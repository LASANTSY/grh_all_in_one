import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompteUtilisateur } from './entities/compte-utilisateur.entity';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import {
  generateTemporaryPassword,
  hashPassword,
  verifyPassword,
} from '../auth/utils/password.util';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(CompteUtilisateur)
    private readonly compteRepository: Repository<CompteUtilisateur>,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: string): Promise<CompteUtilisateur | null> {
    return this.compteRepository.findOne({ where: { id } });
  }

  async findByIdentifiant(identifiant: string): Promise<CompteUtilisateur | null> {
    return this.compteRepository.findOne({ where: { identifiant } });
  }

  async findByIdOrFail(id: string): Promise<CompteUtilisateur> {
    const compte = await this.findById(id);
    if (!compte) {
      throw new NotFoundException({
        code: 'UTILISATEUR_NOT_FOUND',
        message: 'Compte utilisateur introuvable.',
      });
    }
    return compte;
  }

  async findAll(
    page?: number,
    limit?: number,
    typeCompte?: TypeCompte,
  ): Promise<PaginatedResult<CompteUtilisateur>> {
    const pagination = buildPagination(page, limit);

    const qb = this.compteRepository
      .createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (typeCompte) {
      qb.andWhere('c.typeCompte = :typeCompte', { typeCompte });
    }

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination);
  }

  async create(dto: CreateUtilisateurDto): Promise<{
    compte: CompteUtilisateur;
    motDePasseProvisoire: string;
  }> {
    const existing = await this.findByIdentifiant(dto.identifiant);
    if (existing) {
      throw new ConflictException({
        code: 'UTILISATEUR_DUPLICATE_IDENTIFIANT',
        message: 'Cet identifiant est deja utilise.',
      });
    }

    if (dto.personnelId) {
      const compteLie = await this.compteRepository.findOne({
        where: { personnelId: dto.personnelId },
      });
      if (compteLie) {
        throw new ConflictException({
          code: 'UTILISATEUR_DUPLICATE_PERSONNEL',
          message: 'Cette fiche Personnel est deja rattachee a un compte.',
        });
      }
    }

    this.validatePerimetre(dto.typeCompte, dto.unitePerimetreId ?? null);

    const motDePasseProvisoire = generateTemporaryPassword(12);
    const saltRounds = this.configService.get<number>('app.bcryptSaltRounds', 12);
    const motDePasseHash = await hashPassword(motDePasseProvisoire, saltRounds);

    const compte = this.compteRepository.create({
      identifiant: dto.identifiant,
      motDePasseHash,
      typeCompte: dto.typeCompte,
      personnelId: dto.personnelId ?? null,
      unitePerimetreId: dto.unitePerimetreId ?? null,
      doitChangerMotDePasse: true,
      actif: true,
      compteVerrouille: false,
      tentativesEchouees: 0,
    });

    const saved = await this.compteRepository.save(compte);
    return { compte: saved, motDePasseProvisoire };
  }

  async update(id: string, dto: UpdateUtilisateurDto): Promise<CompteUtilisateur> {
    const compte = await this.findByIdOrFail(id);

    if (dto.typeCompte !== undefined || dto.unitePerimetreId !== undefined) {
      const newType = dto.typeCompte ?? compte.typeCompte;
      const newPerimetre =
        dto.unitePerimetreId !== undefined ? dto.unitePerimetreId : compte.unitePerimetreId;
      this.validatePerimetre(newType, newPerimetre);
    }

    if (dto.typeCompte !== undefined) compte.typeCompte = dto.typeCompte;
    if (dto.unitePerimetreId !== undefined) compte.unitePerimetreId = dto.unitePerimetreId;
    if (dto.actif !== undefined) compte.actif = dto.actif;
    if (dto.compteVerrouille !== undefined) {
      compte.compteVerrouille = dto.compteVerrouille;
      if (!dto.compteVerrouille) {
        compte.tentativesEchouees = 0;
        compte.dernierEchec = null;
      }
    }

    return this.compteRepository.save(compte);
  }

  async unlock(id: string): Promise<CompteUtilisateur> {
    const compte = await this.findByIdOrFail(id);
    compte.compteVerrouille = false;
    compte.tentativesEchouees = 0;
    compte.dernierEchec = null;
    return this.compteRepository.save(compte);
  }

  async resetPassword(id: string): Promise<{ compte: CompteUtilisateur; motDePasseProvisoire: string }> {
    const compte = await this.findByIdOrFail(id);
    const motDePasseProvisoire = generateTemporaryPassword(12);
    const saltRounds = this.configService.get<number>('app.bcryptSaltRounds', 12);
    compte.motDePasseHash = await hashPassword(motDePasseProvisoire, saltRounds);
    compte.doitChangerMotDePasse = true;
    compte.compteVerrouille = false;
    compte.tentativesEchouees = 0;
    compte.dernierEchec = null;

    const saved = await this.compteRepository.save(compte);
    return { compte: saved, motDePasseProvisoire };
  }

  async changePassword(
    id: string,
    motDePasseActuel: string,
    nouveauMotDePasse: string,
  ): Promise<void> {
    const compte = await this.findByIdOrFail(id);

    const ok = await verifyPassword(motDePasseActuel, compte.motDePasseHash);
    if (!ok) {
      throw new BadRequestException({
        code: 'UTILISATEUR_INVALID_CURRENT_PASSWORD',
        message: 'Le mot de passe actuel est incorrect.',
      });
    }

    const saltRounds = this.configService.get<number>('app.bcryptSaltRounds', 12);
    compte.motDePasseHash = await hashPassword(nouveauMotDePasse, saltRounds);
    compte.doitChangerMotDePasse = false;
    await this.compteRepository.save(compte);
  }

  async recordSuccessfulLogin(id: string): Promise<void> {
    await this.compteRepository.update(id, {
      dateDerniereConnexion: new Date(),
      tentativesEchouees: 0,
      dernierEchec: null,
    });
  }

  async recordFailedLogin(
    compte: CompteUtilisateur,
    maxAttempts: number,
    lockoutMinutes: number,
  ): Promise<void> {
    const tentatives = compte.tentativesEchouees + 1;
    const shouldLock = tentatives >= maxAttempts;

    const updates: Partial<CompteUtilisateur> = {
      tentativesEchouees: tentatives,
      dernierEchec: new Date(),
    };

    if (shouldLock) {
      updates.compteVerrouille = true;
    }

    await this.compteRepository.update(compte.id, updates);
    void lockoutMinutes;
  }

  private validatePerimetre(typeCompte: TypeCompte, unitePerimetreId: string | null): void {
    const requiresPerimetre =
      typeCompte === TypeCompte.RH_BASE || typeCompte === TypeCompte.CHEF_COMMANDEMENT;

    if (requiresPerimetre && !unitePerimetreId) {
      throw new BadRequestException({
        code: 'UTILISATEUR_PERIMETRE_REQUIRED',
        message: "Une unite de perimetre est obligatoire pour ce type de compte.",
      });
    }

    const forbidsPerimetre =
      typeCompte === TypeCompte.ADMIN_SYSTEME ||
      typeCompte === TypeCompte.RH_ETAT_MAJOR ||
      typeCompte === TypeCompte.PERSONNEL;

    if (forbidsPerimetre && unitePerimetreId) {
      throw new BadRequestException({
        code: 'UTILISATEUR_PERIMETRE_FORBIDDEN',
        message: "Une unite de perimetre n'est pas autorisee pour ce type de compte.",
      });
    }
  }
}