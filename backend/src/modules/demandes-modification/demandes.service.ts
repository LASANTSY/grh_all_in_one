import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  DemandeModification,
  StatutDemande,
} from './entities/demande-modification.entity';
import { CompteUtilisateur } from '../utilisateurs/entities/compte-utilisateur.entity';
import { Personnel } from '../personnels/entities/personnel.entity';
import { AuditService } from '../audit/audit.service';
import { ActionAudit } from '../audit/entities/entree-audit.entity';

import {
  CreateDemandeModificationDto,
  ChampModifiablePersonnel,
} from './dto/create-demande.dto';
import { DemandeModificationResponseDto } from './dto/demande-response.dto';
import { RejectDemandeDto } from './dto/reject-demande.dto';

import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../common/utils/pagination.util';

export interface DemandeScope {
  user: AuthenticatedUser;
}

@Injectable()
export class DemandesService {
  constructor(
    @InjectRepository(DemandeModification)
    private readonly demandeRepository: Repository<DemandeModification>,
    @InjectRepository(CompteUtilisateur)
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateDemandeModificationDto,
    scope: DemandeScope,
  ): Promise<DemandeModificationResponseDto> {
    if (scope.user.typeCompte !== TypeCompte.PERSONNEL) {
      throw new ForbiddenException({
        code: 'DEMANDE_CREATE_FORBIDDEN',
        message: 'Seul un agent peut proposer une modification de sa fiche.',
      });
    }
    if (!scope.user.personnelId) {
      throw new ForbiddenException({
        code: 'DEMANDE_NO_PERSONNEL',
        message: 'Votre compte n est rattache a aucune fiche personnel.',
      });
    }

    const personnel = await this.personnelRepository.findOne({
      where: { id: scope.user.personnelId },
    });
    if (!personnel) {
      throw new NotFoundException({
        code: 'DEMANDE_PERSONNEL_NOT_FOUND',
        message: 'Fiche personnel introuvable.',
      });
    }

    const champ = dto.champModifie as ChampModifiablePersonnel;
    const ancienneValeur = this.readField(personnel, champ);
    const nouvelleValeur = dto.nouvelleValeur.trim();

    if (ancienneValeur !== null && ancienneValeur === nouvelleValeur) {
      throw new BadRequestException({
        code: 'DEMANDE_NO_CHANGE',
        message: 'La nouvelle valeur est identique a la valeur actuelle.',
      });
    }

    const enAttente = await this.demandeRepository.findOne({
      where: {
        personnelId: personnel.id,
        champModifie: champ,
        statut: StatutDemande.EN_ATTENTE,
      },
    });
    if (enAttente) {
      throw new ConflictException({
        code: 'DEMANDE_ALREADY_PENDING',
        message: 'Une demande en attente existe deja pour ce champ.',
      });
    }

    const demande = this.demandeRepository.create({
      personnelId: personnel.id,
      demandeurId: scope.user.compteId,
      champModifie: champ,
      ancienneValeur,
      nouvelleValeur,
      statut: StatutDemande.EN_ATTENTE,
      dateDemande: new Date(),
    });

    const saved = await this.demandeRepository.save(demande);

    await this.auditService.record(
      {
        action: ActionAudit.MODIFICATION,
        entiteType: 'DemandeModification',
        entiteId: saved.id,
        personnelId: personnel.id,
        champModifie: saved.champModifie,
        ancienneValeur: saved.ancienneValeur,
        nouvelleValeur: saved.nouvelleValeur,
      },
      { auteurId: scope.user.compteId },
    );

    return this.toResponseDto(saved, personnel.id);
  }

  async findAll(
    scope: DemandeScope,
    statut?: StatutDemande,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<DemandeModificationResponseDto>> {
    const pagination = buildPagination(page, limit);

    const qb = this.demandeRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.demandeur', 'demandeur')
      .leftJoinAndSelect('d.valideur', 'valideur')
      .orderBy('d.dateDemande', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (scope.user.typeCompte === TypeCompte.PERSONNEL) {
      if (!scope.user.personnelId) {
        throw new ForbiddenException({
          code: 'DEMANDE_NO_PERSONNEL',
          message: 'Votre compte n est rattache a aucune fiche personnel.',
        });
      }
      qb.andWhere('d.personnelId = :pid', { pid: scope.user.personnelId });
    } else if (
      scope.user.typeCompte === TypeCompte.RH_BASE ||
      scope.user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      if (!scope.user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'DEMANDE_PERIMETRE_MISSING',
          message: 'Aucun perimetre organisationnel associe a votre compte.',
        });
      }
      qb.innerJoin('d.personnel', 'p').andWhere('p.uniteId = :uid', {
        uid: scope.user.unitePerimetreId,
      });
    }

    if (statut) {
      qb.andWhere('d.statut = :statut', { statut });
    }

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data.map((d) => this.toResponseDto(d)), total, pagination);
  }

  async findById(id: string, scope: DemandeScope): Promise<DemandeModificationResponseDto> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: { demandeur: true, valideur: true, personnel: true },
    });
    if (!demande) {
      throw new NotFoundException({
        code: 'DEMANDE_NOT_FOUND',
        message: 'Demande introuvable.',
      });
    }
    this.assertCanAccess(demande, scope.user);
    return this.toResponseDto(demande);
  }

  async valider(id: string, scope: DemandeScope): Promise<DemandeModificationResponseDto> {
    if (scope.user.typeCompte === TypeCompte.PERSONNEL) {
      throw new ForbiddenException({
        code: 'DEMANDE_VALIDATE_FORBIDDEN',
        message: 'Un agent ne peut pas valider ses propres demandes.',
      });
    }
    if (scope.user.typeCompte === TypeCompte.CHEF_COMMANDEMENT) {
      throw new ForbiddenException({
        code: 'DEMANDE_VALIDATE_FORBIDDEN',
        message: 'Ce profil ne peut pas valider de demandes.',
      });
    }

    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: { personnel: true, demandeur: true },
    });
    if (!demande) {
      throw new NotFoundException({
        code: 'DEMANDE_NOT_FOUND',
        message: 'Demande introuvable.',
      });
    }
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException({
        code: 'DEMANDE_ALREADY_TREATED',
        message: 'Cette demande a deja ete traitee.',
      });
    }

    if (scope.user.typeCompte === TypeCompte.RH_BASE) {
      if (
        !scope.user.unitePerimetreId ||
        demande.personnel.uniteId !== scope.user.unitePerimetreId
      ) {
        throw new ForbiddenException({
          code: 'DEMANDE_OUT_OF_PERIMETRE',
          message: 'Cette demande n appartient pas a votre perimetre.',
        });
      }
    }

    const personnel = await this.personnelRepository.findOne({
      where: { id: demande.personnelId },
    });
    if (!personnel) {
      throw new NotFoundException({
        code: 'DEMANDE_PERSONNEL_NOT_FOUND',
        message: 'Fiche personnel introuvable.',
      });
    }

    this.writeField(
      personnel,
      demande.champModifie as ChampModifiablePersonnel,
      demande.nouvelleValeur,
    );
    await this.personnelRepository.save(personnel);

    demande.statut = StatutDemande.VALIDEE;
    demande.dateTraitement = new Date();
    demande.valideurId = scope.user.compteId;
    const saved = await this.demandeRepository.save(demande);

    await this.auditService.record(
      {
        action: ActionAudit.VALIDATION,
        entiteType: 'DemandeModification',
        entiteId: saved.id,
        personnelId: personnel.id,
        champModifie: saved.champModifie,
        ancienneValeur: saved.ancienneValeur,
        nouvelleValeur: saved.nouvelleValeur,
      },
      { auteurId: scope.user.compteId },
    );

    return this.toResponseDto(saved, personnel.id);
  }

  async rejeter(
    id: string,
    dto: RejectDemandeDto,
    scope: DemandeScope,
  ): Promise<DemandeModificationResponseDto> {
    if (scope.user.typeCompte === TypeCompte.PERSONNEL) {
      throw new ForbiddenException({
        code: 'DEMANDE_REJECT_FORBIDDEN',
        message: 'Un agent ne peut pas rejeter ses propres demandes.',
      });
    }
    if (scope.user.typeCompte === TypeCompte.CHEF_COMMANDEMENT) {
      throw new ForbiddenException({
        code: 'DEMANDE_REJECT_FORBIDDEN',
        message: 'Ce profil ne peut pas rejeter de demandes.',
      });
    }

    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: { personnel: true },
    });
    if (!demande) {
      throw new NotFoundException({
        code: 'DEMANDE_NOT_FOUND',
        message: 'Demande introuvable.',
      });
    }
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException({
        code: 'DEMANDE_ALREADY_TREATED',
        message: 'Cette demande a deja ete traitee.',
      });
    }

    if (scope.user.typeCompte === TypeCompte.RH_BASE) {
      if (
        !scope.user.unitePerimetreId ||
        demande.personnel.uniteId !== scope.user.unitePerimetreId
      ) {
        throw new ForbiddenException({
          code: 'DEMANDE_OUT_OF_PERIMETRE',
          message: 'Cette demande n appartient pas a votre perimetre.',
        });
      }
    }

    demande.statut = StatutDemande.REJETEE;
    demande.dateTraitement = new Date();
    demande.valideurId = scope.user.compteId;
    demande.motifRejet = dto.motifRejet.trim();
    const saved = await this.demandeRepository.save(demande);

    await this.auditService.record(
      {
        action: ActionAudit.REJET,
        entiteType: 'DemandeModification',
        entiteId: saved.id,
        personnelId: demande.personnelId,
        champModifie: saved.champModifie,
        ancienneValeur: saved.ancienneValeur,
        nouvelleValeur: null,
      },
      { auteurId: scope.user.compteId },
    );

    return this.toResponseDto(saved, demande.personnelId);
  }

  // ============================================================
  // UTILITAIRES PRIVES
  // ============================================================

  private assertCanAccess(demande: DemandeModification, user: AuthenticatedUser): void {
    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return;
    }
    if (user.typeCompte === TypeCompte.PERSONNEL) {
      if (user.personnelId !== demande.personnelId) {
        throw new ForbiddenException({
          code: 'DEMANDE_OUT_OF_SELF',
          message: 'Vous ne pouvez consulter que vos propres demandes.',
        });
      }
      return;
    }
    if (
      user.typeCompte === TypeCompte.RH_BASE ||
      user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      if (!user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'DEMANDE_PERIMETRE_MISSING',
          message: 'Aucun perimetre organisationnel associe a votre compte.',
        });
      }
      return;
    }
    throw new ForbiddenException({
      code: 'DEMANDE_ACCESS_FORBIDDEN',
      message: 'Acces refuse.',
    });
  }

  private readField(personnel: Personnel, champ: ChampModifiablePersonnel): string | null {
    const value = (personnel as unknown as Record<string, unknown>)[champ];
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value);
  }

  private writeField(
    personnel: Personnel,
    champ: ChampModifiablePersonnel,
    valeur: string,
  ): void {
    const dateFields: ChampModifiablePersonnel[] = ['dateNaissanceConjoint'];
    const target = personnel as unknown as Record<string, unknown>;

    if (dateFields.includes(champ)) {
      target[champ] = new Date(valeur);
    } else {
      target[champ] = valeur;
    }
  }

  private toResponseDto(
    demande: DemandeModification,
    _personnelId?: string,
  ): DemandeModificationResponseDto {
    return {
      id: demande.id,
      personnelId: demande.personnelId,
      demandeurId: demande.demandeurId,
      demandeurIdentifiant: demande.demandeur?.identifiant ?? null,
      champModifie: demande.champModifie,
      ancienneValeur: demande.ancienneValeur,
      nouvelleValeur: demande.nouvelleValeur,
      statut: demande.statut,
      dateDemande: demande.dateDemande,
      dateTraitement: demande.dateTraitement,
      valideurId: demande.valideurId,
      valideurIdentifiant: demande.valideur?.identifiant ?? null,
      motifRejet: demande.motifRejet,
      createdAt: demande.createdAt,
    };
  }
}