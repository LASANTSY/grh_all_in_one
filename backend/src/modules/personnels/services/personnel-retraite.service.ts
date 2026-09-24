import { Injectable } from '@nestjs/common';
import { addYears, differenceInDays, differenceInYears } from '../../../common/utils/date.util';
import { Personnel } from '../entities/personnel.entity';
import { Grade } from '../../grades/entities/grade.entity';

export enum StatutFinDeLien {
  ACTIF = 'ACTIF',
  ALERTE_ANNUELLE = 'ALERTE_ANNUELLE',
  ALERTE_BIENNALE = 'ALERTE_BIENNALE',
  RETRAITE_DEPASSEE = 'RETRAITE_DEPASSEE',
}

export interface FinDeLienInfo {
  dateFinDeLien: Date;
  ageRetraite: number;
  ageActuel: number;
  joursRestants: number;
  statut: StatutFinDeLien;
}

@Injectable()
export class PersonnelRetraiteService {
  /**
   * Calcule la date de fin de lien d'un personnel selon l'age de depart a la
   * retraite du grade courant et sa date de naissance.
   *
   * Regle retenue (a valider avec le RH) : date_fin = date_naissance + age_depart_grade
   */
  computeDateFinDeLien(personnel: Pick<Personnel, 'dateNaissance'>, grade: Pick<Grade, 'ageDepartRetraite'>): Date {
    const dateNaissance = this.toDate(personnel.dateNaissance);
    return addYears(dateNaissance, grade.ageDepartRetraite);
  }

  /**
   * Calcule le statut de fin de lien selon la date du jour.
   *
   * - RETRAITE_DEPASSEE : la date de fin est dans le passe
   * - ALERTE_ANNUELLE : la date de fin est dans moins de 12 mois
   * - ALERTE_BIENNALE : la date de fin est dans moins de 24 mois
   * - ACTIF : au dela de 24 mois
   */
  computeStatut(dateFinDeLien: Date, now: Date = new Date()): StatutFinDeLien {
    const jours = differenceInDays(now, dateFinDeLien);

    if (jours <= 0) return StatutFinDeLien.RETRAITE_DEPASSEE;
    if (jours <= 365) return StatutFinDeLien.ALERTE_ANNUELLE;
    if (jours <= 730) return StatutFinDeLien.ALERTE_BIENNALE;
    return StatutFinDeLien.ACTIF;
  }

  computeInfo(
    personnel: Pick<Personnel, 'dateNaissance'>,
    grade: Pick<Grade, 'ageDepartRetraite'>,
    now: Date = new Date(),
  ): FinDeLienInfo {
    const dateFinDeLien = this.computeDateFinDeLien(personnel, grade);
    const dateNaissance = this.toDate(personnel.dateNaissance);
    const ageActuel = differenceInYears(dateNaissance, now);
    const joursRestants = differenceInDays(now, dateFinDeLien);
    const statut = this.computeStatut(dateFinDeLien, now);

    return {
      dateFinDeLien,
      ageRetraite: grade.ageDepartRetraite,
      ageActuel,
      joursRestants,
      statut,
    };
  }

  isAlerte(statut: StatutFinDeLien): boolean {
    return (
      statut === StatutFinDeLien.ALERTE_ANNUELLE ||
      statut === StatutFinDeLien.ALERTE_BIENNALE ||
      statut === StatutFinDeLien.RETRAITE_DEPASSEE
    );
  }

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }
}