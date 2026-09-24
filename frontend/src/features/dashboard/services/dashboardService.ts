import { apiClient } from '@/lib/axios';
import type {
  DashboardStats,
  DepartRetraiteItem,
  FinDeLienItem,
  RepartitionItem,
  StatutFinDeLien,
} from '@/types/dashboard';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },

  async getRepartitionBase(): Promise<RepartitionItem[]> {
    const { data } = await apiClient.get<RepartitionItem[]>('/dashboard/repartition-base');
    return data;
  },

  async getRepartitionUnite(baseId?: string): Promise<RepartitionItem[]> {
    const { data } = await apiClient.get<RepartitionItem[]>('/dashboard/repartition-unite', {
      params: baseId ? { baseId } : undefined,
    });
    return data;
  },

  async getRepartitionGrade(): Promise<RepartitionItem[]> {
    const { data } = await apiClient.get<RepartitionItem[]>('/dashboard/repartition-grade');
    return data;
  },

  async getRepartitionSpecialite(): Promise<RepartitionItem[]> {
    const { data } = await apiClient.get<RepartitionItem[]>('/dashboard/repartition-specialite');
    return data;
  },

  async getDepartsRetraite(anneeDebut?: number, anneeFin?: number): Promise<DepartRetraiteItem[]> {
    const { data } = await apiClient.get<DepartRetraiteItem[]>('/dashboard/departs-retraite', {
      params: {
        ...(anneeDebut ? { anneeDebut } : {}),
        ...(anneeFin ? { anneeFin } : {}),
      },
    });
    return data;
  },

  async getFinDeLien(statut?: StatutFinDeLien): Promise<FinDeLienItem[]> {
    const { data } = await apiClient.get<FinDeLienItem[]>('/dashboard/fin-de-lien', {
      params: statut ? { statut } : undefined,
    });
    return data;
  },
};