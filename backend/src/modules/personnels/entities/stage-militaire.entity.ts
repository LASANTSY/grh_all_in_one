import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Personnel } from './personnel.entity';

@Entity({ name: 'stage_militaire' })
@Index('idx_stage_militaire_personnel_id', ['personnelId'])
export class StageMilitaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ type: 'varchar', length: 200 })
  etablissement: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  lieu: string | null;

  @Column({ name: 'nature_formation', type: 'varchar', length: 200 })
  natureFormation: string;

  @Column({ name: 'date_debut', type: 'date', nullable: true })
  dateDebut: Date | null;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date | null;

  @Column({ name: 'decision_envoi', type: 'varchar', length: 150, nullable: true })
  decisionEnvoi: string | null;

  @Column({ name: 'diplome_certificat', type: 'varchar', length: 200, nullable: true })
  diplomeCertificat: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}