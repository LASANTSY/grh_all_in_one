import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PieceJointe } from './piece-jointe.entity';
import { CompteUtilisateur } from '../../utilisateurs/entities/compte-utilisateur.entity';

@Entity({ name: 'version_piece_jointe' })
@Index('idx_version_piece_jointe_piece_jointe_id', ['pieceJointeId'])
export class VersionPieceJointe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'piece_jointe_id', type: 'uuid' })
  pieceJointeId: string;

  @ManyToOne(() => PieceJointe, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'piece_jointe_id' })
  pieceJointe: PieceJointe;

  @Column({ name: 'numero_version', type: 'int' })
  numeroVersion: number;

  @Column({ name: 'fichier_path', type: 'varchar', length: 500 })
  fichierPath: string;

  @Column({ name: 'nom_original', type: 'varchar', length: 255 })
  nomOriginal: string;

  @Column({ type: 'varchar', length: 100 })
  format: string;

  @Column({ name: 'taille_octets', type: 'bigint' })
  tailleOctets: string;

  @Column({ name: 'date_depot', type: 'timestamptz' })
  dateDepot: Date;

  @Column({ name: 'depose_par_id', type: 'uuid', nullable: true })
  deposeParId: string | null;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'depose_par_id' })
  deposePar: CompteUtilisateur | null;

  @Column({ name: 'version_courante', type: 'boolean', default: false })
  versionCourante: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}