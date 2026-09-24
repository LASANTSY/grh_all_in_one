import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUniteDto } from './create-unite.dto';

export class UpdateUniteDto extends PartialType(CreateUniteDto) {
  @ApiPropertyOptional({ description: "Statut actif/inactif de l'unite" })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}