import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePersonnelDto } from './create-personnel.dto';

export class UpdatePersonnelDto extends PartialType(CreatePersonnelDto) {
  @ApiPropertyOptional({ description: 'Statut actif/inactif de la fiche' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}