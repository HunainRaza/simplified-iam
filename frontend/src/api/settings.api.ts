import client from './client';
import type { AuthSettings } from '../types';

export const settingsApi = {
  get: async (): Promise<AuthSettings> => {
    const res = await client.get<AuthSettings>('/settings');
    return res.data;
  },
  update: async (data: Partial<AuthSettings>): Promise<AuthSettings> => {
    const res = await client.patch<AuthSettings>('/settings', data);
    return res.data;
  },
};
