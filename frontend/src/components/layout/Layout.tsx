import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// Layout wraps all protected pages
// <Outlet /> is where the current page's content renders
// Django equivalent: a base template with {% block content %}
export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
