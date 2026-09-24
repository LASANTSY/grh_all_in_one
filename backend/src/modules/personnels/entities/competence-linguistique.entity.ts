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

export enum NiveauCompetence {
  AVANCE = 'AVANCE',
  MOYEN = 'MOYEN',
  MAUVAIS = 'MAUVAIS',
}

@Entity({ name: 'competence_linguistique' })
@Index('idx_competence_linguistique_personnel_id', ['personnelId'])
export class CompetenceLinguistique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ type: 'varchar', length: 100 })
  langue: string;

  @Column({
    name: 'niveau_ecrit',
    type: 'enum',
    enum: NiveauCompetence,
    enumName: 'niveau_competence',
  })
  niveauEcrit: NiveauCompetence;

  @Column({
    name: 'niveau_parle',
    type: 'enum',
    enum: NiveauCompetence,
    enumName: 'niveau_competence',
  })
  niveauParle: NiveauCompetence;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}