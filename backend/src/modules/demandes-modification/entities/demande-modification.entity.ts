import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Personnel } from '../../personnels/entities/personnel.entity';
import { CompteUtilisateur } from '../../utilisateurs/entities/compte-utilisateur.entity';

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE',
}

@Entity({ name: 'demande_modification' })
@Index('idx_demande_modification_personnel_id', ['personnelId'])
@Index('idx_demande_modification_statut', ['statut'])
@Index('idx_demande_modification_demandeur_id', ['demandeurId'])
export class DemandeModification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ name: 'demandeur_id', type: 'uuid' })
  demandeurId: string;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'demandeur_id' })
  demandeur: CompteUtilisateur;

  @Column({ name: 'champ_modifie', type: 'varchar', length: 100 })
  champModifie: string;

  @Column({ name: 'ancienne_valeur', type: 'text', nullable: true })
  ancienneValeur: string | null;

  @Column({ name: 'nouvelle_valeur', type: 'text' })
  nouvelleValeur: string;

  @Column({
    type: 'enum',
    enum: StatutDemande,
    enumName: 'statut_demande',
    default: StatutDemande.EN_ATTENTE,
  })
  statut: StatutDemande;

  @Column({ name: 'date_demande', type: 'timestamptz' })
  dateDemande: Date;

  @Column({ name: 'date_traitement', type: 'timestamptz', nullable: true })
  dateTraitement: Date | null;

  @Column({ name: 'valideur_id', type: 'uuid', nullable: true })
  valideurId: string | null;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'valideur_id' })
  valideur: CompteUtilisateur | null;

  @Column({ name: 'motif_rejet', type: 'text', nullable: true })
  motifRejet: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}