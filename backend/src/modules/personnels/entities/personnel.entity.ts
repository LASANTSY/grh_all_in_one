import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from '../../grades/entities/grade.entity';
import { Unite } from '../../unites/entities/unite.entity';
import { Specialite } from '../../specialites/entities/specialite.entity';

@Entity({ name: 'personnel' })
@Index('idx_personnel_nom', ['nom'])
@Index('idx_personnel_matricule_recrutement', ['matriculeRecrutement'], { unique: true })
@Index('idx_personnel_numero_cin', ['numeroCIN'], { unique: true, where: 'numero_cin IS NOT NULL' })
@Index('idx_personnel_grade_id', ['gradeId'])
@Index('idx_personnel_unite_id', ['uniteId'])
@Index('idx_personnel_specialite_id', ['specialiteId'])
@Index('idx_personnel_date_naissance', ['dateNaissance'])
export class Personnel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ----- Identite -----
  @Column({ name: 'matricule_recrutement', type: 'varchar', length: 50 })
  matriculeRecrutement: string;

  @Column({ name: 'matricule_financier', type: 'varchar', length: 50, nullable: true })
  matriculeFinancier: string | null;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 150 })
  prenoms: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: Date;

  @Column({ name: 'lieu_naissance', type: 'varchar', length: 150 })
  lieuNaissance: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  prefecture: string | null;

  @Column({ name: 'sous_prefecture', type: 'varchar', length: 150, nullable: true })
  sousPrefecture: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  province: string | null;

  // ----- Contact -----
  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'telephone_mobile', type: 'varchar', length: 30, nullable: true })
  telephoneMobile: string | null;

  @Column({ name: 'adresse_actuelle', type: 'text', nullable: true })
  adresseActuelle: string | null;

  @Column({ name: 'adresse_repli', type: 'text', nullable: true })
  adresseRepli: string | null;

  @Column({ name: 'contact_urgence', type: 'text', nullable: true })
  contactUrgence: string | null;

  // ----- Pieces d'identite -----
  @Column({ name: 'numero_cin', type: 'varchar', length: 50, nullable: true })
  numeroCIN: string | null;

  @Column({ name: 'date_delivrance_cin', type: 'date', nullable: true })
  dateDelivranceCIN: Date | null;

  @Column({ name: 'lieu_delivrance_cin', type: 'varchar', length: 150, nullable: true })
  lieuDelivranceCIN: string | null;

  @Column({ name: 'date_duplicata_cin', type: 'date', nullable: true })
  dateDuplicataCIN: Date | null;

  @Column({ name: 'numero_passeport', type: 'varchar', length: 50, nullable: true })
  numeroPasseport: string | null;

  @Column({ name: 'date_delivrance_passeport', type: 'date', nullable: true })
  dateDelivrancePasseport: Date | null;

  // ----- Physique / personnel -----
  @Column({ type: 'varchar', length: 50, nullable: true })
  religion: string | null;

  @Column({ name: 'groupe_sanguin', type: 'varchar', length: 10, nullable: true })
  groupeSanguin: string | null;

  @Column({ type: 'int', nullable: true })
  taille: number | null;

  // ----- Situation familiale -----
  @Column({ name: 'statut_familial', type: 'varchar', length: 50, nullable: true })
  statutFamilial: string | null;

  @Column({ name: 'numero_autorisation_mariage', type: 'varchar', length: 50, nullable: true })
  numeroAutorisationMariage: string | null;

  @Column({ name: 'date_autorisation_mariage', type: 'date', nullable: true })
  dateAutorisationMariage: Date | null;

  @Column({ name: 'nom_conjoint', type: 'varchar', length: 150, nullable: true })
  nomConjoint: string | null;

  @Column({ name: 'date_naissance_conjoint', type: 'date', nullable: true })
  dateNaissanceConjoint: Date | null;

  @Column({ name: 'lieu_naissance_conjoint', type: 'varchar', length: 150, nullable: true })
  lieuNaissanceConjoint: string | null;

  @Column({ name: 'fonction_conjoint', type: 'varchar', length: 150, nullable: true })
  fonctionConjoint: string | null;

  // ----- Parents / loisirs -----
  @Column({ name: 'nom_pere', type: 'varchar', length: 150, nullable: true })
  nomPere: string | null;

  @Column({ name: 'nom_mere', type: 'varchar', length: 150, nullable: true })
  nomMere: string | null;

  @Column({ name: 'sports_pratiques', type: 'text', nullable: true })
  sportsPratiques: string | null;

  // ----- Renseignements militaires -----
  @Column({ type: 'varchar', length: 100, nullable: true })
  corps: string | null;

  @Column({ name: 'lieu_emploi', type: 'varchar', length: 150, nullable: true })
  lieuEmploi: string | null;

  @Column({ name: 'fonction_actuelle', type: 'varchar', length: 150, nullable: true })
  fonctionActuelle: string | null;

  @Column({ name: 'numero_cim', type: 'varchar', length: 50, nullable: true })
  numeroCIM: string | null;

  @Column({ name: 'date_delivrance_cim', type: 'date', nullable: true })
  dateDelivranceCIM: Date | null;

  @Column({ name: 'date_effet_soc_hdrc', type: 'date', nullable: true })
  dateEffetSOC_HDRC: Date | null;

  @Column({ name: 'reference_soc_hdrc', type: 'varchar', length: 100, nullable: true })
  referenceSOC_HDRC: string | null;

  @Column({ name: 'date_effet_prime_technicite', type: 'date', nullable: true })
  dateEffetPrimeTechnicite: Date | null;

  @Column({ name: 'reference_prime_technicite', type: 'varchar', length: 100, nullable: true })
  referencePrimeTechnicite: string | null;

  @Column({ name: 'numero_permis_civil', type: 'varchar', length: 50, nullable: true })
  numeroPermisCivil: string | null;

  @Column({ name: 'date_permis_civil', type: 'date', nullable: true })
  datePermisCivil: Date | null;

  @Column({ name: 'numero_permis_militaire', type: 'varchar', length: 50, nullable: true })
  numeroPermisMilitaire: string | null;

  @Column({ name: 'date_permis_militaire', type: 'date', nullable: true })
  datePermisMilitaire: Date | null;

  @Column({ name: 'situation_militaire', type: 'varchar', length: 100, nullable: true })
  situationMilitaire: string | null;

  @Column({ name: 'origine_recrutement', type: 'varchar', length: 150, nullable: true })
  origineRecrutement: string | null;

  @Column({ name: 'date_entree_service', type: 'date', nullable: true })
  dateEntreeService: Date | null;

  @Column({ name: 'interruptions_service', type: 'text', nullable: true })
  interruptionsService: string | null;

  @Column({ name: 'date_liberation_service_national', type: 'date', nullable: true })
  dateLiberationServiceNational: Date | null;

  @Column({ name: 'date_premier_rengagement', type: 'date', nullable: true })
  datePremierRengagement: Date | null;

  // ----- Formation / competences -----
  @Column({ name: 'niveau_instruction', type: 'varchar', length: 150, nullable: true })
  niveauInstruction: string | null;

  @Column({ name: 'connaissances_informatiques', type: 'text', nullable: true })
  connaissancesInformatiques: string | null;

  // ----- Relations referentiels -----
  @Column({ name: 'grade_id', type: 'uuid' })
  gradeId: string;

  @ManyToOne(() => Grade, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'grade_id' })
  grade: Grade;

  @Column({ name: 'unite_id', type: 'uuid' })
  uniteId: string;

  @ManyToOne(() => Unite, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'unite_id' })
  unite: Unite;

  @Column({ name: 'specialite_id', type: 'uuid', nullable: true })
  specialiteId: string | null;

  @ManyToOne(() => Specialite, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'specialite_id' })
  specialite: Specialite | null;

  // ----- Systeme -----
  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}