export type TypeCompte =
  | 'ADMIN_SYSTEME'
  | 'RH_ETAT_MAJOR'
  | 'RH_BASE'
  | 'CHEF_COMMANDEMENT'
  | 'PERSONNEL';

export interface AuthenticatedUser {
  compteId: string;
  identifiant: string;
  typeCompte: TypeCompte;
  personnelId: string | null;
  unitePerimetreId: string | null;
}

export interface LoginPayload {
  identifiant: string;
  motDePasse: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface ChangePasswordPayload {
  motDePasseActuel: string;
  nouveauMotDePasse: string;
}