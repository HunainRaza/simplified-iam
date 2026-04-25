import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { organizationsApi } from '../api/organizations.api';
import { usersApi } from '../api/users.api';
import type { Organization } from '../types';
import SearchInput from '../components/ui/SearchInput';
import Modal from '../components/ui/Modal';

export default function OrganizationsPage() {
  const [userSearch, setUserSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgParentId, setNewOrgParentId] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users', userSearch],
    queryFn: () => usersApi.getAll(userSearch),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations', orgSearch],
    queryFn: () => organizationsApi.getAll(orgSearch),
  });

  const createMutation = useMutation({
    mutationFn: () => organizationsApi.create({
      name: newOrgName,
      parentId: newOrgParentId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setModalOpen(false);
      setNewOrgName('');
      setNewOrgParentId('');
      setSuccessBanner('Die Organisation wurde erstellt.');
      setTimeout(() => setSuccessBanner(''), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  // Recursive tree renderer
  const renderTree = (items: Organization[], parentId: string | null = null, depth = 0) => {
    const children = items.filter((o) =>
      parentId === null ? !o.parentId : o.parentId === parentId
    );
    return children.map((org) => (
      <div key={org.id} style={{ marginLeft: depth * 16 }}>
        <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded group">
          <div className="flex items-center gap-2">
            {org.children?.length > 0 && (
              <ChevronDownIcon className="h-3 w-3 text-gray-400" />
            )}
            <BuildingIcon />
            <span className="text-sm text-gray-700">{org.name}</span>
          </div>
          <button
            onClick={() => deleteMutation.mutate(org.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-400 px-3 pb-1 ml-5">
          {org.users?.length ? `${org.users.length} Benutzer` : 'Keine Benutzer'}
        </div>
        {renderTree(items, org.id, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="flex h-full">
      {/* LEFT — user list */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Benutzer suchen</p>
          <SearchInput value={userSearch} onChange={setUserSearch} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
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
              <input type="checkbox" className="accent-blue-500" onChange={() => {}} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — org tree */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {successBanner && (
          <div className="bg-green-500 text-white text-sm px-4 py-2 flex items-center justify-between">
            {successBanner}
            <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={() => setSuccessBanner('')} />
          </div>
        )}

        <div className="p-4 flex items-center gap-3 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <SearchInput
              value={orgSearch}
              onChange={setOrgSearch}
              placeholder="Organisation suchen"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Erstellen
          </button>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Löschen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {orgs.length === 0 ? (
            <p className="text-blue-500 text-center mt-8 text-sm">
              Keine Organisationen gefunden.
            </p>
          ) : (
            renderTree(orgs)
          )}
        </div>
      </div>

      {/* Create org modal — matches screenshot 5 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Organisation erstellen"
      >
        <p className="text-sm text-gray-600 mb-4">
          Bitte wählen Sie eine übergeordnete Organisation aus oder lassen Sie dieses Feld leer,
          um eine neue Stammorganisation zu erstellen. Geben Sie dann den Namen der neuen
          Organisation ein.
        </p>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Übergeordnete Organisation</label>
          <select
            value={newOrgParentId}
            onChange={(e) => setNewOrgParentId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Keine (Stammorganisation)</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organisationsname"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-800"
          >
            Abbrechen
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!newOrgName.trim() || createMutation.isPending}
            className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Ja
          </button>
        </div>
      </Modal>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
