import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { GradeCategorie } from '../enums/grade-categorie.enum';

export class CreateGradeDto {
  @ApiProperty({ example: 'Capitaine de Vaisseau', description: 'Libelle du grade' })
  @IsString()
  @IsNotEmpty({ message: 'Le libelle est obligatoire.' })
  @MinLength(2, { message: 'Le libelle doit contenir au moins 2 caracteres.' })
  @MaxLength(100, { message: 'Le libelle ne peut pas depasser 100 caracteres.' })
  libelle: string;

  @ApiProperty({
    enum: GradeCategorie,
    example: GradeCategorie.OFFICIER_MARINE,
    description: 'Categorie du grade',
  })
  @IsEnum(GradeCategorie, { message: 'La categorie est invalide.' })
  categorie: GradeCategorie;

  @ApiProperty({
    example: 58,
    description: "Age de depart a la retraite selon le grade",
  })
  @IsInt({ message: "L'age de depart doit etre un entier." })
  @Min(30, { message: "L'age de depart doit etre au moins 30." })
  @Max(80, { message: "L'age de depart ne peut pas depasser 80." })
  ageDepartRetraite: number;

  @ApiProperty({
    example: 10,
    description: 'Position du grade dans le classement hierarchique (croissant)',
  })
  @IsInt({ message: "L'ordre doit etre un entier." })
  @Min(1, { message: "L'ordre doit etre superieur ou egal a 1." })
  @Max(1000, { message: "L'ordre ne peut pas depasser 1000." })
  ordre: number;
}