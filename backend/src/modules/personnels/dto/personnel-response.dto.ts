import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Grade } from '../../grades/entities/grade.entity';
import { Unite } from '../../unites/entities/unite.entity';
import { Specialite } from '../../specialites/entities/specialite.entity';

export class PersonnelResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matriculeRecrutement: string;

  @ApiPropertyOptional({ nullable: true })
  matriculeFinancier: string | null;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenoms: string;

  @ApiPropertyOptional({ nullable: true })
  photoUrl: string | null;

  @ApiProperty()
  dateNaissance: Date;

  @ApiProperty()
  lieuNaissance: string;

  @ApiPropertyOptional({ nullable: true })
  prefecture: string | null;

  @ApiPropertyOptional({ nullable: true })
  sousPrefecture: string | null;

  @ApiPropertyOptional({ nullable: true })
  province: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  telephoneMobile: string | null;

  @ApiPropertyOptional({ nullable: true })
  adresseActuelle: string | null;

  @ApiPropertyOptional({ nullable: true })
  adresseRepli: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactUrgence: string | null;

  @ApiPropertyOptional({ nullable: true })
  numeroCIN: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateDelivranceCIN: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lieuDelivranceCIN: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateDuplicataCIN: Date | null;

  @ApiPropertyOptional({ nullable: true })
  numeroPasseport: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateDelivrancePasseport: Date | null;

  @ApiPropertyOptional({ nullable: true })
  religion: string | null;

  @ApiPropertyOptional({ nullable: true })
  groupeSanguin: string | null;

  @ApiPropertyOptional({ nullable: true })
  taille: number | null;

  @ApiPropertyOptional({ nullable: true })
  statutFamilial: string | null;

  @ApiPropertyOptional({ nullable: true })
  numeroAutorisationMariage: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateAutorisationMariage: Date | null;

  @ApiPropertyOptional({ nullable: true })
  nomConjoint: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateNaissanceConjoint: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lieuNaissanceConjoint: string | null;

  @ApiPropertyOptional({ nullable: true })
  fonctionConjoint: string | null;

  @ApiPropertyOptional({ nullable: true })
  nomPere: string | null;

  @ApiPropertyOptional({ nullable: true })
  nomMere: string | null;

  @ApiPropertyOptional({ nullable: true })
  sportsPratiques: string | null;

  @ApiPropertyOptional({ nullable: true })
  corps: string | null;

  @ApiPropertyOptional({ nullable: true })
  lieuEmploi: string | null;

  @ApiPropertyOptional({ nullable: true })
  fonctionActuelle: string | null;

  @ApiPropertyOptional({ nullable: true })
  numeroCIM: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateDelivranceCIM: Date | null;

  @ApiPropertyOptional({ nullable: true })
  dateEffetSOC_HDRC: Date | null;

  @ApiPropertyOptional({ nullable: true })
  referenceSOC_HDRC: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateEffetPrimeTechnicite: Date | null;

  @ApiPropertyOptional({ nullable: true })
  referencePrimeTechnicite: string | null;

  @ApiPropertyOptional({ nullable: true })
  numeroPermisCivil: string | null;

  @ApiPropertyOptional({ nullable: true })
  datePermisCivil: Date | null;

  @ApiPropertyOptional({ nullable: true })
  numeroPermisMilitaire: string | null;

  @ApiPropertyOptional({ nullable: true })
  datePermisMilitaire: Date | null;

  @ApiPropertyOptional({ nullable: true })
  situationMilitaire: string | null;

  @ApiPropertyOptional({ nullable: true })
  origineRecrutement: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateEntreeService: Date | null;

  @ApiPropertyOptional({ nullable: true })
  interruptionsService: string | null;

  @ApiPropertyOptional({ nullable: true })
  dateLiberationServiceNational: Date | null;

  @ApiPropertyOptional({ nullable: true })
  datePremierRengagement: Date | null;

  @ApiPropertyOptional({ nullable: true })
  niveauInstruction: string | null;

  @ApiPropertyOptional({ nullable: true })
  connaissancesInformatiques: string | null;

  @ApiProperty({ type: () => Grade })
  grade: Grade;

  @ApiProperty({ type: () => Unite })
  unite: Unite;

  @ApiPropertyOptional({ type: () => Specialite, nullable: true })
  specialite: Specialite | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Date calculee de fin de lien (retraite) selon le grade',
  })
  dateFinDeLien?: Date | null;

  @ApiProperty()
  actif: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}