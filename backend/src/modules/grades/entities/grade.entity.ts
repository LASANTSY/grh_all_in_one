import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GradeCategorie } from '../enums/grade-categorie.enum';

@Entity({ name: 'grade' })
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({
    type: 'enum',
    enum: GradeCategorie,
    enumName: 'grade_categorie',
  })
  categorie: GradeCategorie;

  @Column({ name: 'age_depart_retraite', type: 'int' })
  ageDepartRetraite: number;

  @Column({ type: 'int' })
  ordre: number;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}