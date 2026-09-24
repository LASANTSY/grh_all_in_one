import { TypeCompte } from '../enums/type-compte.enum';

export interface AuthenticatedUser {
  compteId: string;
  identifiant: string;
  typeCompte: TypeCompte;
  personnelId: string | null;
  unitePerimetreId: string | null;
}