import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImportPersonnel } from './import-personnel.entity';
import { Personnel } from '../../personnels/entities/personnel.entity';

export enum StatutLigneImport {
  VALIDE = 'VALIDE',
  ERREUR = 'ERREUR',
  IGNOREE = 'IGNOREE',
}

export enum ActionLigneImport {
  CREATION = 'CREATION',
  MISE_A_JOUR = 'MISE_A_JOUR',
  IGNOREE = 'IGNOREE',
}

@Entity({ name: 'ligne_import' })
@Index('idx_ligne_import_import_id', ['importId'])
@Index('idx_ligne_import_statut', ['statut'])
export class LigneImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'import_id', type: 'uuid' })
  importId: string;

  @ManyToOne(() => ImportPersonnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'import_id' })
  import: ImportPersonnel;

  @Column({ name: 'numero_ligne', type: 'int' })
  numeroLigne: number;

  @Column({
    type: 'enum',
    enum: StatutLigneImport,
    enumName: 'statut_ligne_import',
  })
  statut: StatutLigneImport;

  @Column({
    name: 'action_appliquee',
    type: 'enum',
    enum: ActionLigneImport,
    enumName: 'action_ligne_import',
    nullable: true,
  })
  actionAppliquee: ActionLigneImport | null;

  @Column({ name: 'message_erreur', type: 'text', nullable: true })
  messageErreur: string | null;

  @Column({ name: 'personnel_id', type: 'uuid', nullable: true })
  personnelId: string | null;

  @ManyToOne(() => Personnel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel | null;

  @Column({ name: 'donnees_brutes', type: 'jsonb', nullable: true })
  donneesBrutes: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}