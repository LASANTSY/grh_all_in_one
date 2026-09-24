import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutDemande } from '../entities/demande-modification.entity';

export class DemandeModificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personnelId: string;

  @ApiProperty()
  demandeurId: string;

  @ApiPropertyOptional({ nullable: true })
  demandeurIdentifiant: string | null;

  @ApiProperty()
  champModifie: string;

  @ApiPropertyOptional({ nullable: true })
  ancienneValeur: string | null;

  @ApiProperty()
  nouvelleValeur: string;

  @ApiProperty({ enum: StatutDemande })
  statut: StatutDemande;

  @ApiProperty()
  dateDemande: Date;

  @ApiPropertyOptional({ nullable: true })
  dateTraitement: Date | null;

  @ApiPropertyOptional({ nullable: true })
  valideurId: string | null;

  @ApiPropertyOptional({ nullable: true })
  valideurIdentifiant: string | null;

  @ApiPropertyOptional({ nullable: true })
  motifRejet: string | null;

  @ApiProperty()
  createdAt: Date;
}