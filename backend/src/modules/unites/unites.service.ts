import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unite } from './entities/unite.entity';
import { Base } from '../bases/entities/base.entity';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';

export interface FindUnitesOptions {
  includeInactive?: boolean;
  baseId?: string;
}

@Injectable()
export class UnitesService {
  constructor(
    @InjectRepository(Unite)
    private readonly uniteRepository: Repository<Unite>,
    @InjectRepository(Base)
    private readonly baseRepository: Repository<Base>,
  ) {}

  async findAll(options: FindUnitesOptions = {}): Promise<Unite[]> {
    const qb = this.uniteRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.base', 'base')
      .orderBy('u.nom', 'ASC');

    if (!options.includeInactive) {
      qb.andWhere('u.actif = :actif', { actif: true });
    }

    if (options.baseId) {
      qb.andWhere('u.baseId = :baseId', { baseId: options.baseId });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Unite | null> {
    return this.uniteRepository.findOne({
      where: { id },
      relations: { base: true },
    });
  }

  async findByIdOrFail(id: string): Promise<Unite> {
    const unite = await this.findById(id);
    if (!unite) {
      throw new NotFoundException({
        code: 'UNITE_NOT_FOUND',
        message: 'Unite introuvable.',
      });
    }
    return unite;
  }

  async create(dto: CreateUniteDto): Promise<Unite> {
    await this.assertBaseExists(dto.baseId);

    const existingCode = await this.uniteRepository.findOne({ where: { code: dto.code } });
    if (existingCode) {
      throw new ConflictException({
        code: 'UNITE_DUPLICATE_CODE',
        message: 'Une unite avec ce code existe deja.',
      });
    }

    const unite = this.uniteRepository.create({
      nom: dto.nom,
      code: dto.code,
      baseId: dto.baseId,
      actif: true,
    });

    const saved = await this.uniteRepository.save(unite);
    return this.findByIdOrFail(saved.id);
  }

  async update(id: string, dto: UpdateUniteDto): Promise<Unite> {
    const unite = await this.findByIdOrFail(id);

    if (dto.baseId && dto.baseId !== unite.baseId) {
      await this.assertBaseExists(dto.baseId);
      unite.baseId = dto.baseId;
    }

    if (dto.code && dto.code !== unite.code) {
      const existing = await this.uniteRepository.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== unite.id) {
        throw new ConflictException({
          code: 'UNITE_DUPLICATE_CODE',
          message: 'Une unite avec ce code existe deja.',
        });
      }
      unite.code = dto.code;
    }

    if (dto.nom !== undefined) unite.nom = dto.nom;
    if (dto.actif !== undefined) unite.actif = dto.actif;

    await this.uniteRepository.save(unite);
    return this.findByIdOrFail(unite.id);
  }

  async remove(id: string): Promise<void> {
    const unite = await this.findByIdOrFail(id);
    unite.actif = false;
    await this.uniteRepository.save(unite);
  }

  private async assertBaseExists(baseId: string): Promise<void> {
    const base = await this.baseRepository.findOne({ where: { id: baseId } });
    if (!base) {
      throw new BadRequestException({
        code: 'UNITE_BASE_NOT_FOUND',
        message: 'La base de rattachement est introuvable.',
      });
    }
  }
}