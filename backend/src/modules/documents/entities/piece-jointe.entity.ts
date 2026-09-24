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
import { Personnel } from '../../personnels/entities/personnel.entity';

@Entity({ name: 'piece_jointe' })
@Index('idx_piece_jointe_personnel_id', ['personnelId'])
@Index('idx_piece_jointe_type', ['type'])
export class PieceJointe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personnel_id', type: 'uuid' })
  personnelId: string;

  @ManyToOne(() => Personnel, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ name: 'libelle', type: 'varchar', length: 200, nullable: true })
  libelle: string | null;

  @Column({ name: 'date_ajout', type: 'timestamptz' })
  dateAjout: Date;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}