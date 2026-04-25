import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EllipsisVerticalIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { usersApi } from '../api/users.api';
import type { User } from '../types';
import SearchInput from '../components/ui/SearchInput';
import Toggle from '../components/ui/Toggle';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.getAll(search),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersApi.activate(id) : usersApi.deactivate(id),
    onSuccess: (updatedUser) => {
      setSelectedUser(updatedUser);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      setSelectedUser(null);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="flex h-full">
      {/* LEFT PANEL — user list */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Benutzer suchen</p>
          <SearchInput value={search} onChange={setSearch} />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-gray-400">Laden...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Keine Benutzer gefunden</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUser?.id === user.id}
                  onChange={() => {}}
                  className="ml-auto flex-shrink-0 accent-blue-500"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL — user detail */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Benutzer auswählen</p>
          </div>
        ) : (
          <div className="p-6 max-w-2xl">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-blue-600">
                {selectedUser.firstName && selectedUser.lastName
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`
                  : selectedUser.username}
              </h2>
              <div className="flex items-center gap-2">
                {/* Active toggle */}
                <Toggle
                  enabled={selectedUser.isActive}
                  onChange={(val) =>
                    toggleActiveMutation.mutate({ id: selectedUser.id, active: val })
                  }
                />
                {/* 3-dot menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      {[
                        'Benutzer bearbeiten',
                        'Benutzer löschen',
                        'Passwort zurücksetzen',
                      ].map((action) => (
                        <button
                          key={action}
                          onClick={() => {
                            if (action === 'Benutzer löschen') {
                              deleteMutation.mutate(selectedUser.id);
                            }
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                        >
                          {action}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <p className="px-4 py-1 text-xs text-gray-400 font-medium">Autorisierung</p>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                          Für Organisationen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4 text-gray-400" />
                {selectedUser.username}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                {selectedUser.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                {selectedUser.phoneNumber || '—'}
              </div>
            </div>

            {/* Global permissions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-blue-600 mb-3">Globale Berechtigung</h3>
              {[
                { label: 'Systemadministrator', key: 'isSystemAdmin' },
                { label: 'Globaler Benutzeradministrator', key: 'isGlobalUserAdmin' },
                { label: 'Globaler 3rd-Level Benutzer', key: 'isGlobal3rdLevelUser' },
              ].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2 mb-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUser[key as keyof User] as boolean}
                    onChange={() => {}}
                    className="accent-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Auth status */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-blue-600 mb-2">Benutzer Authentifizierung</h3>
                <p className="text-xs text-gray-500 italic">
                  {selectedUser.isActive
                    ? 'Benutzer kann sich anmelden.'
                    : 'Der Benutzer kann sich momentan nicht anmelden.'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-600 mb-2">Multifaktor Authentifizierung</h3>
                <p className="text-xs text-gray-500 italic">
                  Entweder sehen die globalen Einstellungen keine 2-FA Authentifizierung vor oder der Benutzer hat kein Gerät dafür eingerichtet.
                </p>
              </div>
            </div>

            {/* Organization */}
            <div>
              <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <BuildingIcon />
                  <span className="text-sm font-medium text-gray-700">Organisation wechseln</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">+</button>
              </div>
              {selectedUser.organizations?.map((org) => (
                <div key={org.id} className="flex items-center gap-2 mt-2 px-4">
                  <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    {org.name}
                    <XMarkIcon className="h-3 w-3 cursor-pointer" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline building icon (matches screenshot style)
function BuildingIcon() {
  return (
    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
