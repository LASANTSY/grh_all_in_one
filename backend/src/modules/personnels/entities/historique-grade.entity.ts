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
import { Grade } from '../../grades/entities/grade.entity';

@Entity({ name: 'historique_grade' })
@Index('idx_historique_grade_personnel_id', ['personnelId'])
@Index('idx_historique_grade_grade_id', ['gradeId'])
export class HistoriqueGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ name: 'grade_id', type: 'uuid' })
  gradeId: string;

  @ManyToOne(() => Grade, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'grade_id' })
  grade: Grade;

  @Column({ name: 'reference_decret', type: 'varchar', length: 150, nullable: true })
  referenceDecret: string | null;

  @Column({ name: 'date_prise_commandement', type: 'date' })
  datePriseCommandement: Date;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}