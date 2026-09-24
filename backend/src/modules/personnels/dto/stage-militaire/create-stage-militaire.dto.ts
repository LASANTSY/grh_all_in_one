import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStageMilitaireDto {
  @ApiProperty({ example: 'Ecole Navale' })
  @IsString()
  @IsNotEmpty({ message: "L'etablissement est obligatoire." })
  @MaxLength(200)
  etablissement: string;

  @ApiPropertyOptional({ example: 'Antsiranana' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lieu?: string;

  @ApiProperty({ example: 'Formation d officier de quart' })
  @IsString()
  @IsNotEmpty({ message: 'La nature de la formation est obligatoire.' })
  @MaxLength(200)
  natureFormation: string;

  @ApiPropertyOptional({ example: '2018-03-01' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de debut doit etre valide.' })
  dateDebut?: string;

  @ApiPropertyOptional({ example: '2018-09-30' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit etre valide.' })
  dateFin?: string;

  @ApiPropertyOptional({ example: 'Decision n 2018-012' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  decisionEnvoi?: string;

  @ApiPropertyOptional({ example: 'Certificat de quart' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  diplomeCertificat?: string;
}