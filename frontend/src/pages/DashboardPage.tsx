import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserPlusIcon,
  BuildingOffice2Icon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { usersApi } from '../api/users.api';
import SearchInput from '../components/ui/SearchInput';

const actionCards = [
  { label: 'Benutzer einladen', icon: UserPlusIcon,        to: '/invite' },
  { label: 'Organisation ändern', icon: BuildingOffice2Icon, to: '/organizations' },
  { label: 'Benutzer verwalten', icon: UserIcon,           to: '/users' },
  { label: 'Globale Einstellungen', icon: Cog6ToothIcon,   to: '/settings' },
];

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.getAll(search),
    enabled: search.length > 0,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-16 px-6">
      {/* Search bar — matches screenshot 2 */}
      <div className="w-full max-w-2xl mb-12">
        <p className="text-sm text-gray-600 mb-2">Benutzer suchen</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Benutzer suchen..."
            />
          </div>
          <button
            onClick={() => {}} // search triggers reactively via useQuery
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Benutzer suchen
          </button>
        </div>

        {/* Live search results dropdown */}
        {search && users && users.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate('/users')}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-sm"
              >
                <p className="font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action cards — matches the 4-card row in screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
        {actionCards.map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <p className="text-sm font-medium text-gray-700 text-center">{label}</p>
            <Icon className="h-10 w-10 text-blue-500 group-hover:text-blue-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
