import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Personnel } from './entities/personnel.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Unite } from '../unites/entities/unite.entity';

import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { PersonnelResponseDto } from './dto/personnel-response.dto';
import { SearchPersonnelDto } from './dto/search-personnel.dto';

import { PersonnelsHistoriquesService } from './personnels-historiques.service';
import { PersonnelSearchService } from './services/personnel-search.service';
import { PersonnelDoublonService } from './services/personnel-doublon.service';
import {
  FinDeLienInfo,
  PersonnelRetraiteService,
} from './services/personnel-retraite.service';

import { AuditService } from '../audit/audit.service';
import { ActionAudit } from '../audit/entities/entree-audit.entity';

import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TypeCompte } from '../../common/enums/type-compte.enum';
import {
  buildPaginatedResult,
  buildPagination,
  PaginatedResult,
} from '../../common/utils/pagination.util';

export interface PersonnelScope {
  user: AuthenticatedUser;
}

@Injectable()
export class PersonnelsService {
  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Unite)
    private readonly uniteRepository: Repository<Unite>,
    private readonly historiquesService: PersonnelsHistoriquesService,
    private readonly searchService: PersonnelSearchService,
    private readonly doublonService: PersonnelDoublonService,
    private readonly retraiteService: PersonnelRetraiteService,
    private readonly auditService: AuditService,
  ) {}

  // ============================================================
  // RECHERCHE
  // ============================================================

  async search(
    dto: SearchPersonnelDto,
    scope: PersonnelScope,
  ): Promise<PaginatedResult<PersonnelResponseDto>> {
    const restrictedDto = this.applyScopeToSearchDto(dto, scope.user);
    const result = await this.searchService.search(restrictedDto);

    const data = result.data.map((p) => this.toResponseDto(p));

    return {
      ...result,
      data,
    };
  }

  async findById(id: string, scope: PersonnelScope): Promise<PersonnelResponseDto> {
    const personnel = await this.personnelRepository.findOne({
      where: { id },
      relations: { grade: true, unite: { base: true } as never, specialite: true },
    });

    if (!personnel) {
      throw new NotFoundException({
        code: 'PERSONNEL_NOT_FOUND',
        message: 'Fiche personnel introuvable.',
      });
    }

    this.assertCanAccessPersonnel(personnel, scope.user);
    return this.toResponseDto(personnel);
  }

  async findEntityByIdOrFail(id: string): Promise<Personnel> {
    const personnel = await this.personnelRepository.findOne({
      where: { id },
      relations: { grade: true, unite: true, specialite: true },
    });
    if (!personnel) {
      throw new NotFoundException({
        code: 'PERSONNEL_NOT_FOUND',
        message: 'Fiche personnel introuvable.',
      });
    }
    return personnel;
  }

  // ============================================================
  // CREATION
  // ============================================================

  async create(
    dto: CreatePersonnelDto,
    scope: PersonnelScope,
  ): Promise<PersonnelResponseDto> {
    await this.assertReferencesExist(dto.gradeId, dto.uniteId, dto.specialiteId);

    const doublons = await this.doublonService.findDoublons({
      numeroCIN: dto.numeroCIN ?? null,
      matriculeRecrutement: dto.matriculeRecrutement,
      matriculeFinancier: dto.matriculeFinancier ?? null,
    });
    if (doublons.length > 0) {
      throw new ConflictException({
        code: 'PERSONNEL_DUPLICATE',
        message: 'Une fiche avec le meme matricule ou la meme CIN existe deja.',
        details: doublons.map((d) => ({
          champ: d.champ,
          valeur: d.valeur,
          personnelId: d.personnel.id,
        })),
      });
    }

    const unite = await this.uniteRepository.findOne({ where: { id: dto.uniteId } });
    if (!unite) {
      throw new BadRequestException({
        code: 'PERSONNEL_UNITE_NOT_FOUND',
        message: "L'unite d'affectation est introuvable.",
      });
    }
    this.assertCanWriteOnUnite(unite.id, scope.user);

    const entity = this.personnelRepository.create({
      ...this.mapDtoToEntityFields(dto),
      gradeId: dto.gradeId,
      uniteId: dto.uniteId,
      specialiteId: dto.specialiteId ?? null,
      actif: true,
    });

    const saved = await this.personnelRepository.save(entity);
    const reloaded = await this.findEntityByIdOrFail(saved.id);

    await this.auditService.record(
      {
        action: ActionAudit.CREATION,
        entiteType: 'Personnel',
        entiteId: saved.id,
        personnelId: saved.id,
        champModifie: null,
        ancienneValeur: null,
        nouvelleValeur: `${saved.nom} ${saved.prenoms} (${saved.matriculeRecrutement})`,
      },
      { auteurId: scope.user.compteId },
    );

    return this.toResponseDto(reloaded);
  }

  // ============================================================
  // MISE A JOUR
  // ============================================================

  async update(
    id: string,
    dto: UpdatePersonnelDto,
    scope: PersonnelScope,
  ): Promise<PersonnelResponseDto> {
    const personnel = await this.findEntityByIdOrFail(id);
    this.assertCanAccessPersonnel(personnel, scope.user);

    const changedFields = this.computeChangedFields(personnel, dto);

    if (dto.gradeId && dto.gradeId !== personnel.gradeId) {
      const grade = await this.gradeRepository.findOne({ where: { id: dto.gradeId } });
      if (!grade) {
        throw new BadRequestException({
          code: 'PERSONNEL_GRADE_NOT_FOUND',
          message: 'Le grade est introuvable.',
        });
      }
      personnel.gradeId = dto.gradeId;
    }

    if (dto.uniteId && dto.uniteId !== personnel.uniteId) {
      const unite = await this.uniteRepository.findOne({ where: { id: dto.uniteId } });
      if (!unite) {
        throw new BadRequestException({
          code: 'PERSONNEL_UNITE_NOT_FOUND',
          message: "L'unite d'affectation est introuvable.",
        });
      }
      this.assertCanWriteOnUnite(unite.id, scope.user);
      personnel.uniteId = dto.uniteId;
    }

    if (dto.specialiteId !== undefined) {
      personnel.specialiteId = dto.specialiteId ?? null;
    }

    const doublonCheck =
      (dto.numeroCIN !== undefined && dto.numeroCIN !== personnel.numeroCIN) ||
      (dto.matriculeRecrutement !== undefined &&
        dto.matriculeRecrutement !== personnel.matriculeRecrutement) ||
      (dto.matriculeFinancier !== undefined &&
        dto.matriculeFinancier !== personnel.matriculeFinancier);

    if (doublonCheck) {
      const doublons = await this.doublonService.findDoublons(
        {
          numeroCIN: dto.numeroCIN ?? personnel.numeroCIN,
          matriculeRecrutement: dto.matriculeRecrutement ?? personnel.matriculeRecrutement,
          matriculeFinancier: dto.matriculeFinancier ?? personnel.matriculeFinancier,
        },
        personnel.id,
      );
      if (doublons.length > 0) {
        throw new ConflictException({
          code: 'PERSONNEL_DUPLICATE',
          message: 'Une fiche avec le meme matricule ou la meme CIN existe deja.',
          details: doublons.map((d) => ({
            champ: d.champ,
            valeur: d.valeur,
            personnelId: d.personnel.id,
          })),
        });
      }
    }

    this.applyUpdateDto(personnel, dto);

    await this.personnelRepository.save(personnel);
    const reloaded = await this.findEntityByIdOrFail(personnel.id);

    if (changedFields.length > 0) {
      await this.auditService.recordMany(
        changedFields.map((field) => ({
          action: ActionAudit.MODIFICATION,
          entiteType: 'Personnel',
          entiteId: personnel.id,
          personnelId: personnel.id,
          champModifie: field.champ,
          ancienneValeur: field.ancienne,
          nouvelleValeur: field.nouvelle,
        })),
        { auteurId: scope.user.compteId },
      );
    }

    return this.toResponseDto(reloaded);
  }

  // ============================================================
  // SUPPRESSION (soft delete)
  // ============================================================

  async remove(id: string, scope: PersonnelScope): Promise<void> {
    const personnel = await this.findEntityByIdOrFail(id);
    this.assertCanAccessPersonnel(personnel, scope.user);

    await this.personnelRepository.softDelete(personnel.id);

    await this.auditService.record(
      {
        action: ActionAudit.SUPPRESSION,
        entiteType: 'Personnel',
        entiteId: personnel.id,
        personnelId: personnel.id,
        champModifie: null,
        ancienneValeur: `${personnel.nom} ${personnel.prenoms} (${personnel.matriculeRecrutement})`,
        nouvelleValeur: null,
      },
      { auteurId: scope.user.compteId },
    );
  }

  // ============================================================
  // FIN DE LIEN
  // ============================================================

  async computeFinDeLien(id: string): Promise<FinDeLienInfo> {
    const personnel = await this.findEntityByIdOrFail(id);
    return this.retraiteService.computeInfo(personnel, personnel.grade);
  }

  // ============================================================
  // HISTORIQUES - DELEGATION
  // ============================================================

  listEnfants(personnelId: string) {
    return this.historiquesService.listEnfants(personnelId);
  }

  addEnfant(personnelId: string, dto: Parameters<PersonnelsHistoriquesService['addEnfant']>[1]) {
    return this.historiquesService.addEnfant(personnelId, dto);
  }

  updateEnfant(
    personnelId: string,
    enfantId: string,
    dto: Parameters<PersonnelsHistoriquesService['updateEnfant']>[2],
  ) {
    return this.historiquesService.updateEnfant(personnelId, enfantId, dto);
  }

  removeEnfant(personnelId: string, enfantId: string) {
    return this.historiquesService.removeEnfant(personnelId, enfantId);
  }

  listHistoriqueGrades(personnelId: string) {
    return this.historiquesService.listHistoriqueGrades(personnelId);
  }

  addHistoriqueGrade(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addHistoriqueGrade']>[1],
  ) {
    return this.historiquesService.addHistoriqueGrade(personnelId, dto);
  }

  updateHistoriqueGrade(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateHistoriqueGrade']>[2],
  ) {
    return this.historiquesService.updateHistoriqueGrade(personnelId, id, dto);
  }

  removeHistoriqueGrade(personnelId: string, id: string) {
    return this.historiquesService.removeHistoriqueGrade(personnelId, id);
  }

  listAffectations(personnelId: string) {
    return this.historiquesService.listAffectations(personnelId);
  }

  addAffectation(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addAffectation']>[1],
  ) {
    return this.historiquesService.addAffectation(personnelId, dto);
  }

  updateAffectation(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateAffectation']>[2],
  ) {
    return this.historiquesService.updateAffectation(personnelId, id, dto);
  }

  removeAffectation(personnelId: string, id: string) {
    return this.historiquesService.removeAffectation(personnelId, id);
  }

  listDecorations(personnelId: string) {
    return this.historiquesService.listDecorations(personnelId);
  }

  addDecoration(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addDecoration']>[1],
  ) {
    return this.historiquesService.addDecoration(personnelId, dto);
  }

  updateDecoration(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateDecoration']>[2],
  ) {
    return this.historiquesService.updateDecoration(personnelId, id, dto);
  }

  removeDecoration(personnelId: string, id: string) {
    return this.historiquesService.removeDecoration(personnelId, id);
  }

  listCursusScolaire(personnelId: string) {
    return this.historiquesService.listCursusScolaire(personnelId);
  }

  addCursusScolaire(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addCursusScolaire']>[1],
  ) {
    return this.historiquesService.addCursusScolaire(personnelId, dto);
  }

  updateCursusScolaire(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateCursusScolaire']>[2],
  ) {
    return this.historiquesService.updateCursusScolaire(personnelId, id, dto);
  }

  removeCursusScolaire(personnelId: string, id: string) {
    return this.historiquesService.removeCursusScolaire(personnelId, id);
  }

  listStagesMilitaires(personnelId: string) {
    return this.historiquesService.listStagesMilitaires(personnelId);
  }

  addStageMilitaire(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addStageMilitaire']>[1],
  ) {
    return this.historiquesService.addStageMilitaire(personnelId, dto);
  }

  updateStageMilitaire(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateStageMilitaire']>[2],
  ) {
    return this.historiquesService.updateStageMilitaire(personnelId, id, dto);
  }

  removeStageMilitaire(personnelId: string, id: string) {
    return this.historiquesService.removeStageMilitaire(personnelId, id);
  }

  listCompetencesLinguistiques(personnelId: string) {
    return this.historiquesService.listCompetencesLinguistiques(personnelId);
  }

  addCompetenceLinguistique(
    personnelId: string,
    dto: Parameters<PersonnelsHistoriquesService['addCompetenceLinguistique']>[1],
  ) {
    return this.historiquesService.addCompetenceLinguistique(personnelId, dto);
  }

  updateCompetenceLinguistique(
    personnelId: string,
    id: string,
    dto: Parameters<PersonnelsHistoriquesService['updateCompetenceLinguistique']>[2],
  ) {
    return this.historiquesService.updateCompetenceLinguistique(personnelId, id, dto);
  }

  removeCompetenceLinguistique(personnelId: string, id: string) {
    return this.historiquesService.removeCompetenceLinguistique(personnelId, id);
  }

  // ============================================================
  // UTILITAIRES PRIVES
  // ============================================================

  private async assertReferencesExist(
    gradeId: string,
    uniteId: string,
    specialiteId?: string,
  ): Promise<void> {
    const grade = await this.gradeRepository.findOne({ where: { id: gradeId } });
    if (!grade) {
      throw new BadRequestException({
        code: 'PERSONNEL_GRADE_NOT_FOUND',
        message: 'Le grade est introuvable.',
      });
    }

    const unite = await this.uniteRepository.findOne({ where: { id: uniteId } });
    if (!unite) {
      throw new BadRequestException({
        code: 'PERSONNEL_UNITE_NOT_FOUND',
        message: "L'unite d'affectation est introuvable.",
      });
    }

    if (specialiteId) {
      const specialite = await this.personnelRepository.manager.findOne('Specialite', {
        where: { id: specialiteId },
      });
      if (!specialite) {
        throw new BadRequestException({
          code: 'PERSONNEL_SPECIALITE_NOT_FOUND',
          message: 'La specialite est introuvable.',
        });
      }
    }
  }

  private mapDtoToEntityFields(dto: CreatePersonnelDto): Partial<Personnel> {
    const toDate = (v?: string): Date | null => (v ? new Date(v) : null);

    return {
      matriculeRecrutement: dto.matriculeRecrutement,
      matriculeFinancier: dto.matriculeFinancier ?? null,
      nom: dto.nom,
      prenoms: dto.prenoms,
      photoUrl: dto.photoUrl ?? null,
      dateNaissance: new Date(dto.dateNaissance),
      lieuNaissance: dto.lieuNaissance,
      prefecture: dto.prefecture ?? null,
      sousPrefecture: dto.sousPrefecture ?? null,
      province: dto.province ?? null,
      email: dto.email ?? null,
      telephoneMobile: dto.telephoneMobile ?? null,
      adresseActuelle: dto.adresseActuelle ?? null,
      adresseRepli: dto.adresseRepli ?? null,
      contactUrgence: dto.contactUrgence ?? null,
      numeroCIN: dto.numeroCIN ?? null,
      dateDelivranceCIN: toDate(dto.dateDelivranceCIN),
      lieuDelivranceCIN: dto.lieuDelivranceCIN ?? null,
      dateDuplicataCIN: toDate(dto.dateDuplicataCIN),
      numeroPasseport: dto.numeroPasseport ?? null,
      dateDelivrancePasseport: toDate(dto.dateDelivrancePasseport),
      religion: dto.religion ?? null,
      groupeSanguin: dto.groupeSanguin ?? null,
      taille: dto.taille ?? null,
      statutFamilial: dto.statutFamilial ?? null,
      numeroAutorisationMariage: dto.numeroAutorisationMariage ?? null,
      dateAutorisationMariage: toDate(dto.dateAutorisationMariage),
      nomConjoint: dto.nomConjoint ?? null,
      dateNaissanceConjoint: toDate(dto.dateNaissanceConjoint),
      lieuNaissanceConjoint: dto.lieuNaissanceConjoint ?? null,
      fonctionConjoint: dto.fonctionConjoint ?? null,
      nomPere: dto.nomPere ?? null,
      nomMere: dto.nomMere ?? null,
      sportsPratiques: dto.sportsPratiques ?? null,
      corps: dto.corps ?? null,
      lieuEmploi: dto.lieuEmploi ?? null,
      fonctionActuelle: dto.fonctionActuelle ?? null,
      numeroCIM: dto.numeroCIM ?? null,
      dateDelivranceCIM: toDate(dto.dateDelivranceCIM),
      dateEffetSOC_HDRC: toDate(dto.dateEffetSOC_HDRC),
      referenceSOC_HDRC: dto.referenceSOC_HDRC ?? null,
      dateEffetPrimeTechnicite: toDate(dto.dateEffetPrimeTechnicite),
      referencePrimeTechnicite: dto.referencePrimeTechnicite ?? null,
      numeroPermisCivil: dto.numeroPermisCivil ?? null,
      datePermisCivil: toDate(dto.datePermisCivil),
      numeroPermisMilitaire: dto.numeroPermisMilitaire ?? null,
      datePermisMilitaire: toDate(dto.datePermisMilitaire),
      situationMilitaire: dto.situationMilitaire ?? null,
      origineRecrutement: dto.origineRecrutement ?? null,
      dateEntreeService: toDate(dto.dateEntreeService),
      interruptionsService: dto.interruptionsService ?? null,
      dateLiberationServiceNational: toDate(dto.dateLiberationServiceNational),
      datePremierRengagement: toDate(dto.datePremierRengagement),
      niveauInstruction: dto.niveauInstruction ?? null,
      connaissancesInformatiques: dto.connaissancesInformatiques ?? null,
    };
  }

  private applyUpdateDto(personnel: Personnel, dto: UpdatePersonnelDto): void {
    const toDate = (v: string | undefined): Date | null | undefined => {
      if (v === undefined) return undefined;
      return v === null ? null : new Date(v);
    };

    const assignments: Array<[keyof Personnel, unknown]> = [
      ['matriculeRecrutement', dto.matriculeRecrutement],
      ['matriculeFinancier', dto.matriculeFinancier],
      ['nom', dto.nom],
      ['prenoms', dto.prenoms],
      ['photoUrl', dto.photoUrl],
      ['dateNaissance', toDate(dto.dateNaissance)],
      ['lieuNaissance', dto.lieuNaissance],
      ['prefecture', dto.prefecture],
      ['sousPrefecture', dto.sousPrefecture],
      ['province', dto.province],
      ['email', dto.email],
      ['telephoneMobile', dto.telephoneMobile],
      ['adresseActuelle', dto.adresseActuelle],
      ['adresseRepli', dto.adresseRepli],
      ['contactUrgence', dto.contactUrgence],
      ['numeroCIN', dto.numeroCIN],
      ['dateDelivranceCIN', toDate(dto.dateDelivranceCIN)],
      ['lieuDelivranceCIN', dto.lieuDelivranceCIN],
      ['dateDuplicataCIN', toDate(dto.dateDuplicataCIN)],
      ['numeroPasseport', dto.numeroPasseport],
      ['dateDelivrancePasseport', toDate(dto.dateDelivrancePasseport)],
      ['religion', dto.religion],
      ['groupeSanguin', dto.groupeSanguin],
      ['taille', dto.taille],
      ['statutFamilial', dto.statutFamilial],
      ['numeroAutorisationMariage', dto.numeroAutorisationMariage],
      ['dateAutorisationMariage', toDate(dto.dateAutorisationMariage)],
      ['nomConjoint', dto.nomConjoint],
      ['dateNaissanceConjoint', toDate(dto.dateNaissanceConjoint)],
      ['lieuNaissanceConjoint', dto.lieuNaissanceConjoint],
      ['fonctionConjoint', dto.fonctionConjoint],
      ['nomPere', dto.nomPere],
      ['nomMere', dto.nomMere],
      ['sportsPratiques', dto.sportsPratiques],
      ['corps', dto.corps],
      ['lieuEmploi', dto.lieuEmploi],
      ['fonctionActuelle', dto.fonctionActuelle],
      ['numeroCIM', dto.numeroCIM],
      ['dateDelivranceCIM', toDate(dto.dateDelivranceCIM)],
      ['dateEffetSOC_HDRC', toDate(dto.dateEffetSOC_HDRC)],
      ['referenceSOC_HDRC', dto.referenceSOC_HDRC],
      ['dateEffetPrimeTechnicite', toDate(dto.dateEffetPrimeTechnicite)],
      ['referencePrimeTechnicite', dto.referencePrimeTechnicite],
      ['numeroPermisCivil', dto.numeroPermisCivil],
      ['datePermisCivil', toDate(dto.datePermisCivil)],
      ['numeroPermisMilitaire', dto.numeroPermisMilitaire],
      ['datePermisMilitaire', toDate(dto.datePermisMilitaire)],
      ['situationMilitaire', dto.situationMilitaire],
      ['origineRecrutement', dto.origineRecrutement],
      ['dateEntreeService', toDate(dto.dateEntreeService)],
      ['interruptionsService', dto.interruptionsService],
      ['dateLiberationServiceNational', toDate(dto.dateLiberationServiceNational)],
      ['datePremierRengagement', toDate(dto.datePremierRengagement)],
      ['niveauInstruction', dto.niveauInstruction],
      ['connaissancesInformatiques', dto.connaissancesInformatiques],
      ['actif', dto.actif],
    ];

    for (const [key, value] of assignments) {
      if (value !== undefined) {
        (personnel as unknown as Record<string, unknown>)[key as string] = value;
      }
    }
  }

  private computeChangedFields(
    personnel: Personnel,
    dto: UpdatePersonnelDto,
  ): Array<{ champ: string; ancienne: string | null; nouvelle: string | null }> {
    const result: Array<{ champ: string; ancienne: string | null; nouvelle: string | null }> = [];
    const dtoRecord = dto as Record<string, unknown>;
    const personnelRecord = personnel as unknown as Record<string, unknown>;

    const IGNORED_FIELDS = new Set(['gradeId', 'uniteId', 'specialiteId']);

    for (const [key, newValue] of Object.entries(dtoRecord)) {
      if (newValue === undefined) continue;
      if (IGNORED_FIELDS.has(key)) continue;

      const oldValue = personnelRecord[key];
      const oldStr = this.serializeValue(oldValue);
      const newStr = this.serializeValue(newValue);

      if (oldStr !== newStr) {
        result.push({ champ: key, ancienne: oldStr, nouvelle: newStr });
      }
    }

    // Champs relationnels : journalisation explicite
    if (dto.gradeId && dto.gradeId !== personnel.gradeId) {
      result.push({
        champ: 'gradeId',
        ancienne: personnel.gradeId,
        nouvelle: dto.gradeId,
      });
    }
    if (dto.uniteId && dto.uniteId !== personnel.uniteId) {
      result.push({
        champ: 'uniteId',
        ancienne: personnel.uniteId,
        nouvelle: dto.uniteId,
      });
    }
    if (dto.specialiteId !== undefined && dto.specialiteId !== personnel.specialiteId) {
      result.push({
        champ: 'specialiteId',
        ancienne: personnel.specialiteId,
        nouvelle: dto.specialiteId ?? null,
      });
    }

    return result;
  }

  private serializeValue(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }

  private toResponseDto(personnel: Personnel): PersonnelResponseDto {
    const dateFinDeLien = personnel.grade
      ? this.retraiteService.computeDateFinDeLien(personnel, personnel.grade)
      : null;

    return {
      id: personnel.id,
      matriculeRecrutement: personnel.matriculeRecrutement,
      matriculeFinancier: personnel.matriculeFinancier,
      nom: personnel.nom,
      prenoms: personnel.prenoms,
      photoUrl: personnel.photoUrl,
      dateNaissance: personnel.dateNaissance,
      lieuNaissance: personnel.lieuNaissance,
      prefecture: personnel.prefecture,
      sousPrefecture: personnel.sousPrefecture,
      province: personnel.province,
      email: personnel.email,
      telephoneMobile: personnel.telephoneMobile,
      adresseActuelle: personnel.adresseActuelle,
      adresseRepli: personnel.adresseRepli,
      contactUrgence: personnel.contactUrgence,
      numeroCIN: personnel.numeroCIN,
      dateDelivranceCIN: personnel.dateDelivranceCIN,
      lieuDelivranceCIN: personnel.lieuDelivranceCIN,
      dateDuplicataCIN: personnel.dateDuplicataCIN,
      numeroPasseport: personnel.numeroPasseport,
      dateDelivrancePasseport: personnel.dateDelivrancePasseport,
      religion: personnel.religion,
      groupeSanguin: personnel.groupeSanguin,
      taille: personnel.taille,
      statutFamilial: personnel.statutFamilial,
      numeroAutorisationMariage: personnel.numeroAutorisationMariage,
      dateAutorisationMariage: personnel.dateAutorisationMariage,
      nomConjoint: personnel.nomConjoint,
      dateNaissanceConjoint: personnel.dateNaissanceConjoint,
      lieuNaissanceConjoint: personnel.lieuNaissanceConjoint,
      fonctionConjoint: personnel.fonctionConjoint,
      nomPere: personnel.nomPere,
      nomMere: personnel.nomMere,
      sportsPratiques: personnel.sportsPratiques,
      corps: personnel.corps,
      lieuEmploi: personnel.lieuEmploi,
      fonctionActuelle: personnel.fonctionActuelle,
      numeroCIM: personnel.numeroCIM,
      dateDelivranceCIM: personnel.dateDelivranceCIM,
      dateEffetSOC_HDRC: personnel.dateEffetSOC_HDRC,
      referenceSOC_HDRC: personnel.referenceSOC_HDRC,
      dateEffetPrimeTechnicite: personnel.dateEffetPrimeTechnicite,
      referencePrimeTechnicite: personnel.referencePrimeTechnicite,
      numeroPermisCivil: personnel.numeroPermisCivil,
      datePermisCivil: personnel.datePermisCivil,
      numeroPermisMilitaire: personnel.numeroPermisMilitaire,
      datePermisMilitaire: personnel.datePermisMilitaire,
      situationMilitaire: personnel.situationMilitaire,
      origineRecrutement: personnel.origineRecrutement,
      dateEntreeService: personnel.dateEntreeService,
      interruptionsService: personnel.interruptionsService,
      dateLiberationServiceNational: personnel.dateLiberationServiceNational,
      datePremierRengagement: personnel.datePremierRengagement,
      niveauInstruction: personnel.niveauInstruction,
      connaissancesInformatiques: personnel.connaissancesInformatiques,
      grade: personnel.grade,
      unite: personnel.unite,
      specialite: personnel.specialite,
      dateFinDeLien,
      actif: personnel.actif,
      createdAt: personnel.createdAt,
      updatedAt: personnel.updatedAt,
    };
  }

  // ============================================================
  // PERIMETRE ORGANISATIONNEL
  // ============================================================

  private applyScopeToSearchDto(
    dto: SearchPersonnelDto,
    user: AuthenticatedUser,
  ): SearchPersonnelDto {
    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return dto;
    }

    if (
      user.typeCompte === TypeCompte.RH_BASE ||
      user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      if (!user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'PERSONNEL_PERIMETRE_MISSING',
          message: 'Aucun perimetre organisationnel associe a votre compte.',
        });
      }
      return { ...dto, uniteId: user.unitePerimetreId };
    }

    if (user.typeCompte === TypeCompte.PERSONNEL) {
      throw new ForbiddenException({
        code: 'PERSONNEL_ACCESS_FORBIDDEN',
        message: 'Acces a la liste du personnel non autorise pour ce type de compte.',
      });
    }

    return dto;
  }

  private assertCanAccessPersonnel(personnel: Personnel, user: AuthenticatedUser): void {
    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return;
    }

    if (
      user.typeCompte === TypeCompte.RH_BASE ||
      user.typeCompte === TypeCompte.CHEF_COMMANDEMENT
    ) {
      if (!user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'PERSONNEL_PERIMETRE_MISSING',
          message: 'Aucun perimetre organisationnel associe a votre compte.',
        });
      }
      if (personnel.uniteId !== user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'PERSONNEL_OUT_OF_PERIMETRE',
          message: "Cette fiche n'appartient pas a votre perimetre organisationnel.",
        });
      }
      return;
    }

    if (user.typeCompte === TypeCompte.PERSONNEL) {
      if (user.personnelId !== personnel.id) {
        throw new ForbiddenException({
          code: 'PERSONNEL_OUT_OF_SELF',
          message: 'Vous ne pouvez acceder qu a votre propre fiche.',
        });
      }
      return;
    }

    throw new ForbiddenException({
      code: 'PERSONNEL_ACCESS_FORBIDDEN',
      message: 'Acces refuse.',
    });
  }

  private assertCanWriteOnUnite(uniteId: string, user: AuthenticatedUser): void {
    if (
      user.typeCompte === TypeCompte.ADMIN_SYSTEME ||
      user.typeCompte === TypeCompte.RH_ETAT_MAJOR
    ) {
      return;
    }

    if (user.typeCompte === TypeCompte.RH_BASE) {
      if (!user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'PERSONNEL_PERIMETRE_MISSING',
          message: 'Aucun perimetre organisationnel associe a votre compte.',
        });
      }
      if (uniteId !== user.unitePerimetreId) {
        throw new ForbiddenException({
          code: 'PERSONNEL_WRITE_OUT_OF_PERIMETRE',
          message: 'Vous ne pouvez modifier que le personnel de votre unite.',
        });
      }
      return;
    }

    throw new ForbiddenException({
      code: 'PERSONNEL_WRITE_FORBIDDEN',
      message: "Vous n'etes pas autorise a modifier le personnel.",
    });
  }

  buildSimplePaginatedPage<T>(data: T[], total: number, page?: number, limit?: number) {
    return buildPaginatedResult(data, total, buildPagination(page, limit));
  }
}