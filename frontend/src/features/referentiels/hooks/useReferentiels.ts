import { useQuery } from '@tanstack/react-query';
import { referentielService } from '../../personnels/services/referentielService';

export function useBases() {
  return useQuery({
    queryKey: ['referentiels', 'bases'],
    queryFn: () => referentielService.listBases(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUnites(baseId?: string) {
  return useQuery({
    queryKey: ['referentiels', 'unites', baseId ?? 'all'],
    queryFn: () => referentielService.listUnites(baseId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useGrades() {
  return useQuery({
    queryKey: ['referentiels', 'grades'],
    queryFn: () => referentielService.listGrades(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSpecialites() {
  return useQuery({
    queryKey: ['referentiels', 'specialites'],
    queryFn: () => referentielService.listSpecialites(),
    staleTime: 10 * 60 * 1000,
  });
}