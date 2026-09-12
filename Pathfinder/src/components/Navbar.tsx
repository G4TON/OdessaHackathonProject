import React from 'react';
import { BookOpen, Flame, Settings, Upload, LayoutDashboard, Sparkles, RefreshCw } from 'lucide-react';
import { UserStats } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  stats?: UserStats | null;
  onResetDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  stats,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavigate('landing')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Learn<span className="text-brand-600">Loop</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60 px-2 py-0.5 rounded-full">
                Feynman AI
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentPage === 'dashboard'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentPage === 'upload'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Material</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentPage === 'settings'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right side stats & quick actions */}
        <div className="flex items-center space-x-3">
          {/* Streak pill */}
          <div
            className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full text-amber-800 text-xs font-semibold shadow-xs"
            title={`${stats?.current_streak || 1} day active learning streak!`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{stats?.current_streak || 1} day streak</span>
          </div>

          {/* Quick Demo Reset / Load */}
          {onResetDemo && (
            <button
              onClick={onResetDemo}
              className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-medium transition-colors"
              title="Reset to Data Structures Demo curriculum"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Reset Demo</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('upload')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Material</span>
          </button>
        </div>
      </div>
    </header>
  );
};
