import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { GradeCategorie } from './enums/grade-categorie.enum';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

export interface FindGradesOptions {
  includeInactive?: boolean;
  categorie?: GradeCategorie;
}

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async findAll(options: FindGradesOptions = {}): Promise<Grade[]> {
    const qb = this.gradeRepository.createQueryBuilder('g').orderBy('g.ordre', 'ASC');

    if (!options.includeInactive) {
      qb.andWhere('g.actif = :actif', { actif: true });
    }

    if (options.categorie) {
      qb.andWhere('g.categorie = :categorie', { categorie: options.categorie });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Grade | null> {
    return this.gradeRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Grade> {
    const grade = await this.findById(id);
    if (!grade) {
      throw new NotFoundException({
        code: 'GRADE_NOT_FOUND',
        message: 'Grade introuvable.',
      });
    }
    return grade;
  }

  async create(dto: CreateGradeDto): Promise<Grade> {
    const existing = await this.gradeRepository.findOne({ where: { libelle: dto.libelle } });
    if (existing) {
      throw new ConflictException({
        code: 'GRADE_DUPLICATE_LIBELLE',
        message: 'Un grade avec ce libelle existe deja.',
      });
    }

    const grade = this.gradeRepository.create({
      libelle: dto.libelle,
      categorie: dto.categorie,
      ageDepartRetraite: dto.ageDepartRetraite,
      ordre: dto.ordre,
      actif: true,
    });

    return this.gradeRepository.save(grade);
  }

  async update(id: string, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findByIdOrFail(id);

    if (dto.libelle && dto.libelle !== grade.libelle) {
      const existing = await this.gradeRepository.findOne({ where: { libelle: dto.libelle } });
      if (existing && existing.id !== grade.id) {
        throw new ConflictException({
          code: 'GRADE_DUPLICATE_LIBELLE',
          message: 'Un grade avec ce libelle existe deja.',
        });
      }
      grade.libelle = dto.libelle;
    }

    if (dto.categorie !== undefined) grade.categorie = dto.categorie;
    if (dto.ageDepartRetraite !== undefined) grade.ageDepartRetraite = dto.ageDepartRetraite;
    if (dto.ordre !== undefined) grade.ordre = dto.ordre;
    if (dto.actif !== undefined) grade.actif = dto.actif;

    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findByIdOrFail(id);
    grade.actif = false;
    await this.gradeRepository.save(grade);
  }
}