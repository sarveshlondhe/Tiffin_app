import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/calendar',  icon: '📅', label: 'Calendar' },
  { to: '/history',   icon: '📋', label: 'History' },
  { to: '/bill',      icon: '💰', label: 'Bill' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard',   icon: '📊', label: 'Dashboard' },
  { to: '/admin/add-tiffin',  icon: '➕', label: 'Add' },
  { to: '/admin/tiffin-list', icon: '🍱', label: 'Tiffins' },
  { to: '/admin/users-bills', icon: '👥', label: 'Users' },
  { to: '/admin/profile',     icon: '⚙️', label: 'Settings' },
];

export default function Layout({ children, title, subtitle }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : userLinks;

  const doLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-100 flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center text-2xl shadow-sm">🍱</div>
            <div>
              <h1 className="font-display font-bold text-lg text-stone-900 leading-tight">TiffinBox</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'}`}>
                {isAdmin ? '🔑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {links.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="text-xl">{icon}</span> {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700 font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{user?.name}</p>
              <p className="text-xs text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={doLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium flex items-center gap-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-stone-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center text-lg">🍱</div>
          <span className="font-display font-bold text-stone-900">TiffinBox</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'}`}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={doLogout} className="text-stone-400 hover:text-red-500 transition-colors text-lg">🚪</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="hidden md:block sticky top-0 z-10 bg-stone-50/90 backdrop-blur border-b border-stone-100 px-8 py-4">
          <h2 className="font-display font-bold text-2xl text-stone-900">{title}</h2>
          {subtitle && <p className="text-stone-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="md:hidden px-4 pt-4 pb-2">
          <h2 className="font-display font-bold text-xl text-stone-900">{title}</h2>
          {subtitle && <p className="text-stone-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <div className="px-4 md:px-8 py-4 md:py-6 animate-fade-in">{children}</div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-stone-100 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1">
          {links.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all flex-1 ${
                  isActive ? 'text-saffron-600 bg-saffron-50' : 'text-stone-400'
                }`
              }>
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-xs font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}