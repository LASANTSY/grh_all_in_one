import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ example: 'CV', description: 'Type de la piece jointe' })
  @IsString()
  @IsNotEmpty({ message: 'Le type de la piece jointe est obligatoire.' })
  @MaxLength(100)
  type: string;

  @ApiPropertyOptional({ example: 'CV 2024', description: 'Libelle lisible' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  libelle?: string;
}