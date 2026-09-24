import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompteUtilisateur } from '../../utilisateurs/entities/compte-utilisateur.entity';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'compte_id', type: 'uuid' })
  compteId: string;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'compte_id' })
  compte: CompteUtilisateur;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'adresse_ip', type: 'inet', nullable: true })
  adresseIp: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}