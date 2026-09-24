import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateHistoriqueGradeDto {
  @ApiProperty({ description: 'Identifiant du grade' })
  @IsUUID('4', { message: 'Le grade doit etre un identifiant valide.' })
  gradeId: string;

  @ApiPropertyOptional({ example: 'Decret n 2020-123' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  referenceDecret?: string;

  @ApiProperty({ example: '2020-06-15' })
  @IsDateString({}, { message: 'La date de prise de commandement doit etre valide.' })
  datePriseCommandement: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}