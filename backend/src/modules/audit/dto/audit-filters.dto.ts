import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ActionAudit } from '../entities/entree-audit.entity';

export class AuditFiltersDto {
  @ApiPropertyOptional({ enum: ActionAudit })
  @IsOptional()
  @IsEnum(ActionAudit)
  action?: ActionAudit;

  @ApiPropertyOptional()
  @IsOptional()
  entiteType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entiteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  personnelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  auteurId?: string;

  @ApiPropertyOptional({ description: 'Date de debut (ISO)' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO)' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}