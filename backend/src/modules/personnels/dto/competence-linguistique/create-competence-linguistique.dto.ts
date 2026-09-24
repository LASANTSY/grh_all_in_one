import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NiveauCompetence } from '../../entities/competence-linguistique.entity';

export class CreateCompetenceLinguistiqueDto {
  @ApiProperty({ example: 'Anglais' })
  @IsString()
  @IsNotEmpty({ message: 'La langue est obligatoire.' })
  @MaxLength(100)
  langue: string;

  @ApiProperty({ enum: NiveauCompetence, example: NiveauCompetence.MOYEN })
  @IsEnum(NiveauCompetence, { message: 'Le niveau ecrit est invalide.' })
  niveauEcrit: NiveauCompetence;

  @ApiProperty({ enum: NiveauCompetence, example: NiveauCompetence.AVANCE })
  @IsEnum(NiveauCompetence, { message: 'Le niveau parle est invalide.' })
  niveauParle: NiveauCompetence;
}