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
import { Personnel } from '../../personnels/entities/personnel.entity';

export enum ActionAudit {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  SUPPRESSION = 'SUPPRESSION',
  CONNEXION = 'CONNEXION',
  ECHEC_CONNEXION = 'ECHEC_CONNEXION',
  DECONNEXION = 'DECONNEXION',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  VALIDATION = 'VALIDATION',
  REJET = 'REJET',
}

@Entity({ name: 'entree_audit' })
@Index('idx_entree_audit_date_heure', ['dateHeure'])
@Index('idx_entree_audit_auteur_id', ['auteurId'])
@Index('idx_entree_audit_entite', ['entiteType', 'entiteId'])
@Index('idx_entree_audit_personnel_id', ['personnelId'])
export class EntreeAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActionAudit,
    enumName: 'action_audit',
  })
  action: ActionAudit;

  @Column({ name: 'entite_type', type: 'varchar', length: 50 })
  entiteType: string;

  @Column({ name: 'entite_id', type: 'uuid' })
  entiteId: string;

  @Column({ name: 'personnel_id', type: 'uuid', nullable: true })
  personnelId: string | null;

  @ManyToOne(() => Personnel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel | null;

  @Column({ name: 'auteur_id', type: 'uuid', nullable: true })
  auteurId: string | null;

  @ManyToOne(() => CompteUtilisateur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'auteur_id' })
  auteur: CompteUtilisateur | null;

  @Column({ name: 'champ_modifie', type: 'varchar', length: 100, nullable: true })
  champModifie: string | null;

  @Column({ name: 'ancienne_valeur', type: 'text', nullable: true })
  ancienneValeur: string | null;

  @Column({ name: 'nouvelle_valeur', type: 'text', nullable: true })
  nouvelleValeur: string | null;

  @Column({ name: 'adresse_ip', type: 'inet', nullable: true })
  adresseIp: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ name: 'date_heure', type: 'timestamptz' })
  dateHeure: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}