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

@Entity({ name: 'cursus_scolaire' })
@Index('idx_cursus_scolaire_personnel_id', ['personnelId'])
export class CursusScolaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ type: 'varchar', length: 200 })
  etablissement: string;

  @Column({ name: 'ville_pays', type: 'varchar', length: 150, nullable: true })
  villePays: string | null;

  @Column({ name: 'date_debut', type: 'date', nullable: true })
  dateDebut: Date | null;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date | null;

  @Column({ name: 'diplome_obtenu', type: 'varchar', length: 200, nullable: true })
  diplomeObtenu: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}