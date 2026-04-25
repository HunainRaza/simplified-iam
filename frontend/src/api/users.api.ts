import client from './client';
import type { User } from '../types';

export const usersApi = {
  getAll: async (search?: string): Promise<User[]> => {
    const res = await client.get<User[]>('/users', { params: { search } });
    return res.data;
  },
  getOne: async (id: string): Promise<User> => {
    const res = await client.get<User>(`/users/${id}`);
    return res.data;
  },
  create: async (data: Partial<User> & { password: string }): Promise<User> => {
    const res = await client.post<User>('/users', data);
    return res.data;
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await client.patch<User>(`/users/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/users/${id}`);
  },
  activate: async (id: string): Promise<User> => {
    const res = await client.patch<User>(`/users/${id}/activate`);
    return res.data;
  },
  deactivate: async (id: string): Promise<User> => {
    const res = await client.patch<User>(`/users/${id}/deactivate`);
    return res.data;
  },
};
