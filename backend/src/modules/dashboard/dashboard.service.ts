import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Personnel } from '../personnels/entities/personnel.entity';
import {
  PersonnelRetraiteService,
  StatutFinDeLien,
} from '../personnels/services/personnel-retraite.service';

import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../common/enums/type-compte.enum';

export interface DashboardStats {
  effectifTotal: number;
  parCategorie: Array<{ categorie: string; total: number }>;
  personnelFinDeLien: number;
  personnelRetraite: number;
}

export interface RepartitionItem {
  id: string;
  libelle: string;
  total: number;
  pourcentage: number;
}

export interface DepartRetraiteItem {
  annee: number;
  total: number;
}

export interface FinDeLienItem {
  personnelId: string;
  matriculeRecrutement: string;
  nom: string;
  prenoms: string;
  gradeLibelle: string;
  uniteLibelle: string;
  baseLibelle: string;
  dateFinDeLien: Date;
  ageActuel: number;
  joursRestants: number;
  statut: StatutFinDeLien;
}

export interface DashboardScope {
  user: AuthenticatedUser;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    private readonly retraiteService: PersonnelRetraiteService,
  ) {}

  async getStats(scope: DashboardScope): Promise<DashboardStats> {
    this.assertScope(scope.user);

    const scopeFilter = this.buildScopeFilter(scope.user);

    const total = await this.personnelRepository
      .createQueryBuilder('p')
      .innerJoin('p.grade', 'grade')
      .innerJoin('p.unite', 'unite')
      .where('p.actif = :actif', { actif: true })
      .andWhere(scopeFilter.clause, scopeFilter.params)
      .getCount();

    const parCategorieRaw = await this.personnelRepository
      .createQueryBuilder('p')
      .innerJoin('p.grade', 'grade')
      .innerJoin('p.unite', 'unite')
      .select('grade.categorie', 'categorie')
      .addSelect('COUNT(p.id)', 'total')
      .where('p.actif = :actif', { actif: true })
      .andWhere(scopeFilter.clause, scopeFilter.params)
      .groupBy('grade.categorie')
      .orderBy('grade.categorie', 'ASC')
      .getRawMany<{ categorie: string; total: string }>();

    const parCategorie = parCategorieRaw.map((r) => ({
      categorie: r.categorie,
      total: Number(r.total),
    }));

    const all = await this.personnelRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.grade', 'grade')
      .innerJoin('p.unite', 'unite')
      .where('p.actif = :actif', { actif: true })
      .andWhere(scopeFilter.clause, scopeFilter.params)
      .getMany();

    let finDeLien = 0;
    let retraite = 0;
    for (const p of all) {
      if (!p.grade) continue;
      const info = this.retraiteService.computeInfo(p, p.grade);
      if (
        info.statut === StatutFinDeLien.ALERTE_ANNUELLE ||
        info.statut === StatutFinDeLien.ALERTE_BIENNALE
      ) {
        finDeLien += 1;
      } else if (info.statut === StatutFinDeLien.RETRAITE_DEPASSEE) {
        retraite += 1;
      }
    }

    return {
      effectifTotal: total,
      parCategorie,
      personnelFinDeLien: finDeLien,
      personnelRetraite: retraite,
    };
  }

  async getRepartitionParBase(scope: DashboardScope): Promise<RepartitionItem[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .innerJoin('p.unite', 'unite')
      .innerJoin('unite.base', 'base')
      .select('base.id', 'id')
      .addSelect('base.nom', 'libelle')
      .addSelect('COUNT(p.id)', 'total')
      .groupBy('base.id')
      .addGroupBy('base.nom')
      .orderBy('base.nom', 'ASC');

    this.applyScopeFilter(qb, scope.user);

    const raw = await qb.getRawMany<{ id: string; libelle: string; total: string }>();
    return this.withPercentage(raw);
  }

  async getRepartitionParUnite(
    scope: DashboardScope,
    baseId?: string,
  ): Promise<RepartitionItem[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .innerJoin('p.unite', 'unite')
      .select('unite.id', 'id')
      .addSelect('unite.nom', 'libelle')
      .addSelect('COUNT(p.id)', 'total')
      .groupBy('unite.id')
      .addGroupBy('unite.nom')
      .orderBy('unite.nom', 'ASC');

    if (baseId) {
      qb.andWhere('unite.baseId = :baseId', { baseId });
    }

    this.applyScopeFilter(qb, scope.user);

    const raw = await qb.getRawMany<{ id: string; libelle: string; total: string }>();
    return this.withPercentage(raw);
  }

  async getRepartitionParCategorieGrade(scope: DashboardScope): Promise<RepartitionItem[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .innerJoin('p.grade', 'grade')
      .select('grade.categorie', 'id')
      .addSelect('grade.categorie', 'libelle')
      .addSelect('COUNT(p.id)', 'total')
      .groupBy('grade.categorie')
      .orderBy('grade.categorie', 'ASC');

    this.applyScopeFilter(qb, scope.user);

    const raw = await qb.getRawMany<{ id: string; libelle: string; total: string }>();
    return this.withPercentage(raw);
  }

  async getRepartitionParSpecialite(scope: DashboardScope): Promise<RepartitionItem[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .leftJoin('p.specialite', 'specialite')
      .select('COALESCE(specialite.id::text, :none)', 'id')
      .addSelect('COALESCE(specialite.libelle, :sansLabel)', 'libelle')
      .addSelect('COUNT(p.id)', 'total')
      .groupBy('specialite.id')
      .addGroupBy('specialite.libelle')
      .orderBy('COUNT(p.id)', 'DESC')
      .setParameters({ none: 'none', sansLabel: 'Sans specialite' });

    this.applyScopeFilter(qb, scope.user);

    const raw = await qb.getRawMany<{ id: string; libelle: string; total: string }>();
    return this.withPercentage(raw);
  }

  async getDepartsRetraite(
    scope: DashboardScope,
    anneeDebut?: number,
    anneeFin?: number,
  ): Promise<DepartRetraiteItem[]> {
    const start = anneeDebut ?? new Date().getFullYear();
    const end = anneeFin ?? start + 9;

    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.grade', 'grade')
      .select(['p.id', 'p.dateNaissance', 'grade.ageDepartRetraite']);

    this.applyScopeFilter(qb, scope.user);

    const all = await qb.getMany();

    const counts = new Map<number, number>();
    for (let y = start; y <= end; y += 1) counts.set(y, 0);

    for (const p of all) {
      const dateFin = this.retraiteService.computeDateFinDeLien(p, p.grade);
      const annee = dateFin.getFullYear();
      if (annee >= start && annee <= end) {
        counts.set(annee, (counts.get(annee) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => a - b)
      .map(([annee, total]) => ({ annee, total }));
  }

  async getPersonnelFinDeLien(
    scope: DashboardScope,
    statut?: StatutFinDeLien,
  ): Promise<FinDeLienItem[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.grade', 'grade')
      .innerJoinAndSelect('p.unite', 'unite')
      .innerJoinAndSelect('unite.base', 'base')
      .where('p.actif = :actif', { actif: true });

    this.applyScopeFilter(qb, scope.user);

    const all = await qb.getMany();

    const result: FinDeLienItem[] = [];
    for (const p of all) {
      const info = this.retraiteService.computeInfo(p, p.grade);
      if (statut && info.statut !== statut) continue;

      result.push({
        personnelId: p.id,
        matriculeRecrutement: p.matriculeRecrutement,
        nom: p.nom,
        prenoms: p.prenoms,
        gradeLibelle: p.grade.libelle,
        uniteLibelle: p.unite.nom,
        baseLibelle: p.unite.base.nom,
        dateFinDeLien: info.dateFinDeLien,
        ageActuel: info.ageActuel,
        joursRestants: info.joursRestants,
        statut: info.statut,
      });
    }

    return result.sort((a, b) => a.joursRestants - b.joursRestants);
  }

  // ============================================================
  // UTILITAIRES PRIVES
  // ============================================================

  private buildScopeFilter(user: AuthenticatedUser): {
    clause: string;
    params: Record<string, unknown>;
  } {
    if (
      user.typeCompte === TypeCompte.RH_BASE ||
      user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      return {
        clause: 'p.uniteId = :unitePerimetreId',
        params: { unitePerimetreId: user.unitePerimetreId },
      };
    }
    return { clause: '1 = 1', params: {} };
  }

  private applyScopeFilter(qb: SelectQueryBuilder<Personnel>, user: AuthenticatedUser): void {
    this.assertScope(user);

    if (
      user.typeCompte === TypeCompte.RH_BASE ||
      user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      qb.andWhere('p.uniteId = :unitePerimetreId', {
        unitePerimetreId: user.unitePerimetreId,
      });
    }
  }

  private assertScope(user: AuthenticatedUser): void {
    if (user.typeCompte === TypeCompte.PERSONNEL) {
      throw new ForbiddenException({
        code: 'DASHBOARD_FORBIDDEN',
        message: 'Acces au tableau de bord non autorise pour ce type de compte.',
      });
    }

    if (
      (user.typeCompte === TypeCompte.RH_BASE ||
        user.typeCompte === TypeCompte.CHEF_COMMANDEMENT) &&
      !user.unitePerimetreId
    ) {
      throw new ForbiddenException({
        code: 'DASHBOARD_PERIMETRE_MISSING',
        message: 'Aucun perimetre organisationnel associe a votre compte.',
      });
    }
  }

  private withPercentage(
    raw: Array<{ id: string; libelle: string; total: string }>,
  ): RepartitionItem[] {
    const total = raw.reduce((acc, r) => acc + Number(r.total), 0);
    return raw.map((r) => {
      const count = Number(r.total);
      return {
        id: r.id,
        libelle: r.libelle,
        total: count,
        pourcentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      };
    });
  }
}