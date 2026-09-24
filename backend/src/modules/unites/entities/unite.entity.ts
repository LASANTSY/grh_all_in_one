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
import { Base } from '../../bases/entities/base.entity';

@Entity({ name: 'unite' })
export class Unite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nom: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Index()
  @Column({ name: 'base_id', type: 'uuid' })
  baseId: string;

  @ManyToOne(() => Base, (base) => base.unites, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'base_id' })
  base: Base;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}