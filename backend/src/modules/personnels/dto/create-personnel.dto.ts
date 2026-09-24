import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePersonnelDto {
  // ----- Identite -----
  @ApiProperty({ example: 'MAT-2020-00123' })
  @IsString()
  @IsNotEmpty({ message: 'Le matricule de recrutement est obligatoire.' })
  @MaxLength(50)
  matriculeRecrutement: string;

  @ApiPropertyOptional({ example: 'FIN-2020-00123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  matriculeFinancier?: string;

  @ApiProperty({ example: 'RAKOTO' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MinLength(2)
  @MaxLength(100)
  nom: string;

  @ApiProperty({ example: 'Jean Claude' })
  @IsString()
  @IsNotEmpty({ message: 'Les prenoms sont obligatoires.' })
  @MinLength(2)
  @MaxLength(150)
  prenoms: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photos/xxx.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiProperty({ example: '1985-06-15' })
  @IsDateString({}, { message: 'La date de naissance doit etre une date valide.' })
  dateNaissance: string;

  @ApiProperty({ example: 'Antananarivo' })
  @IsString()
  @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
  @MaxLength(150)
  lieuNaissance: string;

  @ApiPropertyOptional({ example: 'Antananarivo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  prefecture?: string;

  @ApiPropertyOptional({ example: 'Avaradrano' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  sousPrefecture?: string;

  @ApiPropertyOptional({ example: 'Antananarivo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  province?: string;

  // ----- Contact -----
  @ApiPropertyOptional({ example: 'jean.rakoto@example.mg' })
  @IsOptional()
  @IsEmail({}, { message: "L'adresse e-mail est invalide." })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: '+261 34 12 345 67' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephoneMobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresseActuelle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresseRepli?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactUrgence?: string;

  // ----- Pieces d'identite -----
  @ApiPropertyOptional({ example: '101234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroCIN?: string;

  @ApiPropertyOptional({ example: '2010-03-12' })
  @IsOptional()
  @IsDateString()
  dateDelivranceCIN?: string;

  @ApiPropertyOptional({ example: 'Antananarivo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lieuDelivranceCIN?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDuplicataCIN?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroPasseport?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDelivrancePasseport?: string;

  // ----- Physique / personnel -----
  @ApiPropertyOptional({ example: 'Catholique' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  religion?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  groupeSanguin?: string;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  taille?: number;

  // ----- Situation familiale -----
  @ApiPropertyOptional({ example: 'Marie' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  statutFamilial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroAutorisationMariage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateAutorisationMariage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nomConjoint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateNaissanceConjoint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lieuNaissanceConjoint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fonctionConjoint?: string;

  // ----- Parents / loisirs -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nomPere?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nomMere?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sportsPratiques?: string;

  // ----- Renseignements militaires -----
  @ApiPropertyOptional({ example: 'Marine' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  corps?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lieuEmploi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fonctionActuelle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroCIM?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDelivranceCIM?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateEffetSOC_HDRC?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceSOC_HDRC?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateEffetPrimeTechnicite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencePrimeTechnicite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroPermisCivil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  datePermisCivil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroPermisMilitaire?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  datePermisMilitaire?: string;

  @ApiPropertyOptional({ example: 'Officier de carriere' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  situationMilitaire?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  origineRecrutement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateEntreeService?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interruptionsService?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateLiberationServiceNational?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  datePremierRengagement?: string;

  // ----- Formation / competences -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  niveauInstruction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  connaissancesInformatiques?: string;

  // ----- Relations obligatoires -----
  @ApiProperty({ description: 'Identifiant du grade' })
  @IsUUID('4', { message: 'Le grade doit etre un identifiant valide.' })
  gradeId: string;

  @ApiProperty({ description: "Identifiant de l'unite d'affectation" })
  @IsUUID('4', { message: "L'unite doit etre un identifiant valide." })
  uniteId: string;

  @ApiPropertyOptional({ description: 'Identifiant de la specialite (optionnelle)' })
  @IsOptional()
  @IsUUID('4', { message: 'La specialite doit etre un identifiant valide.' })
  specialiteId?: string;
}