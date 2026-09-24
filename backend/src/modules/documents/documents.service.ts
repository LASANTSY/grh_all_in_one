import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { PieceJointe } from './entities/piece-jointe.entity';
import { VersionPieceJointe } from './entities/version-piece-jointe.entity';
import { Personnel } from '../personnels/entities/personnel.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import {
  PieceJointeDetailResponseDto,
  PieceJointeResponseDto,
  VersionPieceJointeResponseDto,
} from './dto/document-response.dto';
import { StorageService, STORAGE_SERVICE } from './storage/storage.interface';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../common/enums/type-compte.enum';

export interface UploadedFilePayload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface DocumentScope {
  user: AuthenticatedUser;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(PieceJointe)
    private readonly pieceJointeRepository: Repository<PieceJointe>,
    @InjectRepository(VersionPieceJointe)
    private readonly versionRepository: Repository<VersionPieceJointe>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async listForPersonnel(
    personnelId: string,
    scope: DocumentScope,
  ): Promise<PieceJointeResponseDto[]> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'read');

    const pieces = await this.pieceJointeRepository.find({
      where: { personnelId, actif: true },
      order: { dateAjout: 'DESC' },
    });

    if (pieces.length === 0) return [];

    const versions = await this.versionRepository.find({
      where: pieces.map((p) => ({ pieceJointeId: p.id })),
      order: { numeroVersion: 'DESC' },
    });

    const versionsByPiece = new Map<string, VersionPieceJointe[]>();
    for (const v of versions) {
      const list = versionsByPiece.get(v.pieceJointeId) ?? [];
      list.push(v);
      versionsByPiece.set(v.pieceJointeId, list);
    }

    return pieces.map((p) => this.toResponseDto(p, versionsByPiece.get(p.id) ?? []));
  }

  async getDetail(
    personnelId: string,
    pieceJointeId: string,
    scope: DocumentScope,
  ): Promise<PieceJointeDetailResponseDto> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'read');

    const piece = await this.pieceJointeRepository.findOne({
      where: { id: pieceJointeId, personnelId },
    });
    if (!piece) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Piece jointe introuvable.',
      });
    }

    const versions = await this.versionRepository.find({
      where: { pieceJointeId },
      order: { numeroVersion: 'DESC' },
    });

    return {
      ...this.toResponseDto(piece, versions),
      versions: versions.map((v) => this.toVersionDto(v)),
    };
  }

  async upload(
    personnelId: string,
    dto: UploadDocumentDto,
    file: UploadedFilePayload,
    scope: DocumentScope,
  ): Promise<PieceJointeDetailResponseDto> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'write');
    this.validateFile(file);

    const piece = this.pieceJointeRepository.create({
      personnelId,
      type: dto.type,
      libelle: dto.libelle ?? null,
      dateAjout: new Date(),
      actif: true,
    });
    const savedPiece = await this.pieceJointeRepository.save(piece);

    const version = await this.persistVersion(savedPiece.id, 1, file, scope.user.compteId);

    return {
      id: savedPiece.id,
      personnelId: savedPiece.personnelId,
      type: savedPiece.type,
      libelle: savedPiece.libelle,
      dateAjout: savedPiece.dateAjout,
      actif: savedPiece.actif,
      versionCourante: this.toVersionDto(version),
      nombreVersions: 1,
      versions: [this.toVersionDto(version)],
    };
  }

  async addVersion(
    personnelId: string,
    pieceJointeId: string,
    file: UploadedFilePayload,
    scope: DocumentScope,
  ): Promise<PieceJointeDetailResponseDto> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'write');
    this.validateFile(file);

    const piece = await this.pieceJointeRepository.findOne({
      where: { id: pieceJointeId, personnelId, actif: true },
    });
    if (!piece) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Piece jointe introuvable.',
      });
    }

    const maxVersion = await this.versionRepository
      .createQueryBuilder('v')
      .select('MAX(v.numeroVersion)', 'max')
      .where('v.pieceJointeId = :pieceJointeId', { pieceJointeId })
      .getRawOne<{ max: number | null }>();

    const nextVersion = (maxVersion?.max ?? 0) + 1;

    await this.versionRepository.update(
      { pieceJointeId, versionCourante: true },
      { versionCourante: false },
    );

    const version = await this.persistVersion(
      pieceJointeId,
      nextVersion,
      file,
      scope.user.compteId,
    );

    const versions = await this.versionRepository.find({
      where: { pieceJointeId },
      order: { numeroVersion: 'DESC' },
    });

    return {
      ...this.toResponseDto(piece, versions),
      versions: versions.map((v) => this.toVersionDto(v)),
      versionCourante: this.toVersionDto(version),
    };
  }

  async download(
    personnelId: string,
    pieceJointeId: string,
    scope: DocumentScope,
  ): Promise<{ buffer: Buffer; nomOriginal: string; format: string }> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'read');

    const version = await this.versionRepository
      .createQueryBuilder('v')
      .innerJoin('v.pieceJointe', 'p')
      .where('v.pieceJointeId = :pieceJointeId', { pieceJointeId })
      .andWhere('p.personnelId = :personnelId', { personnelId })
      .andWhere('v.versionCourante = :current', { current: true })
      .getOne();

    if (!version) {
      throw new NotFoundException({
        code: 'DOCUMENT_VERSION_NOT_FOUND',
        message: 'Aucune version courante pour cette piece jointe.',
      });
    }

    const buffer = await this.storage.download(version.fichierPath);
    return { buffer, nomOriginal: version.nomOriginal, format: version.format };
  }

  async remove(
    personnelId: string,
    pieceJointeId: string,
    scope: DocumentScope,
  ): Promise<void> {
    await this.assertPersonnelAccess(personnelId, scope.user, 'write');

    const piece = await this.pieceJointeRepository.findOne({
      where: { id: pieceJointeId, personnelId },
    });
    if (!piece) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Piece jointe introuvable.',
      });
    }

    piece.actif = false;
    await this.pieceJointeRepository.save(piece);
  }

  // ============================================================
  // UTILITAIRES PRIVES
  // ============================================================

  private async persistVersion(
    pieceJointeId: string,
    numeroVersion: number,
    file: UploadedFilePayload,
    deposeParId: string,
  ): Promise<VersionPieceJointe> {
    const extension = extname(file.originalname).toLowerCase().replace('.', '') || 'bin';
    const storagePath = `${this.resolveFolder(pieceJointeId)}/v${numeroVersion}-${randomUUID()}.${extension}`;

    await this.storage.upload(file.buffer, storagePath, file.mimetype);

    const version = this.versionRepository.create({
      pieceJointeId,
      numeroVersion,
      fichierPath: storagePath,
      nomOriginal: file.originalname,
      format: file.mimetype,
      tailleOctets: file.size.toString(),
      dateDepot: new Date(),
      deposeParId,
      versionCourante: true,
    });

    return this.versionRepository.save(version);
  }

  private resolveFolder(pieceJointeId: string): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `documents/${year}/${month}/${pieceJointeId}`;
  }

  private validateFile(file: UploadedFilePayload): void {
    if (!file || !file.buffer || file.size <= 0) {
      throw new BadRequestException({
        code: 'DOCUMENT_EMPTY',
        message: 'Le fichier envoye est vide.',
      });
    }

    const maxMb = this.configService.get<number>('storage.maxFileSizeMb', 10);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException({
        code: 'DOCUMENT_TOO_LARGE',
        message: `Le fichier depasse la taille maximale autorisee (${maxMb} Mo).`,
      });
    }

    const allowed = this.configService.get<string[]>('storage.allowedMimeTypes', []);
    if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
      throw new BadRequestException({
        code: 'DOCUMENT_INVALID_MIME',
        message: 'Ce type de fichier n est pas autorise.',
      });
    }
  }

  private async assertPersonnelAccess(
    personnelId: string,
    user: AuthenticatedUser,
    mode: 'read' | 'write',
  ): Promise<void> {
    const personnel = await this.personnelRepository.findOne({
      where: { id: personnelId },
      select: { id: true, uniteId: true },
    });
    if (!personnel) {
      throw new NotFoundException({
        code: 'PERSONNEL_NOT_FOUND',
        message: 'Fiche personnel introuvable.',
      });
    }

    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return;
    }

    if (user.typeCompte === TypeCompte.RH_BASE) {
      if (!user.unitePerimetreId || personnel.uniteId !== user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'DOCUMENT_OUT_OF_PERIMETRE',
          message: "Cette piece jointe n'appartient pas a votre perimetre.",
        });
      }
      return;
    }

    if (user.typeCompte === TypeCompte.CHEF_COMMANDEMENT) {
      if (mode === 'write') {
        throw new ForbiddenException({
          code: 'DOCUMENT_READ_ONLY',
          message: 'Votre profil ne permet que la consultation des documents.',
        });
      }
      if (!user.unitePerimetreId || personnel.uniteId !== user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'DOCUMENT_OUT_OF_PERIMETRE',
          message: "Cette piece jointe n'appartient pas a votre perimetre.",
        });
      }
      return;
    }

    if (user.typeCompte === TypeCompte.PERSONNEL) {
      if (user.personnelId !== personnel.id) {
        throw new ForbiddenException({
          code: 'DOCUMENT_OUT_OF_SELF',
          message: 'Vous ne pouvez acceder qu a vos propres documents.',
        });
      }
      return;
    }

    throw new ForbiddenException({
      code: 'DOCUMENT_ACCESS_FORBIDDEN',
      message: 'Acces refuse.',
    });
  }

  private toResponseDto(
    piece: PieceJointe,
    versions: VersionPieceJointe[],
  ): PieceJointeResponseDto {
    const courante = versions.find((v) => v.versionCourante) ?? versions[0] ?? null;
    return {
      id: piece.id,
      personnelId: piece.personnelId,
      type: piece.type,
      libelle: piece.libelle,
      dateAjout: piece.dateAjout,
      actif: piece.actif,
      versionCourante: courante ? this.toVersionDto(courante) : null,
      nombreVersions: versions.length,
    };
  }

  private toVersionDto(version: VersionPieceJointe): VersionPieceJointeResponseDto {
    return {
      id: version.id,
      numeroVersion: version.numeroVersion,
      nomOriginal: version.nomOriginal,
      format: version.format,
      tailleOctets: version.tailleOctets,
      dateDepot: version.dateDepot,
      versionCourante: version.versionCourante,
      deposeParId: version.deposeParId,
    };
  }
}