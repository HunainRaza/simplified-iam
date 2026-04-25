import client from './client';
import type { Organization } from '../types';

export const organizationsApi = {
  getAll: async (search?: string): Promise<Organization[]> => {
    const res = await client.get<Organization[]>('/organizations', { params: { search } });
    return res.data;
  },
  create: async (data: { name: string; parentId?: string }): Promise<Organization> => {
    const res = await client.post<Organization>('/organizations', data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/organizations/${id}`);
  },
};
