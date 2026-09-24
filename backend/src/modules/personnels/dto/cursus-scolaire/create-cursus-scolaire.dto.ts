import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCursusScolaireDto {
  @ApiProperty({ example: 'Universite d Antananarivo' })
  @IsString()
  @IsNotEmpty({ message: "L'etablissement est obligatoire." })
  @MaxLength(200)
  etablissement: string;

  @ApiPropertyOptional({ example: 'Antananarivo, Madagascar' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  villePays?: string;

  @ApiPropertyOptional({ example: '2005-09-01' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de debut doit etre valide.' })
  dateDebut?: string;

  @ApiPropertyOptional({ example: '2009-06-30' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit etre valide.' })
  dateFin?: string;

  @ApiPropertyOptional({ example: 'Licence en Droit' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  diplomeObtenu?: string;
}