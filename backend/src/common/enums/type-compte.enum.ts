export enum TypeCompte {
  ADMIN_SYSTEME = 'ADMIN_SYSTEME',
  RH_ETAT_MAJOR = 'RH_ETAT_MAJOR',
  RH_BASE = 'RH_BASE',
  CHEF_COMMANDEMENT = 'CHEF_COMMANDEMENT',
  PERSONNEL = 'PERSONNEL',
}

export const TYPES_COMPTE_RH: TypeCompte[] = [
  TypeCompte.ADMIN_SYSTEME,
  TypeCompte.RH_ETAT_MAJOR,
  TypeCompte.RH_BASE,
];

export const TYPES_COMPTE_LECTURE_GLOBALE: TypeCompte[] = [
  TypeCompte.ADMIN_SYSTEME,
  TypeCompte.RH_ETAT_MAJOR,
  TypeCompte.CHEF_COMMANDEMENT,
];