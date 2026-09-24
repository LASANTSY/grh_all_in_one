import { useQuery } from '@tanstack/react-query';
import { personnelService } from '../services/personnelService';
import type { PersonnelSearchParams } from '@/types/personnel';

export function usePersonnels(params: PersonnelSearchParams) {
  return useQuery({
    queryKey: ['personnels', 'list', params],
    queryFn: () => personnelService.search(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePersonnel(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', 'detail', id],
    queryFn: () => personnelService.findById(id!),
    enabled: Boolean(id),
  });
}