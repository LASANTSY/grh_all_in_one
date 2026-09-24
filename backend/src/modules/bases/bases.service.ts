import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Base } from './entities/base.entity';
import { CreateBaseDto } from './dto/create-base.dto';
import { UpdateBaseDto } from './dto/update-base.dto';

@Injectable()
export class BasesService {
  constructor(
    @InjectRepository(Base)
    private readonly baseRepository: Repository<Base>,
  ) {}

  async findAll(includeInactive = false): Promise<Base[]> {
    const qb = this.baseRepository.createQueryBuilder('b').orderBy('b.nom', 'ASC');

    if (!includeInactive) {
      qb.andWhere('b.actif = :actif', { actif: true });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Base | null> {
    return this.baseRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Base> {
    const base = await this.findById(id);
    if (!base) {
      throw new NotFoundException({
        code: 'BASE_NOT_FOUND',
        message: 'Base introuvable.',
      });
    }
    return base;
  }

  async create(dto: CreateBaseDto): Promise<Base> {
    const existing = await this.baseRepository.findOne({ where: { nom: dto.nom } });
    if (existing) {
      throw new ConflictException({
        code: 'BASE_DUPLICATE_NOM',
        message: 'Une base avec ce nom existe deja.',
      });
    }

    const base = this.baseRepository.create({
      nom: dto.nom,
      ville: dto.ville,
      actif: true,
    });

    return this.baseRepository.save(base);
  }

  async update(id: string, dto: UpdateBaseDto): Promise<Base> {
    const base = await this.findByIdOrFail(id);

    if (dto.nom && dto.nom !== base.nom) {
      const existing = await this.baseRepository.findOne({ where: { nom: dto.nom } });
      if (existing) {
        throw new ConflictException({
          code: 'BASE_DUPLICATE_NOM',
          message: 'Une base avec ce nom existe deja.',
        });
      }
      base.nom = dto.nom;
    }

    if (dto.ville !== undefined) base.ville = dto.ville;
    if (dto.actif !== undefined) base.actif = dto.actif;

    return this.baseRepository.save(base);
  }

  async remove(id: string): Promise<void> {
    const base = await this.findByIdOrFail(id);
    base.actif = false;
    await this.baseRepository.save(base);
  }
}