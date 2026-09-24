import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDecorationDto {
  @ApiProperty({ example: 'Chevalier de la Legion d Honneur' })
  @IsString()
  @IsNotEmpty({ message: 'Le libelle est obligatoire.' })
  @MaxLength(200)
  libelle: string;

  @ApiPropertyOptional({ example: 'Decret n 2019-789' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  reference?: string;

  @ApiProperty({ example: '2019-07-14' })
  @IsDateString({}, { message: "La date d'effet doit etre valide." })
  dateEffet: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}