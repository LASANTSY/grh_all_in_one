import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSpecialiteDto {
  @ApiProperty({ example: 'Mecanicien naval', description: 'Libelle de la specialite' })
  @IsString()
  @IsNotEmpty({ message: 'Le libelle est obligatoire.' })
  @MinLength(2, { message: 'Le libelle doit contenir au moins 2 caracteres.' })
  @MaxLength(150, { message: 'Le libelle ne peut pas depasser 150 caracteres.' })
  libelle: string;
}