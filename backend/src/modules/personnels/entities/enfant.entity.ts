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

@Entity({ name: 'enfant' })
@Index('idx_enfant_personnel_id', ['personnelId'])
export class Enfant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ type: 'int' })
  rang: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 150 })
  prenoms: string;

  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 10 })
  sexe: string;

  @Column({ name: 'lien_parente', type: 'varchar', length: 50 })
  lienParente: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}