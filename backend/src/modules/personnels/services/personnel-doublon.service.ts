import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personnel } from '../entities/personnel.entity';

export interface DoublonCriteria {
  numeroCIN?: string | null;
  matriculeRecrutement?: string | null;
  matriculeFinancier?: string | null;
}

export interface DoublonResult {
  champ: 'numeroCIN' | 'matriculeRecrutement' | 'matriculeFinancier';
  valeur: string;
  personnel: Personnel;
}

@Injectable()
export class PersonnelDoublonService {
  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async findDoublons(
    criteria: DoublonCriteria,
    excludePersonnelId?: string,
  ): Promise<DoublonResult[]> {
    const results: DoublonResult[] = [];

    if (criteria.numeroCIN && criteria.numeroCIN.trim().length > 0) {
      const found = await this.findByCriteria(
        { numeroCIN: criteria.numeroCIN },
        excludePersonnelId,
      );
      for (const p of found) {
        results.push({ champ: 'numeroCIN', valeur: criteria.numeroCIN, personnel: p });
      }
    }

    if (criteria.matriculeRecrutement && criteria.matriculeRecrutement.trim().length > 0) {
      const found = await this.findByCriteria(
        { matriculeRecrutement: criteria.matriculeRecrutement },
        excludePersonnelId,
      );
      for (const p of found) {
        results.push({
          champ: 'matriculeRecrutement',
          valeur: criteria.matriculeRecrutement,
          personnel: p,
        });
      }
    }

    if (criteria.matriculeFinancier && criteria.matriculeFinancier.trim().length > 0) {
      const found = await this.findByCriteria(
        { matriculeFinancier: criteria.matriculeFinancier },
        excludePersonnelId,
      );
      for (const p of found) {
        results.push({
          champ: 'matriculeFinancier',
          valeur: criteria.matriculeFinancier,
          personnel: p,
        });
      }
    }

    return results;
  }

  async hasDoublon(criteria: DoublonCriteria, excludePersonnelId?: string): Promise<boolean> {
    const doublons = await this.findDoublons(criteria, excludePersonnelId);
    return doublons.length > 0;
  }

  private async findByCriteria(
    where: Partial<Pick<Personnel, 'numeroCIN' | 'matriculeRecrutement' | 'matriculeFinancier'>>,
    excludePersonnelId?: string,
  ): Promise<Personnel[]> {
    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.grade', 'grade')
      .leftJoinAndSelect('p.unite', 'unite')
      .where('p.actif = :actif', { actif: true });

    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        qb.andWhere(`p.${key} = :${key}`, { [key]: value });
      }
    }

    if (excludePersonnelId) {
      qb.andWhere('p.id != :excludeId', { excludeId: excludePersonnelId });
    }

    return qb.getMany();
  }
}