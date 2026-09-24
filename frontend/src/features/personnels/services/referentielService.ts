import { apiClient } from '@/lib/axios';
import type { Base, Grade, Specialite, Unite } from '@/types/referentiel';

export const referentielService = {
  async listBases(): Promise<Base[]> {
    const { data } = await apiClient.get<Base[]>('/bases');
    return data;
  },

  async listUnites(baseId?: string): Promise<Unite[]> {
    const { data } = await apiClient.get<Unite[]>('/unites', {
      params: baseId ? { baseId } : undefined,
    });
    return data;
  },

  async listGrades(): Promise<Grade[]> {
    const { data } = await apiClient.get<Grade[]>('/grades');
    return data;
  },

  async listSpecialites(): Promise<Specialite[]> {
    const { data } = await apiClient.get<Specialite[]>('/specialites');
    return data;
  },
};
