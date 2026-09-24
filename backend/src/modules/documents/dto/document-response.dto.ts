import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VersionPieceJointeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  numeroVersion: number;

  @ApiProperty()
  nomOriginal: string;

  @ApiProperty()
  format: string;

  @ApiProperty({ description: 'Taille du fichier en octets' })
  tailleOctets: string;

  @ApiProperty()
  dateDepot: Date;

  @ApiProperty()
  versionCourante: boolean;

  @ApiPropertyOptional({ nullable: true })
  deposeParId: string | null;
}

export class PieceJointeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personnelId: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional({ nullable: true })
  libelle: string | null;

  @ApiProperty()
  dateAjout: Date;

  @ApiProperty()
  actif: boolean;

  @ApiPropertyOptional({ type: VersionPieceJointeResponseDto, nullable: true })
  versionCourante: VersionPieceJointeResponseDto | null;

  @ApiProperty({ description: 'Nombre total de versions' })
  nombreVersions: number;
}

export class PieceJointeDetailResponseDto extends PieceJointeResponseDto {
  @ApiProperty({ type: [VersionPieceJointeResponseDto] })
  versions: VersionPieceJointeResponseDto[];
}