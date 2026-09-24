import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const ENFANT_LIENS_PARENTE = ['Fils', 'Fille', 'Adopte', 'Autre'] as const;

export class CreateEnfantDto {
  @ApiProperty({ example: 1, description: "Rang de l'enfant" })
  @IsInt()
  @Min(1)
  @Max(50)
  rang: number;

  @ApiProperty({ example: 'RAKOTO' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MinLength(1)
  @MaxLength(100)
  nom: string;

  @ApiProperty({ example: 'Marie' })
  @IsString()
  @IsNotEmpty({ message: 'Les prenoms sont obligatoires.' })
  @MinLength(1)
  @MaxLength(150)
  prenoms: string;

  @ApiProperty({ example: '2015-04-10' })
  @IsDateString({}, { message: 'La date de naissance doit etre valide.' })
  dateNaissance: string;

  @ApiProperty({ example: 'F', description: 'Sexe : M ou F' })
  @IsString()
  @IsIn(['M', 'F'], { message: 'Le sexe doit etre M ou F.' })
  sexe: string;

  @ApiProperty({ example: 'Fils', enum: ENFANT_LIENS_PARENTE })
  @IsString()
  @IsIn(ENFANT_LIENS_PARENTE, { message: 'Le lien de parente est invalide.' })
  lienParente: string;
}