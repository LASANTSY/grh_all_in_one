import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAffectationDto {
  @ApiProperty({ description: "Identifiant de l'unite d'affectation" })
  @IsUUID('4', { message: "L'unite doit etre un identifiant valide." })
  uniteId: string;

  @ApiPropertyOptional({ example: 'Decision n 2021-045' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  decision?: string;

  @ApiProperty({ example: '2021-01-01' })
  @IsDateString({}, { message: "La date d'effet doit etre valide." })
  dateEffet: string;

  @ApiPropertyOptional({ example: 'Commandant en second' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fonctionEmploi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}