import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe actuel est obligatoire.' })
  motDePasseActuel: string;

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsString()
  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire.' })
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caracteres.' })
  @MaxLength(128, { message: 'Le nouveau mot de passe ne peut pas depasser 128 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.',
  })
  nouveauMotDePasse: string;
}