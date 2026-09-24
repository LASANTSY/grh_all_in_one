import { apiClient } from '@/lib/axios';
import type {
  PaginatedResult,
  PersonnelListItem,
  PersonnelSearchParams,
} from '@/types/personnel';

export const personnelService = {
  async search(params: PersonnelSearchParams): Promise<PaginatedResult<PersonnelListItem>> {
    const { data } = await apiClient.get<PaginatedResult<PersonnelListItem>>('/personnels', {
      params,
    });
    return data;
  },

  async findById(id: string): Promise<PersonnelListItem> {
    const { data } = await apiClient.get<PersonnelListItem>(`/personnels/${id}`);
    return data;
  },
};