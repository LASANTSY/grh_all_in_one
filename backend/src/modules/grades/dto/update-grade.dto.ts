import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateGradeDto } from './create-grade.dto';

export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  @ApiPropertyOptional({ description: 'Statut actif/inactif du grade' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}