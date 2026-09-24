import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export const PERSONNEL_SORT_FIELDS = [
  'nom',
  'prenoms',
  'matriculeRecrutement',
  'dateNaissance',
  'createdAt',
] as const;

export type PersonnelSortField = (typeof PERSONNEL_SORT_FIELDS)[number];
export type SortOrder = 'ASC' | 'DESC';

export class SearchPersonnelDto {
  @ApiPropertyOptional({ description: 'Recherche floue sur nom et prenoms' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenoms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matriculeRecrutement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matriculeFinancier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroCIN?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  uniteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  baseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  specialiteId?: string;

  @ApiPropertyOptional({ description: 'Date de naissance exacte (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @ApiPropertyOptional({ description: 'Ne de apres cette date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateNaissanceMin?: string;

  @ApiPropertyOptional({ description: 'Ne avant cette date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateNaissanceMax?: string;

  @ApiPropertyOptional({ description: 'Filtre actif/inactif' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: PERSONNEL_SORT_FIELDS, default: 'nom' })
  @IsOptional()
  @IsIn(PERSONNEL_SORT_FIELDS)
  sortBy?: PersonnelSortField;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: SortOrder;
}