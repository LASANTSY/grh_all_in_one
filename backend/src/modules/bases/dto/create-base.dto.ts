import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBaseDto {
  @ApiProperty({ example: 'BANA', description: 'Nom de la base' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres.' })
  @MaxLength(100, { message: 'Le nom ne peut pas depasser 100 caracteres.' })
  nom: string;

  @ApiProperty({ example: 'Antsiranana', description: 'Ville de la base' })
  @IsString()
  @IsNotEmpty({ message: 'La ville est obligatoire.' })
  @MinLength(2, { message: 'La ville doit contenir au moins 2 caracteres.' })
  @MaxLength(100, { message: 'La ville ne peut pas depasser 100 caracteres.' })
  ville: string;
}