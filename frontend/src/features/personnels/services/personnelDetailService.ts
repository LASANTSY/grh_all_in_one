import { apiClient } from '@/lib/axios';
import type { PersonnelListItem } from '@/types/personnel';

export interface EnfantPayload {
  rang: number;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  sexe: string;
  lienParente: string;
}

export const personnelDetailService = {
  async get(id: string): Promise<PersonnelListItem> {
    const { data } = await apiClient.get<PersonnelListItem>(`/personnels/${id}`);
    return data;
  },

  async listEnfants(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/enfants`);
    return data;
  },

  async addEnfant(id: string, payload: EnfantPayload): Promise<void> {
    await apiClient.post(`/personnels/${id}/enfants`, payload);
  },

  async removeEnfant(id: string, enfantId: string): Promise<void> {
    await apiClient.delete(`/personnels/${id}/enfants/${enfantId}`);
  },

  async listHistoriqueGrades(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/historique-grades`);
    return data;
  },

  async listAffectations(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/affectations`);
    return data;
  },

  async listDecorations(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/decorations`);
    return data;
  },

  async listCursus(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/cursus-scolaire`);
    return data;
  },

  async listStages(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/stages-militaires`);
    return data;
  },

  async listCompetences(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(`/personnels/${id}/competences-linguistiques`);
    return data;
  },

  async update(id: string, payload: Partial<PersonnelListItem>): Promise<PersonnelListItem> {
    const { data } = await apiClient.patch<PersonnelListItem>(`/personnels/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/personnels/${id}`);
  },
};