import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSpecialiteDto } from './create-specialite.dto';

export class UpdateSpecialiteDto extends PartialType(CreateSpecialiteDto) {
  @ApiPropertyOptional({ description: 'Statut actif/inactif de la specialite' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}