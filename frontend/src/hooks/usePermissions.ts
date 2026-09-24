import { useMemo } from 'react';
import { useAuth } from '@/app/auth-context';
import type { TypeCompte } from '@/types/auth';

export interface Permissions {
  canViewDashboard: boolean;
  canViewPersonnels: boolean;
  canCreatePersonnel: boolean;
  canEditPersonnel: boolean;
  canDeletePersonnel: boolean;
  canViewImports: boolean;
  canImport: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canManageReferentiels: boolean;
  canViewAudit: boolean;
  canValidateDemandes: boolean;
  canSubmitDemande: boolean;
}

const RH_WRITE: TypeCompte[] = ['ADMIN_SYSTEME', 'RH_ETAT_MAJOR', 'RH_BASE'];
const VIEW_ALL: TypeCompte[] = [
  'ADMIN_SYSTEME',
  'RH_ETAT_MAJOR',
  'RH_BASE',
  'CHEF_COMMANDEMENT',
];

export function usePermissions(): Permissions {
  const { user } = useAuth();

  return useMemo<Permissions>(() => {
    const role = user?.typeCompte;

    return {
      canViewDashboard: role !== undefined && VIEW_ALL.includes(role),
      canViewPersonnels: role !== undefined && VIEW_ALL.includes(role),
      canCreatePersonnel: role !== undefined && RH_WRITE.includes(role),
      canEditPersonnel: role !== undefined && RH_WRITE.includes(role),
      canDeletePersonnel: role !== undefined && RH_WRITE.includes(role),
      canViewImports: role !== undefined && RH_WRITE.includes(role),
      canImport: role !== undefined && RH_WRITE.includes(role),
      canViewUsers: role === 'ADMIN_SYSTEME',
      canManageUsers: role === 'ADMIN_SYSTEME',
      canManageReferentiels: role === 'ADMIN_SYSTEME',
      canViewAudit: role === 'ADMIN_SYSTEME' || role === 'RH_ETAT_MAJOR',
      canValidateDemandes: role !== undefined && RH_WRITE.includes(role),
      canSubmitDemande: role === 'PERSONNEL',
    };
  }, [user]);
}