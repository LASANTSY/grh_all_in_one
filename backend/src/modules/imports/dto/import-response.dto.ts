import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutImport } from '../entities/import-personnel.entity';
import {
  StatutLigneImport,
  ActionLigneImport,
} from '../entities/ligne-import.entity';

export class ImportLigneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  numeroLigne: number;

  @ApiProperty({ enum: StatutLigneImport })
  statut: StatutLigneImport;

  @ApiProperty({ enum: ActionLigneImport, nullable: true })
  actionAppliquee: ActionLigneImport | null;

  @ApiPropertyOptional({ nullable: true })
  messageErreur: string | null;

  @ApiPropertyOptional({ nullable: true })
  personnelId: string | null;
}

export class ImportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dateImport: Date;

  @ApiProperty()
  nomFichierSource: string;

  @ApiProperty()
  nombreLignes: number;

  @ApiProperty()
  lignesValides: number;

  @ApiProperty()
  lignesErreur: number;

  @ApiProperty()
  lignesCreees: number;

  @ApiProperty()
  lignesMisesAJour: number;

  @ApiProperty({ enum: StatutImport })
  statut: StatutImport;

  @ApiPropertyOptional({ nullable: true })
  messageErreur: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ nullable: true })
  importateurId: string | null;
}

export class ImportDetailResponseDto extends ImportResponseDto {
  @ApiProperty({ type: [ImportLigneResponseDto] })
  lignes: ImportLigneResponseDto[];
}