import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { StatutFinDeLien } from '@/types/dashboard';

export function useDepartsRetraite(anneeDebut?: number, anneeFin?: number) {
  return useQuery({
    queryKey: ['dashboard', 'departs-retraite', anneeDebut ?? 'default', anneeFin ?? 'default'],
    queryFn: () => dashboardService.getDepartsRetraite(anneeDebut, anneeFin),
  });
}

export function useFinDeLien(statut?: StatutFinDeLien) {
  return useQuery({
    queryKey: ['dashboard', 'fin-de-lien', statut ?? 'all'],
    queryFn: () => dashboardService.getFinDeLien(statut),
  });
}