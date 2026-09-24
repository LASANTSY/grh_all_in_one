import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useRepartitionBase() {
  return useQuery({
    queryKey: ['dashboard', 'repartition-base'],
    queryFn: () => dashboardService.getRepartitionBase(),
  });
}

export function useRepartitionUnite(baseId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'repartition-unite', baseId ?? 'all'],
    queryFn: () => dashboardService.getRepartitionUnite(baseId),
  });
}

export function useRepartitionGrade() {
  return useQuery({
    queryKey: ['dashboard', 'repartition-grade'],
    queryFn: () => dashboardService.getRepartitionGrade(),
  });
}

export function useRepartitionSpecialite() {
  return useQuery({
    queryKey: ['dashboard', 'repartition-specialite'],
    queryFn: () => dashboardService.getRepartitionSpecialite(),
  });
}