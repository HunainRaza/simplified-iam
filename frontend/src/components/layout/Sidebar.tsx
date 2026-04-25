import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HomeIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  UserIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/',              icon: HomeIcon,            label: 'Dashboard' },
  { to: '/invite',        icon: UserPlusIcon,         label: 'Benutzer einladen' },
  { to: '/organizations', icon: BuildingOffice2Icon,  label: 'Organisationen' },
  { to: '/users',         icon: UserIcon,             label: 'Benutzer verwalten' },
  { to: '/settings',      icon: Cog6ToothIcon,        label: 'Einstellungen' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top gradient bar — matches the colorful header in screenshots */}
      <div className="h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-end px-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/20 rounded p-1"
        >
          {collapsed
            ? <ChevronRightIcon className="h-4 w-4" />
            : <ChevronLeftIcon className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}  // exact match for root route
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout at bottom */}
      <div className="p-3 border-t border-gray-200">
        {!collapsed && (
          <p className="text-xs text-gray-500 truncate mb-2">{user?.username}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-xs text-red-500 hover:text-red-700 text-left px-2 py-1 rounded hover:bg-red-50"
        >
          {collapsed ? '←' : 'Abmelden'}
        </button>
      </div>
    </div>
  );
}
