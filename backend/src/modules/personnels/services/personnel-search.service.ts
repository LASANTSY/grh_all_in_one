import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { Personnel } from '../entities/personnel.entity';
import {
  PersonnelSortField,
  SearchPersonnelDto,
  SortOrder,
} from '../dto/search-personnel.dto';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../../common/utils/pagination.util';

@Injectable()
export class PersonnelSearchService {
  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async search(dto: SearchPersonnelDto): Promise<PaginatedResult<Personnel>> {
    const pagination = buildPagination(dto.page, dto.limit);

    const qb = this.personnelRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.grade', 'grade')
      .leftJoinAndSelect('p.unite', 'unite')
      .leftJoinAndSelect('unite.base', 'base')
      .leftJoinAndSelect('p.specialite', 'specialite');

    this.applyTextSearch(qb, dto);
    this.applyExactFilters(qb, dto);
    this.applyDateFilters(qb, dto);
    this.applyActifFilter(qb, dto);

    this.applySorting(qb, dto.sortBy, dto.sortOrder);

    qb.skip(pagination.skip).take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination);
  }

  private applyTextSearch(qb: SelectQueryBuilder<Personnel>, dto: SearchPersonnelDto): void {
    if (dto.q && dto.q.trim().length > 0) {
      const term = dto.q.trim();
      qb.andWhere(
        `(
          p.nom ILIKE :likeTerm
          OR p.prenoms ILIKE :likeTerm
          OR p.matriculeRecrutement ILIKE :likeTerm
          OR p.matriculeFinancier ILIKE :likeTerm
          OR p.numeroCIN ILIKE :likeTerm
          OR word_similarity(:rawTerm, p.nom) > 0.3
          OR word_similarity(:rawTerm, p.prenoms) > 0.3
        )`,
        { likeTerm: `%${term}%`, rawTerm: term },
      );
    }

    if (dto.nom) {
      qb.andWhere('p.nom ILIKE :nom', { nom: `%${dto.nom.trim()}%` });
    }

    if (dto.prenoms) {
      qb.andWhere('p.prenoms ILIKE :prenoms', { prenoms: `%${dto.prenoms.trim()}%` });
    }

    if (dto.matriculeRecrutement) {
      qb.andWhere('p.matriculeRecrutement = :mr', { mr: dto.matriculeRecrutement });
    }

    if (dto.matriculeFinancier) {
      qb.andWhere('p.matriculeFinancier = :mf', { mf: dto.matriculeFinancier });
    }

    if (dto.numeroCIN) {
      qb.andWhere('p.numeroCIN = :cin', { cin: dto.numeroCIN });
    }
  }

  private applyExactFilters(qb: SelectQueryBuilder<Personnel>, dto: SearchPersonnelDto): void {
    if (dto.gradeId) qb.andWhere('p.gradeId = :gradeId', { gradeId: dto.gradeId });
    if (dto.uniteId) qb.andWhere('p.uniteId = :uniteId', { uniteId: dto.uniteId });
    if (dto.specialiteId)
      qb.andWhere('p.specialiteId = :specialiteId', { specialiteId: dto.specialiteId });
    if (dto.baseId) qb.andWhere('unite.baseId = :baseId', { baseId: dto.baseId });
  }

  private applyDateFilters(qb: SelectQueryBuilder<Personnel>, dto: SearchPersonnelDto): void {
    if (dto.dateNaissance) {
      qb.andWhere('p.dateNaissance = :dn', { dn: dto.dateNaissance });
    }
    if (dto.dateNaissanceMin) {
      qb.andWhere('p.dateNaissance >= :dnMin', { dnMin: dto.dateNaissanceMin });
    }
    if (dto.dateNaissanceMax) {
      qb.andWhere('p.dateNaissance <= :dnMax', { dnMax: dto.dateNaissanceMax });
    }
  }

  private applyActifFilter(qb: SelectQueryBuilder<Personnel>, dto: SearchPersonnelDto): void {
    if (dto.actif === undefined) {
      qb.andWhere('p.actif = :actif', { actif: true });
    } else {
      qb.andWhere('p.actif = :actif', { actif: dto.actif });
    }
  }

  private applySorting(
    qb: SelectQueryBuilder<Personnel>,
    sortBy?: PersonnelSortField,
    sortOrder?: SortOrder,
  ): void {
    const field = sortBy ?? 'nom';
    const order = sortOrder ?? 'ASC';

    const columnMap: Record<PersonnelSortField, string> = {
      nom: 'p.nom',
      prenoms: 'p.prenoms',
      matriculeRecrutement: 'p.matriculeRecrutement',
      dateNaissance: 'p.dateNaissance',
      createdAt: 'p.createdAt',
    };

    qb.orderBy(columnMap[field], order);
    if (field !== 'prenoms') {
      qb.addOrderBy('p.prenoms', 'ASC');
    }
  }
}