import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { TypeCompte } from '../../../common/enums/type-compte.enum';

export class CreateUtilisateurDto {
  @ApiProperty({ description: 'Identifiant unique du compte', example: 'jdoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  identifiant: string;

  @ApiProperty({ enum: TypeCompte })
  @IsEnum(TypeCompte)
  typeCompte: TypeCompte;

  @ApiProperty({ nullable: true, description: 'Identifiant de la fiche Personnel rattachee' })
  @IsOptional()
  @IsUUID()
  personnelId?: string | null;

  @ApiProperty({
    nullable: true,
    description: "Identifiant de l'unite de perimetre (RH base / Chef)",
  })
  @IsOptional()
  @IsUUID()
  unitePerimetreId?: string | null;
}