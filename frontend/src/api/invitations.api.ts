import client from './client';
import type { Invitation } from '../types';

export const invitationsApi = {
  getAll: async (): Promise<Invitation[]> => {
    const res = await client.get<Invitation[]>('/invitations');
    return res.data;
  },
  create: async (emails: string[], organizationId?: string): Promise<Invitation[]> => {
    const res = await client.post<Invitation[]>('/invitations', { emails, organizationId });
    return res.data;
  },
};
