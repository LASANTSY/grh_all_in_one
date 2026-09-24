import type { Base } from './referentiel';
import type { Grade } from './referentiel';
import type { Specialite } from './referentiel';

export interface UniteBasic {
  id: string;
  nom: string;
  code: string;
  baseId: string;
  base?: Base;
  actif: boolean;
}

export interface PersonnelListItem {
  id: string;
  matriculeRecrutement: string;
  matriculeFinancier: string | null;
  nom: string;
  prenoms: string;
  photoUrl: string | null;
  dateNaissance: string;
  lieuNaissance: string;
  email: string | null;
  telephoneMobile: string | null;
  numeroCIN: string | null;
  grade: Grade;
  unite: UniteBasic;
  specialite: Specialite | null;
  dateFinDeLien: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelSearchParams {
  q?: string;
  nom?: string;
  prenoms?: string;
  matriculeRecrutement?: string;
  numeroCIN?: string;
  gradeId?: string;
  uniteId?: string;
  baseId?: string;
  specialiteId?: string;
  actif?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'nom' | 'prenoms' | 'matriculeRecrutement' | 'dateNaissance' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}