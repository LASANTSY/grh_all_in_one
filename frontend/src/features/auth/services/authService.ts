import { apiClient } from '@/lib/axios';
import type { ChangePasswordPayload, LoginPayload, LoginResponse } from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refresh(): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/refresh');
    return data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post('/auth/change-password', payload);
  },
};