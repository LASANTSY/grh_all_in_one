import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EntreeAudit, ActionAudit } from './entities/entree-audit.entity';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../common/utils/pagination.util';

export interface AuditContext {
  auteurId: string | null;
  adresseIp?: string | null;
  userAgent?: string | null;
}

export interface AuditEntryInput {
  action: ActionAudit;
  entiteType: string;
  entiteId: string;
  personnelId?: string | null;
  champModifie?: string | null;
  ancienneValeur?: string | null;
  nouvelleValeur?: string | null;
}

export interface AuditFindOptions {
  action?: ActionAudit;
  entiteType?: string;
  entiteId?: string;
  personnelId?: string;
  auteurId?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(EntreeAudit)
    private readonly auditRepository: Repository<EntreeAudit>,
  ) {}

  /**
   * Enregistre une entree d'audit.
   *
   * Ne jamais faire echouer l'action metier a cause de l'audit : les erreurs
   * sont logguees mais non propagees.
   */
  async record(input: AuditEntryInput, context: AuditContext): Promise<void> {
    try {
      const entry = this.auditRepository.create({
        action: input.action,
        entiteType: input.entiteType,
        entiteId: input.entiteId,
        personnelId: input.personnelId ?? null,
        auteurId: context.auteurId,
        champModifie: input.champModifie ?? null,
        ancienneValeur: input.ancienneValeur ?? null,
        nouvelleValeur: input.nouvelleValeur ?? null,
        adresseIp: context.adresseIp ?? null,
        userAgent: context.userAgent ?? null,
        dateHeure: new Date(),
      });
      await this.auditRepository.save(entry);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Echec enregistrement audit : ${message}`);
    }
  }

  /**
   * Enregistre plusieurs entrees d'audit d'un coup (import, batch).
   */
  async recordMany(
    inputs: AuditEntryInput[],
    context: AuditContext,
  ): Promise<void> {
    if (inputs.length === 0) return;
    try {
      const entries = inputs.map((input) =>
        this.auditRepository.create({
          action: input.action,
          entiteType: input.entiteType,
          entiteId: input.entiteId,
          personnelId: input.personnelId ?? null,
          auteurId: context.auteurId,
          champModifie: input.champModifie ?? null,
          ancienneValeur: input.ancienneValeur ?? null,
          nouvelleValeur: input.nouvelleValeur ?? null,
          adresseIp: context.adresseIp ?? null,
          userAgent: context.userAgent ?? null,
          dateHeure: new Date(),
        }),
      );
      await this.auditRepository.save(entries);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Echec enregistrement audit batch : ${message}`);
    }
  }

  async findAll(
    options: AuditFindOptions,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EntreeAudit>> {
    const pagination = buildPagination(page, limit);

    const qb = this.auditRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.auteur', 'auteur')
      .orderBy('a.dateHeure', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit);

    if (options.action) qb.andWhere('a.action = :action', { action: options.action });
    if (options.entiteType)
      qb.andWhere('a.entiteType = :entiteType', { entiteType: options.entiteType });
    if (options.entiteId) qb.andWhere('a.entiteId = :entiteId', { entiteId: options.entiteId });
    if (options.personnelId)
      qb.andWhere('a.personnelId = :personnelId', { personnelId: options.personnelId });
    if (options.auteurId) qb.andWhere('a.auteurId = :auteurId', { auteurId: options.auteurId });
    if (options.dateDebut)
      qb.andWhere('a.dateHeure >= :dateDebut', { dateDebut: options.dateDebut });
    if (options.dateFin) qb.andWhere('a.dateHeure <= :dateFin', { dateFin: options.dateFin });

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination);
  }

  async findById(id: string): Promise<EntreeAudit | null> {
    return this.auditRepository.findOne({
      where: { id },
      relations: { auteur: true, personnel: true },
    });
  }
}