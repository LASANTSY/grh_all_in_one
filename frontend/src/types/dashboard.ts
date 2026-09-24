export interface DashboardStats {
  effectifTotal: number;
  parCategorie: Array<{ categorie: string; total: number }>;
  personnelFinDeLien: number;
  personnelRetraite: number;
}

export interface RepartitionItem {
  id: string;
  libelle: string;
  total: number;
  pourcentage: number;
}

export interface DepartRetraiteItem {
  annee: number;
  total: number;
}

export type StatutFinDeLien =
  | 'ACTIF'
  | 'ALERTE_ANNUELLE'
  | 'ALERTE_BIENNALE'
  | 'RETRAITE_DEPASSEE';

export interface FinDeLienItem {
  personnelId: string;
  matriculeRecrutement: string;
  nom: string;
  prenoms: string;
  gradeLibelle: string;
  uniteLibelle: string;
  baseLibelle: string;
  dateFinDeLien: string;
  ageActuel: number;
  joursRestants: number;
  statut: StatutFinDeLien;
}