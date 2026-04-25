import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { invitationsApi } from '../api/invitations.api';
import { organizationsApi } from '../api/organizations.api';
import { usersApi } from '../api/users.api';
import type { User } from '../types';
import SearchInput from '../components/ui/SearchInput';

export default function InviteUserPage() {
  const [search, setSearch] = useState('');
  const [emails, setEmails] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.getAll(search),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.getAll(),
  });

  const inviteMutation = useMutation({
    mutationFn: () => {
      const emailList = emails
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes('@'));
      return invitationsApi.create(emailList, selectedOrgId || undefined);
    },
    onSuccess: () => {
      setEmails('');
      setSelectedOrgId('');
      setSuccessMsg('Einladungen wurden gespeichert.');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full">
      {/* LEFT — existing user list */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Benutzer suchen</p>
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
            >
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedUsers.has(user.id)}
                onChange={() => toggleUser(user.id)}
                className="accent-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — invite form */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-2xl">
          {/* Email textarea */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Email Adressen eingeben</p>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Eine oder mehrere E-Mail-Adressen, getrennt durch Komma oder Zeilenumbruch"
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
          </div>

          {/* Organization selector */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BuildingIcon />
                <span className="text-sm font-medium text-gray-700">Organisation wechseln</span>
              </div>
              <button className="text-gray-400 text-lg leading-none hover:text-gray-600">+</button>
            </div>
            <p className="text-xs text-gray-400 italic mb-3">
              Hier klicken zum Suchen, Auswählen oder Ziehen der Organisationen aus dem Baum!
            </p>
            {orgs.length > 0 && (
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">Organisation auswählen (optional)</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
          </div>

          {successMsg && (
            <div className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg mb-4 flex items-center justify-between">
              {successMsg}
              <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={() => setSuccessMsg('')} />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending || !emails.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {inviteMutation.isPending ? 'Wird gespeichert...' : 'Einladen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
