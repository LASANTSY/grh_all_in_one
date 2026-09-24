import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Identifiant du compte' })
  @IsString()
  @IsNotEmpty({ message: "L'identifiant est obligatoire." })
  @MinLength(3, { message: "L'identifiant doit contenir au moins 3 caracteres." })
  @MaxLength(50, { message: "L'identifiant ne peut pas depasser 50 caracteres." })
  identifiant: string;

  @ApiProperty({ example: 'motdepasse', description: 'Mot de passe du compte' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres.' })
  @MaxLength(128, { message: 'Le mot de passe ne peut pas depasser 128 caracteres.' })
  motDePasse: string;
}