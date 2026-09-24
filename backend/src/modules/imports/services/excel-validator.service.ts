import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Grade } from '../../grades/entities/grade.entity';
import { Unite } from '../../unites/entities/unite.entity';
import { Specialite } from '../../specialites/entities/specialite.entity';
import { Personnel } from '../../personnels/entities/personnel.entity';

import { RawExcelLigne } from './excel-parser.service';

export interface ImportValidationError {
  numeroLigne: number;
  champ: string;
  message: string;
}

export interface ValidatedLigne {
  numeroLigne: number;
  valeurs: Record<string, string | null>;
  valide: boolean;
  erreurs: ImportValidationError[];
  personnelExistantId: string | null;
}

const REQUIRED_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'matriculeRecrutement', label: 'matriculeRecrutement' },
  { key: 'nom', label: 'nom' },
  { key: 'prenoms', label: 'prenoms' },
  { key: 'dateNaissance', label: 'dateNaissance' },
  { key: 'lieuNaissance', label: 'lieuNaissance' },
  { key: 'gradeLibelle', label: 'gradeLibelle' },
  { key: 'uniteCode', label: 'uniteCode' },
];

const DATE_FIELDS = [
  'dateNaissance',
  'dateDelivranceCIN',
  'dateDuplicataCIN',
  'dateDelivrancePasseport',
  'dateEntreeService',
  'dateLiberationServiceNational',
  'datePremierRengagement',
] as const;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class ExcelValidatorService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Unite)
    private readonly uniteRepository: Repository<Unite>,
    @InjectRepository(Specialite)
    private readonly specialiteRepository: Repository<Specialite>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  /**
   * Valide en bloc toutes les lignes.
   * Charge les referentiels en une seule requete pour eviter le N+1.
   */
  async validate(lignes: RawExcelLigne[]): Promise<ValidatedLigne[]> {
    const gradeLibelles = this.distinct(lignes.map((l) => l.valeurs.gradeLibelle));
    const uniteCodes = this.distinct(lignes.map((l) => l.valeurs.uniteCode));
    const specialiteLibelles = this.distinct(lignes.map((l) => l.valeurs.specialiteLibelle));
    const matricules = this.distinct(lignes.map((l) => l.valeurs.matriculeRecrutement));
    const cins = this.distinct(lignes.map((l) => l.valeurs.numeroCIN));

    const grades = await this.gradeRepository.find({
      where: gradeLibelles.length > 0 ? { libelle: In(gradeLibelles), actif: true } : {},
    });
    const unites = await this.uniteRepository.find({
      where: uniteCodes.length > 0 ? { code: In(uniteCodes), actif: true } : {},
    });
    const specialites = await this.specialiteRepository.find({
      where:
        specialiteLibelles.length > 0
          ? { libelle: In(specialiteLibelles), actif: true }
          : {},
    });

    const existingPersonnel = await this.personnelRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.matriculeRecrutement', 'p.numeroCIN'])
      .where(
        matricules.length + cins.length > 0
          ? 'p.matriculeRecrutement IN (:...matricules) OR p.numeroCIN IN (:...cins)'
          : '1=0',
        { matricules: matricules.length > 0 ? matricules : [''], cins: cins.length > 0 ? cins : [''] },
      )
      .getMany();

    const gradeMap = new Map(grades.map((g) => [g.libelle.toLowerCase(), g]));
    const uniteMap = new Map(unites.map((u) => [u.code.toLowerCase(), u]));
    const specialiteMap = new Map(specialites.map((s) => [s.libelle.toLowerCase(), s]));
    const personnelByMatricule = new Map(
      existingPersonnel.map((p) => [p.matriculeRecrutement.toLowerCase(), p]),
    );
    const personnelByCin = new Map(
      existingPersonnel
        .filter((p) => p.numeroCIN)
        .map((p) => [p.numeroCIN!.toLowerCase(), p]),
    );

    // Detection des duplications internes au fichier
    const seenMatricules = new Map<string, number>();
    const seenCins = new Map<string, number>();

    const results: ValidatedLigne[] = [];

    for (const ligne of lignes) {
      const erreurs: ImportValidationError[] = [];

      // Champs obligatoires
      for (const { key, label } of REQUIRED_FIELDS) {
        const v = ligne.valeurs[key];
        if (v === null || v === undefined || v.trim().length === 0) {
          erreurs.push({
            numeroLigne: ligne.numeroLigne,
            champ: label,
            message: `Le champ ${label} est obligatoire.`,
          });
        }
      }

      // Dates
      for (const field of DATE_FIELDS) {
        const v = ligne.valeurs[field];
        if (v && !ISO_DATE_REGEX.test(v)) {
          erreurs.push({
            numeroLigne: ligne.numeroLigne,
            champ: field,
            message: `Le champ ${field} doit etre au format AAAA-MM-JJ.`,
          });
        }
      }

      // Grade
      const gradeKey = ligne.valeurs.gradeLibelle?.toLowerCase().trim();
      if (gradeKey && !gradeMap.has(gradeKey)) {
        erreurs.push({
          numeroLigne: ligne.numeroLigne,
          champ: 'gradeLibelle',
          message: `Grade inconnu : ${ligne.valeurs.gradeLibelle}.`,
        });
      }

      // Unite
      const uniteKey = ligne.valeurs.uniteCode?.toLowerCase().trim();
      if (uniteKey && !uniteMap.has(uniteKey)) {
        erreurs.push({
          numeroLigne: ligne.numeroLigne,
          champ: 'uniteCode',
          message: `Unite inconnue : ${ligne.valeurs.uniteCode}.`,
        });
      }

      // Specialite (optionnelle)
      const specialiteKey = ligne.valeurs.specialiteLibelle?.toLowerCase().trim();
      if (specialiteKey && !specialiteMap.has(specialiteKey)) {
        erreurs.push({
          numeroLigne: ligne.numeroLigne,
          champ: 'specialiteLibelle',
          message: `Specialite inconnue : ${ligne.valeurs.specialiteLibelle}.`,
        });
      }

      // Doublons dans le fichier
      const matricule = ligne.valeurs.matriculeRecrutement?.toLowerCase().trim();
      if (matricule) {
        if (seenMatricules.has(matricule)) {
          erreurs.push({
            numeroLigne: ligne.numeroLigne,
            champ: 'matriculeRecrutement',
            message: `Matricule duplique dans le fichier (deja vu ligne ${seenMatricules.get(matricule)}).`,
          });
        } else {
          seenMatricules.set(matricule, ligne.numeroLigne);
        }
      }

      const cin = ligne.valeurs.numeroCIN?.toLowerCase().trim();
      if (cin) {
        if (seenCins.has(cin)) {
          erreurs.push({
            numeroLigne: ligne.numeroLigne,
            champ: 'numeroCIN',
            message: `CIN dupliquee dans le fichier (deja vue ligne ${seenCins.get(cin)}).`,
          });
        } else {
          seenCins.set(cin, ligne.numeroLigne);
        }
      }

      // Doublon en base
      let personnelExistantId: string | null = null;
      if (matricule && personnelByMatricule.has(matricule)) {
        personnelExistantId = personnelByMatricule.get(matricule)!.id;
      } else if (cin && personnelByCin.has(cin)) {
        personnelExistantId = personnelByCin.get(cin)!.id;
      }

      results.push({
        numeroLigne: ligne.numeroLigne,
        valeurs: ligne.valeurs,
        valide: erreurs.length === 0,
        erreurs,
        personnelExistantId,
      });
    }

    return results;
  }

  private distinct(values: Array<string | null | undefined>): string[] {
    const set = new Set<string>();
    for (const v of values) {
      if (v && v.trim().length > 0) set.add(v.trim());
    }
    return Array.from(set);
  }
}