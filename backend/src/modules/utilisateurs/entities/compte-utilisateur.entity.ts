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
import { TypeCompte } from '../../../common/enums/type-compte.enum';
import { Personnel } from '../../personnels/entities/personnel.entity';
import { Unite } from '../../unites/entities/unite.entity';

@Entity({ name: 'compte_utilisateur' })
export class CompteUtilisateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  identifiant: string;

  @Column({ name: 'mot_de_passe_hash', type: 'varchar', length: 255 })
  motDePasseHash: string;

  @Column({
    name: 'type_compte',
    type: 'enum',
    enum: TypeCompte,
    enumName: 'type_compte',
  })
  typeCompte: TypeCompte;

  @Index({ unique: true })
  @Column({ name: 'personnel_id', type: 'uuid', nullable: true })
  personnelId: string | null;

  @ManyToOne(() => Personnel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel | null;

  @Column({ name: 'unite_perimetre_id', type: 'uuid', nullable: true })
  unitePerimetreId: string | null;

  @ManyToOne(() => Unite, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'unite_perimetre_id' })
  unitePerimetre: Unite | null;

  @Column({ name: 'compte_verrouille', type: 'boolean', default: false })
  compteVerrouille: boolean;

  @Column({ name: 'tentatives_echouees', type: 'int', default: 0 })
  tentativesEchouees: number;

  @Column({ name: 'dernier_echec', type: 'timestamptz', nullable: true })
  dernierEchec: Date | null;

  @Column({ name: 'doit_changer_mot_de_passe', type: 'boolean', default: false })
  doitChangerMotDePasse: boolean;

  @Column({ name: 'date_derniere_connexion', type: 'timestamptz', nullable: true })
  dateDerniereConnexion: Date | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}