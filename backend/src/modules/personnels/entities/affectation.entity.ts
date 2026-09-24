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
import { Unite } from '../../unites/entities/unite.entity';

@Entity({ name: 'affectation' })
@Index('idx_affectation_personnel_id', ['personnelId'])
@Index('idx_affectation_unite_id', ['uniteId'])
@Index('idx_affectation_date_effet', ['dateEffet'])
export class Affectation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ name: 'unite_id', type: 'uuid' })
  uniteId: string;

  @ManyToOne(() => Unite, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'unite_id' })
  unite: Unite;

  @Column({ type: 'varchar', length: 150, nullable: true })
  decision: string | null;

  @Column({ name: 'date_effet', type: 'date' })
  dateEffet: Date;

  @Column({ name: 'fonction_emploi', type: 'varchar', length: 200, nullable: true })
  fonctionEmploi: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}