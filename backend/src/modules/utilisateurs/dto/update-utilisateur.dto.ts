import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TypeCompte } from '../../../common/enums/type-compte.enum';

export class UpdateUtilisateurDto {
  @ApiPropertyOptional({ enum: TypeCompte })
  @IsOptional()
  @IsEnum(TypeCompte)
  typeCompte?: TypeCompte;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  unitePerimetreId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  compteVerrouille?: boolean;
}