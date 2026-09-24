import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBaseDto } from './create-base.dto';

export class UpdateBaseDto extends PartialType(CreateBaseDto) {
  @ApiPropertyOptional({ description: 'Statut actif/inactif de la base' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}