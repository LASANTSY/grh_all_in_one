import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { ImportPersonnel, StatutImport } from './entities/import-personnel.entity';
import { LigneImport } from './entities/ligne-import.entity';
import { ExcelParserService } from './services/excel-parser.service';
import { ExcelValidatorService, ValidatedLigne } from './services/excel-validator.service';
import { ExcelImporterService } from './services/excel-importer.service';
import { ExcelTemplateService } from './services/excel-template.service';

import { ImportPreviewResponseDto } from './dto/import-preview.dto';
import { ImportExecuteDto, ActionImport } from './dto/import-execute.dto';
import {
  ImportDetailResponseDto,
  ImportResponseDto,
} from './dto/import-response.dto';

import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../common/utils/pagination.util';

interface PreviewSession {
  id: string;
  importateurId: string;
  nomFichier: string;
  expiresAt: number;
  lignes: ValidatedLigne[];
}

const PREVIEW_TTL_MS = 15 * 60 * 1000;
const PREVIEW_MAX_SESSIONS = 50;

export interface ImportScope {
  user: AuthenticatedUser;
}

@Injectable()
export class ImportsService {
  private readonly previewSessions = new Map<string, PreviewSession>();

  constructor(
    @InjectRepository(ImportPersonnel)
    private readonly importRepository: Repository<ImportPersonnel>,
    @InjectRepository(LigneImport)
    private readonly ligneRepository: Repository<LigneImport>,
    private readonly parser: ExcelParserService,
    private readonly validator: ExcelValidatorService,
    private readonly importer: ExcelImporterService,
    private readonly template: ExcelTemplateService,
  ) {}

  async generateTemplate(): Promise<Buffer> {
    return this.template.generate();
  }

  async preview(
    file: { originalname: string; buffer: Buffer },
    scope: ImportScope,
  ): Promise<ImportPreviewResponseDto> {
    this.assertCanImport(scope.user);

    const parsed = await this.parser.parse(file.buffer);
    const validated = await this.validator.validate(parsed.lignes);

    const sessionId = randomUUID();
    this.evictExpiredSessions();
    this.enforceSessionLimit();

    this.previewSessions.set(sessionId, {
      id: sessionId,
      importateurId: scope.user.compteId,
      nomFichier: file.originalname,
      expiresAt: Date.now() + PREVIEW_TTL_MS,
      lignes: validated,
    });

    const lignesValides = validated.filter((l) => l.valide).length;
    const lignesErreur = validated.filter((l) => !l.valide).length;
    const lignesDoublons = validated.filter(
      (l) => l.valide && l.personnelExistantId !== null,
    ).length;

    return {
      previewId: sessionId,
      nomFichier: file.originalname,
      nombreLignes: validated.length,
      lignesValides,
      lignesErreur,
      lignesDoublons,
      lignes: validated.map((l) => ({
        numeroLigne: l.numeroLigne,
        valeurs: l.valeurs,
        valide: l.valide,
        erreurs: l.erreurs.map((e) => ({
          numeroLigne: e.numeroLigne,
          champ: e.champ,
          message: e.message,
        })),
        personnelExistantId: l.personnelExistantId,
      })),
      colonnes: parsed.colonnes,
      colonnesManquantes: [],
    };
  }

  async execute(
    dto: ImportExecuteDto,
    scope: ImportScope,
  ): Promise<ImportDetailResponseDto> {
    this.assertCanImport(scope.user);

    const session = this.previewSessions.get(dto.previewId);
    if (!session) {
      throw new NotFoundException({
        code: 'IMPORT_PREVIEW_NOT_FOUND',
        message: 'La preview a expire ou est introuvable. Relancez l upload du fichier.',
      });
    }
    if (session.expiresAt < Date.now()) {
      this.previewSessions.delete(dto.previewId);
      throw new NotFoundException({
        code: 'IMPORT_PREVIEW_EXPIRED',
        message: 'La preview a expire. Relancez l upload du fichier.',
      });
    }
    if (session.importateurId !== scope.user.compteId) {
      throw new ForbiddenException({
        code: 'IMPORT_PREVIEW_NOT_OWNED',
        message: 'Cette preview ne vous appartient pas.',
      });
    }

    const importRecord = this.importRepository.create({
      importateurId: scope.user.compteId,
      dateImport: new Date(),
      nomFichierSource: session.nomFichier,
      cheminFichier: null,
      nombreLignes: session.lignes.length,
      statut: StatutImport.EN_COURS,
    });
    const savedImport = await this.importRepository.save(importRecord);

    const decisions = new Map<number, ActionImport>(
      dto.decisions.map((d) => [d.numeroLigne, d.action]),
    );

    await this.importer.execute({
      importId: savedImport.id,
      lignes: session.lignes,
      decisions,
    });

    this.previewSessions.delete(dto.previewId);

    return this.findById(savedImport.id);
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ImportResponseDto>> {
    const pagination = buildPagination(page, limit);

    const [data, total] = await this.importRepository.findAndCount({
      order: { dateImport: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return buildPaginatedResult(
      data.map((i) => this.toResponseDto(i)),
      total,
      pagination,
    );
  }

  async findById(id: string): Promise<ImportDetailResponseDto> {
    const record = await this.importRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException({
        code: 'IMPORT_NOT_FOUND',
        message: 'Import introuvable.',
      });
    }

    const lignes = await this.ligneRepository.find({
      where: { importId: id },
      order: { numeroLigne: 'ASC' },
    });

    return {
      ...this.toResponseDto(record),
      lignes: lignes.map((l) => ({
        id: l.id,
        numeroLigne: l.numeroLigne,
        statut: l.statut,
        actionAppliquee: l.actionAppliquee,
        messageErreur: l.messageErreur,
        personnelId: l.personnelId,
      })),
    };
  }

  private assertCanImport(user: AuthenticatedUser): void {
    if (
      user.typeCompte !== TypeCompte.ADMIN_SYSTEME &&
      user.typeCompte !== TypeCompte.RH_ETAT_MAJOR &&
      user.typeCompte !== TypeCompte.RH_BASE
    ) {
      throw new ForbiddenException({
        code: 'IMPORT_FORBIDDEN',
        message: "Vous n'etes pas autorise a importer du personnel.",
      });
    }
  }

  private evictExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.previewSessions.entries()) {
      if (session.expiresAt < now) {
        this.previewSessions.delete(id);
      }
    }
  }

  private enforceSessionLimit(): void {
    if (this.previewSessions.size < PREVIEW_MAX_SESSIONS) return;

    let oldestId: string | null = null;
    let oldestTime = Number.POSITIVE_INFINITY;
    for (const [id, session] of this.previewSessions.entries()) {
      if (session.expiresAt < oldestTime) {
        oldestTime = session.expiresAt;
        oldestId = id;
      }
    }
    if (oldestId) this.previewSessions.delete(oldestId);
  }

  private toResponseDto(record: ImportPersonnel): ImportResponseDto {
    return {
      id: record.id,
      dateImport: record.dateImport,
      nomFichierSource: record.nomFichierSource,
      nombreLignes: record.nombreLignes,
      lignesValides: record.lignesValides,
      lignesErreur: record.lignesErreur,
      lignesCreees: record.lignesCreees,
      lignesMisesAJour: record.lignesMisesAJour,
      statut: record.statut,
      messageErreur: record.messageErreur,
      createdAt: record.createdAt,
      importateurId: record.importateurId,
    };
  }
}