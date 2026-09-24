import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { personnelDetailService } from '../services/personnelDetailService';

export function usePersonnel(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', 'detail', id],
    queryFn: () => personnelDetailService.get(id!),
    enabled: Boolean(id),
  });
}

export function useEnfants(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'enfants'],
    queryFn: () => personnelDetailService.listEnfants(id!),
    enabled: Boolean(id),
  });
}

export function useHistoriqueGrades(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'historique-grades'],
    queryFn: () => personnelDetailService.listHistoriqueGrades(id!),
    enabled: Boolean(id),
  });
}

export function useAffectations(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'affectations'],
    queryFn: () => personnelDetailService.listAffectations(id!),
    enabled: Boolean(id),
  });
}

export function useDecorations(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'decorations'],
    queryFn: () => personnelDetailService.listDecorations(id!),
    enabled: Boolean(id),
  });
}

export function useCursus(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'cursus'],
    queryFn: () => personnelDetailService.listCursus(id!),
    enabled: Boolean(id),
  });
}

export function useStages(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'stages'],
    queryFn: () => personnelDetailService.listStages(id!),
    enabled: Boolean(id),
  });
}

export function useCompetences(id: string | undefined) {
  return useQuery({
    queryKey: ['personnels', id, 'competences'],
    queryFn: () => personnelDetailService.listCompetences(id!),
    enabled: Boolean(id),
  });
}

export function useAddEnfant(personnelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof personnelDetailService.addEnfant>[1]) =>
      personnelDetailService.addEnfant(personnelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'enfants'] });
    },
  });
}

export function useRemoveEnfant(personnelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enfantId: string) => personnelDetailService.removeEnfant(personnelId, enfantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'enfants'] });
    },
  });
}