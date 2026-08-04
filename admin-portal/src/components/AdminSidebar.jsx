import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  FileText,
  BarChart3,
  Download,
  Settings,
  Flame,
} from 'lucide-react';

export const AdminSidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Participants', path: '/participants', icon: Users },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Paragraphs', path: '/paragraphs', icon: FileText },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/reports', icon: Download },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-card border-r border-slate-200/50 dark:border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Management
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 rounded-xl glass-card border border-purple-500/20 bg-purple-500/5 space-y-2">
        <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
          <Flame className="w-4 h-4" />
          <span>Type Rush v1.0</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Phase 1 Monorepo Active
        </p>
      </div>
    </aside>
  );
};
