import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Enfant } from './entities/enfant.entity';
import { HistoriqueGrade } from './entities/historique-grade.entity';
import { Affectation } from './entities/affectation.entity';
import { Decoration } from './entities/decoration.entity';
import { CursusScolaire } from './entities/cursus-scolaire.entity';
import { StageMilitaire } from './entities/stage-militaire.entity';
import { CompetenceLinguistique } from './entities/competence-linguistique.entity';

import { CreateEnfantDto } from './dto/enfant/create-enfant.dto';
import { UpdateEnfantDto } from './dto/enfant/update-enfant.dto';
import { CreateHistoriqueGradeDto } from './dto/historique-grade/create-historique-grade.dto';
import { UpdateHistoriqueGradeDto } from './dto/historique-grade/update-historique-grade.dto';
import { CreateAffectationDto } from './dto/affectation/create-affectation.dto';
import { UpdateAffectationDto } from './dto/affectation/update-affectation.dto';
import { CreateDecorationDto } from './dto/decoration/create-decoration.dto';
import { UpdateDecorationDto } from './dto/decoration/update-decoration.dto';
import { CreateCursusScolaireDto } from './dto/cursus-scolaire/create-cursus-scolaire.dto';
import { UpdateCursusScolaireDto } from './dto/cursus-scolaire/update-cursus-scolaire.dto';
import { CreateStageMilitaireDto } from './dto/stage-militaire/create-stage-militaire.dto';
import { UpdateStageMilitaireDto } from './dto/stage-militaire/update-stage-militaire.dto';
import { CreateCompetenceLinguistiqueDto } from './dto/competence-linguistique/create-competence-linguistique.dto';
import { UpdateCompetenceLinguistiqueDto } from './dto/competence-linguistique/update-competence-linguistique.dto';

@Injectable()
export class PersonnelsHistoriquesService {
  constructor(
    @InjectRepository(Enfant)
    private readonly enfantRepository: Repository<Enfant>,
    @InjectRepository(HistoriqueGrade)
    private readonly historiqueGradeRepository: Repository<HistoriqueGrade>,
    @InjectRepository(Affectation)
    private readonly affectationRepository: Repository<Affectation>,
    @InjectRepository(Decoration)
    private readonly decorationRepository: Repository<Decoration>,
    @InjectRepository(CursusScolaire)
    private readonly cursusScolaireRepository: Repository<CursusScolaire>,
    @InjectRepository(StageMilitaire)
    private readonly stageMilitaireRepository: Repository<StageMilitaire>,
    @InjectRepository(CompetenceLinguistique)
    private readonly competenceLinguistiqueRepository: Repository<CompetenceLinguistique>,
  ) {}

  // ============================================================
  // ENFANTS
  // ============================================================

  async listEnfants(personnelId: string): Promise<Enfant[]> {
    return this.enfantRepository.find({
      where: { personnelId },
      order: { rang: 'ASC' },
    });
  }

  async addEnfant(personnelId: string, dto: CreateEnfantDto): Promise<Enfant> {
    const enfant = this.enfantRepository.create({
      personnelId,
      rang: dto.rang,
      nom: dto.nom,
      prenoms: dto.prenoms,
      dateNaissance: new Date(dto.dateNaissance),
      sexe: dto.sexe,
      lienParente: dto.lienParente,
    });
    return this.enfantRepository.save(enfant);
  }

  async updateEnfant(
    personnelId: string,
    enfantId: string,
    dto: UpdateEnfantDto,
  ): Promise<Enfant> {
    const enfant = await this.enfantRepository.findOne({
      where: { id: enfantId, personnelId },
    });
    if (!enfant) {
      throw new NotFoundException({
        code: 'ENFANT_NOT_FOUND',
        message: 'Enfant introuvable pour ce personnel.',
      });
    }

    if (dto.rang !== undefined) enfant.rang = dto.rang;
    if (dto.nom !== undefined) enfant.nom = dto.nom;
    if (dto.prenoms !== undefined) enfant.prenoms = dto.prenoms;
    if (dto.dateNaissance !== undefined) enfant.dateNaissance = new Date(dto.dateNaissance);
    if (dto.sexe !== undefined) enfant.sexe = dto.sexe;
    if (dto.lienParente !== undefined) enfant.lienParente = dto.lienParente;

    return this.enfantRepository.save(enfant);
  }

  async removeEnfant(personnelId: string, enfantId: string): Promise<void> {
    const enfant = await this.enfantRepository.findOne({
      where: { id: enfantId, personnelId },
    });
    if (!enfant) {
      throw new NotFoundException({
        code: 'ENFANT_NOT_FOUND',
        message: 'Enfant introuvable pour ce personnel.',
      });
    }
    await this.enfantRepository.remove(enfant);
  }

  // ============================================================
  // HISTORIQUE DES GRADES
  // ============================================================

  async listHistoriqueGrades(personnelId: string): Promise<HistoriqueGrade[]> {
    return this.historiqueGradeRepository.find({
      where: { personnelId },
      relations: { grade: true },
      order: { datePriseCommandement: 'DESC' },
    });
  }

  async addHistoriqueGrade(
    personnelId: string,
    dto: CreateHistoriqueGradeDto,
  ): Promise<HistoriqueGrade> {
    const entree = this.historiqueGradeRepository.create({
      personnelId,
      gradeId: dto.gradeId,
      referenceDecret: dto.referenceDecret ?? null,
      datePriseCommandement: new Date(dto.datePriseCommandement),
      observations: dto.observations ?? null,
    });
    const saved = await this.historiqueGradeRepository.save(entree);
    return this.findHistoriqueGradeOrFail(personnelId, saved.id);
  }

  async updateHistoriqueGrade(
    personnelId: string,
    id: string,
    dto: UpdateHistoriqueGradeDto,
  ): Promise<HistoriqueGrade> {
    const entree = await this.historiqueGradeRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'HISTORIQUE_GRADE_NOT_FOUND',
        message: 'Entree de l historique des grades introuvable.',
      });
    }

    if (dto.gradeId !== undefined) entree.gradeId = dto.gradeId;
    if (dto.referenceDecret !== undefined) entree.referenceDecret = dto.referenceDecret ?? null;
    if (dto.datePriseCommandement !== undefined)
      entree.datePriseCommandement = new Date(dto.datePriseCommandement);
    if (dto.observations !== undefined) entree.observations = dto.observations ?? null;

    await this.historiqueGradeRepository.save(entree);
    return this.findHistoriqueGradeOrFail(personnelId, entree.id);
  }

  async removeHistoriqueGrade(personnelId: string, id: string): Promise<void> {
    const entree = await this.historiqueGradeRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'HISTORIQUE_GRADE_NOT_FOUND',
        message: 'Entree de l historique des grades introuvable.',
      });
    }
    await this.historiqueGradeRepository.remove(entree);
  }

  private async findHistoriqueGradeOrFail(
    personnelId: string,
    id: string,
  ): Promise<HistoriqueGrade> {
    const entree = await this.historiqueGradeRepository.findOne({
      where: { id, personnelId },
      relations: { grade: true },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'HISTORIQUE_GRADE_NOT_FOUND',
        message: 'Entree de l historique des grades introuvable.',
      });
    }
    return entree;
  }

  // ============================================================
  // AFFECTATIONS
  // ============================================================

  async listAffectations(personnelId: string): Promise<Affectation[]> {
    return this.affectationRepository.find({
      where: { personnelId },
      relations: { unite: true },
      order: { dateEffet: 'DESC' },
    });
  }

  async addAffectation(
    personnelId: string,
    dto: CreateAffectationDto,
  ): Promise<Affectation> {
    const entree = this.affectationRepository.create({
      personnelId,
      uniteId: dto.uniteId,
      decision: dto.decision ?? null,
      dateEffet: new Date(dto.dateEffet),
      fonctionEmploi: dto.fonctionEmploi ?? null,
      observations: dto.observations ?? null,
    });
    const saved = await this.affectationRepository.save(entree);
    return this.findAffectationOrFail(personnelId, saved.id);
  }

  async updateAffectation(
    personnelId: string,
    id: string,
    dto: UpdateAffectationDto,
  ): Promise<Affectation> {
    const entree = await this.affectationRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'AFFECTATION_NOT_FOUND',
        message: 'Affectation introuvable.',
      });
    }

    if (dto.uniteId !== undefined) entree.uniteId = dto.uniteId;
    if (dto.decision !== undefined) entree.decision = dto.decision ?? null;
    if (dto.dateEffet !== undefined) entree.dateEffet = new Date(dto.dateEffet);
    if (dto.fonctionEmploi !== undefined) entree.fonctionEmploi = dto.fonctionEmploi ?? null;
    if (dto.observations !== undefined) entree.observations = dto.observations ?? null;

    await this.affectationRepository.save(entree);
    return this.findAffectationOrFail(personnelId, entree.id);
  }

  async removeAffectation(personnelId: string, id: string): Promise<void> {
    const entree = await this.affectationRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'AFFECTATION_NOT_FOUND',
        message: 'Affectation introuvable.',
      });
    }
    await this.affectationRepository.remove(entree);
  }

  async findDerniereAffectation(personnelId: string): Promise<Affectation | null> {
    return this.affectationRepository.findOne({
      where: { personnelId },
      relations: { unite: true },
      order: { dateEffet: 'DESC' },
    });
  }

  private async findAffectationOrFail(
    personnelId: string,
    id: string,
  ): Promise<Affectation> {
    const entree = await this.affectationRepository.findOne({
      where: { id, personnelId },
      relations: { unite: true },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'AFFECTATION_NOT_FOUND',
        message: 'Affectation introuvable.',
      });
    }
    return entree;
  }

  // ============================================================
  // DECORATIONS
  // ============================================================

  async listDecorations(personnelId: string): Promise<Decoration[]> {
    return this.decorationRepository.find({
      where: { personnelId },
      order: { dateEffet: 'DESC' },
    });
  }

  async addDecoration(
    personnelId: string,
    dto: CreateDecorationDto,
  ): Promise<Decoration> {
    const entree = this.decorationRepository.create({
      personnelId,
      libelle: dto.libelle,
      reference: dto.reference ?? null,
      dateEffet: new Date(dto.dateEffet),
      observations: dto.observations ?? null,
    });
    return this.decorationRepository.save(entree);
  }

  async updateDecoration(
    personnelId: string,
    id: string,
    dto: UpdateDecorationDto,
  ): Promise<Decoration> {
    const entree = await this.decorationRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'DECORATION_NOT_FOUND',
        message: 'Decoration introuvable.',
      });
    }

    if (dto.libelle !== undefined) entree.libelle = dto.libelle;
    if (dto.reference !== undefined) entree.reference = dto.reference ?? null;
    if (dto.dateEffet !== undefined) entree.dateEffet = new Date(dto.dateEffet);
    if (dto.observations !== undefined) entree.observations = dto.observations ?? null;

    return this.decorationRepository.save(entree);
  }

  async removeDecoration(personnelId: string, id: string): Promise<void> {
    const entree = await this.decorationRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'DECORATION_NOT_FOUND',
        message: 'Decoration introuvable.',
      });
    }
    await this.decorationRepository.remove(entree);
  }

  // ============================================================
  // CURSUS SCOLAIRE
  // ============================================================

  async listCursusScolaire(personnelId: string): Promise<CursusScolaire[]> {
    return this.cursusScolaireRepository.find({
      where: { personnelId },
      order: { dateDebut: 'DESC' },
    });
  }

  async addCursusScolaire(
    personnelId: string,
    dto: CreateCursusScolaireDto,
  ): Promise<CursusScolaire> {
    const entree = this.cursusScolaireRepository.create({
      personnelId,
      etablissement: dto.etablissement,
      villePays: dto.villePays ?? null,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
      diplomeObtenu: dto.diplomeObtenu ?? null,
    });
    return this.cursusScolaireRepository.save(entree);
  }

  async updateCursusScolaire(
    personnelId: string,
    id: string,
    dto: UpdateCursusScolaireDto,
  ): Promise<CursusScolaire> {
    const entree = await this.cursusScolaireRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'CURSUS_SCOLAIRE_NOT_FOUND',
        message: 'Element du cursus scolaire introuvable.',
      });
    }

    if (dto.etablissement !== undefined) entree.etablissement = dto.etablissement;
    if (dto.villePays !== undefined) entree.villePays = dto.villePays ?? null;
    if (dto.dateDebut !== undefined) entree.dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : null;
    if (dto.dateFin !== undefined) entree.dateFin = dto.dateFin ? new Date(dto.dateFin) : null;
    if (dto.diplomeObtenu !== undefined) entree.diplomeObtenu = dto.diplomeObtenu ?? null;

    return this.cursusScolaireRepository.save(entree);
  }

  async removeCursusScolaire(personnelId: string, id: string): Promise<void> {
    const entree = await this.cursusScolaireRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'CURSUS_SCOLAIRE_NOT_FOUND',
        message: 'Element du cursus scolaire introuvable.',
      });
    }
    await this.cursusScolaireRepository.remove(entree);
  }

  // ============================================================
  // STAGES MILITAIRES
  // ============================================================

  async listStagesMilitaires(personnelId: string): Promise<StageMilitaire[]> {
    return this.stageMilitaireRepository.find({
      where: { personnelId },
      order: { dateDebut: 'DESC' },
    });
  }

  async addStageMilitaire(
    personnelId: string,
    dto: CreateStageMilitaireDto,
  ): Promise<StageMilitaire> {
    const entree = this.stageMilitaireRepository.create({
      personnelId,
      etablissement: dto.etablissement,
      lieu: dto.lieu ?? null,
      natureFormation: dto.natureFormation,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
      decisionEnvoi: dto.decisionEnvoi ?? null,
      diplomeCertificat: dto.diplomeCertificat ?? null,
    });
    return this.stageMilitaireRepository.save(entree);
  }

  async updateStageMilitaire(
    personnelId: string,
    id: string,
    dto: UpdateStageMilitaireDto,
  ): Promise<StageMilitaire> {
    const entree = await this.stageMilitaireRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'STAGE_MILITAIRE_NOT_FOUND',
        message: 'Stage militaire introuvable.',
      });
    }

    if (dto.etablissement !== undefined) entree.etablissement = dto.etablissement;
    if (dto.lieu !== undefined) entree.lieu = dto.lieu ?? null;
    if (dto.natureFormation !== undefined) entree.natureFormation = dto.natureFormation;
    if (dto.dateDebut !== undefined) entree.dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : null;
    if (dto.dateFin !== undefined) entree.dateFin = dto.dateFin ? new Date(dto.dateFin) : null;
    if (dto.decisionEnvoi !== undefined) entree.decisionEnvoi = dto.decisionEnvoi ?? null;
    if (dto.diplomeCertificat !== undefined)
      entree.diplomeCertificat = dto.diplomeCertificat ?? null;

    return this.stageMilitaireRepository.save(entree);
  }

  async removeStageMilitaire(personnelId: string, id: string): Promise<void> {
    const entree = await this.stageMilitaireRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'STAGE_MILITAIRE_NOT_FOUND',
        message: 'Stage militaire introuvable.',
      });
    }
    await this.stageMilitaireRepository.remove(entree);
  }

  // ============================================================
  // COMPETENCES LINGUISTIQUES
  // ============================================================

  async listCompetencesLinguistiques(personnelId: string): Promise<CompetenceLinguistique[]> {
    return this.competenceLinguistiqueRepository.find({
      where: { personnelId },
      order: { langue: 'ASC' },
    });
  }

  async addCompetenceLinguistique(
    personnelId: string,
    dto: CreateCompetenceLinguistiqueDto,
  ): Promise<CompetenceLinguistique> {
    const entree = this.competenceLinguistiqueRepository.create({
      personnelId,
      langue: dto.langue,
      niveauEcrit: dto.niveauEcrit,
      niveauParle: dto.niveauParle,
    });
    return this.competenceLinguistiqueRepository.save(entree);
  }

  async updateCompetenceLinguistique(
    personnelId: string,
    id: string,
    dto: UpdateCompetenceLinguistiqueDto,
  ): Promise<CompetenceLinguistique> {
    const entree = await this.competenceLinguistiqueRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'COMPETENCE_LINGUISTIQUE_NOT_FOUND',
        message: 'Competence linguistique introuvable.',
      });
    }

    if (dto.langue !== undefined) entree.langue = dto.langue;
    if (dto.niveauEcrit !== undefined) entree.niveauEcrit = dto.niveauEcrit;
    if (dto.niveauParle !== undefined) entree.niveauParle = dto.niveauParle;

    return this.competenceLinguistiqueRepository.save(entree);
  }

  async removeCompetenceLinguistique(personnelId: string, id: string): Promise<void> {
    const entree = await this.competenceLinguistiqueRepository.findOne({
      where: { id, personnelId },
    });
    if (!entree) {
      throw new NotFoundException({
        code: 'COMPETENCE_LINGUISTIQUE_NOT_FOUND',
        message: 'Competence linguistique introuvable.',
      });
    }
    await this.competenceLinguistiqueRepository.remove(entree);
  }
}