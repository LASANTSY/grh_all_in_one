import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompteUtilisateur } from '../../utilisateurs/entities/compte-utilisateur.entity';

export enum StatutImport {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ECHEC = 'ECHEC',
}

@Entity({ name: 'import_personnel' })
@Index('idx_import_personnel_date_import', ['dateImport'])
export class ImportPersonnel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'importateur_id', type: 'uuid', nullable: true })
  importateurId: string | null;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'importateur_id' })
  importateur: CompteUtilisateur | null;

  @Column({ name: 'date_import', type: 'timestamptz' })
  dateImport: Date;

  @Column({ name: 'nom_fichier_source', type: 'varchar', length: 255 })
  nomFichierSource: string;

  @Column({ name: 'chemin_fichier', type: 'varchar', length: 500, nullable: true })
  cheminFichier: string | null;

  @Column({ name: 'nombre_lignes', type: 'int', default: 0 })
  nombreLignes: number;

  @Column({ name: 'lignes_valides', type: 'int', default: 0 })
  lignesValides: number;

  @Column({ name: 'lignes_erreur', type: 'int', default: 0 })
  lignesErreur: number;

  @Column({ name: 'lignes_creees', type: 'int', default: 0 })
  lignesCreees: number;

  @Column({ name: 'lignes_mises_a_jour', type: 'int', default: 0 })
  lignesMisesAJour: number;

  @Column({
    type: 'enum',
    enum: StatutImport,
    enumName: 'statut_import',
    default: StatutImport.EN_COURS,
  })
  statut: StatutImport;

  @Column({ name: 'message_erreur', type: 'text', nullable: true })
  messageErreur: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}