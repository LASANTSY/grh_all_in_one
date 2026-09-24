export interface Base {
  id: string;
  nom: string;
  ville: string;
  actif: boolean;
}

export interface Unite {
  id: string;
  nom: string;
  code: string;
  baseId: string;
  base?: Base;
  actif: boolean;
}

export type GradeCategorie =
  | 'OFFICIER_GENERAL'
  | 'OFFICIER_MARINE'
  | 'OFFICIER_MARINIER'
  | 'QMO';

export interface Grade {
  id: string;
  libelle: string;
  categorie: GradeCategorie;
  ageDepartRetraite: number;
  ordre: number;
  actif: boolean;
}

export interface Specialite {
  id: string;
  libelle: string;
  actif: boolean;
}