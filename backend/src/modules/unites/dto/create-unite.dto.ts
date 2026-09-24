import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateUniteDto {
  @ApiProperty({ example: 'RC TROZONA', description: "Nom de l'unite" })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres.' })
  @MaxLength(150, { message: 'Le nom ne peut pas depasser 150 caracteres.' })
  nom: string;

  @ApiProperty({ example: 'RC-TROZONA', description: "Code unique de l'unite" })
  @IsString()
  @IsNotEmpty({ message: 'Le code est obligatoire.' })
  @MinLength(2, { message: 'Le code doit contenir au moins 2 caracteres.' })
  @MaxLength(20, { message: 'Le code ne peut pas depasser 20 caracteres.' })
  code: string;

  @ApiProperty({ description: 'Identifiant de la base de rattachement' })
  @IsUUID('4', { message: 'La base doit etre un identifiant valide.' })
  baseId: string;
}