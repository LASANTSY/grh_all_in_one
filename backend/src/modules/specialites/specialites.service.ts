import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialite } from './entities/specialite.entity';
import { CreateSpecialiteDto } from './dto/create-specialite.dto';
import { UpdateSpecialiteDto } from './dto/update-specialite.dto';

@Injectable()
export class SpecialitesService {
  constructor(
    @InjectRepository(Specialite)
    private readonly specialiteRepository: Repository<Specialite>,
  ) {}

  async findAll(includeInactive = false): Promise<Specialite[]> {
    const qb = this.specialiteRepository.createQueryBuilder('s').orderBy('s.libelle', 'ASC');

    if (!includeInactive) {
      qb.andWhere('s.actif = :actif', { actif: true });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Specialite | null> {
    return this.specialiteRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Specialite> {
    const specialite = await this.findById(id);
    if (!specialite) {
      throw new NotFoundException({
        code: 'SPECIALITE_NOT_FOUND',
        message: 'Specialite introuvable.',
      });
    }
    return specialite;
  }

  async create(dto: CreateSpecialiteDto): Promise<Specialite> {
    const existing = await this.specialiteRepository.findOne({ where: { libelle: dto.libelle } });
    if (existing) {
      throw new ConflictException({
        code: 'SPECIALITE_DUPLICATE_LIBELLE',
        message: 'Une specialite avec ce libelle existe deja.',
      });
    }

    const specialite = this.specialiteRepository.create({
      libelle: dto.libelle,
      actif: true,
    });

    return this.specialiteRepository.save(specialite);
  }

  async update(id: string, dto: UpdateSpecialiteDto): Promise<Specialite> {
    const specialite = await this.findByIdOrFail(id);

    if (dto.libelle && dto.libelle !== specialite.libelle) {
      const existing = await this.specialiteRepository.findOne({
        where: { libelle: dto.libelle },
      });
      if (existing && existing.id !== specialite.id) {
        throw new ConflictException({
          code: 'SPECIALITE_DUPLICATE_LIBELLE',
          message: 'Une specialite avec ce libelle existe deja.',
        });
      }
      specialite.libelle = dto.libelle;
    }

    if (dto.actif !== undefined) specialite.actif = dto.actif;

    return this.specialiteRepository.save(specialite);
  }

  async remove(id: string): Promise<void> {
    const specialite = await this.findByIdOrFail(id);
    specialite.actif = false;
    await this.specialiteRepository.save(specialite);
  }
}