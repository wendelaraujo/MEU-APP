import React from 'react';
import { USER_AVATAR_URL } from '../data/mockData';
import { SupabaseStatus } from '../lib/supabase';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications?: () => void;
  supabaseStatus?: SupabaseStatus;
  onOpenSupabaseModal?: () => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  onOpenNotifications,
  supabaseStatus,
  onOpenSupabaseModal,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand & Leading Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
          <div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight block leading-tight">
              WFinanças
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
              Gestão Inteligente
            </span>
          </div>
        </div>

        {/* Action & Profile Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Native Android / PWA Install Button */}
          {onOpenInstallModal && !isInstalled && (
            <button
              id="header-install-app-btn"
              type="button"
              onClick={onOpenInstallModal}
              title="Instalar aplicativo nativo no Android"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">
                android
              </span>
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">App</span>
            </button>
          )}

          {/* Supabase Status Indicator Pill */}
          {onOpenSupabaseModal && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              title="Status da conexão com o banco Supabase"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-xs ${
                supabaseStatus?.tablesExist
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus?.tablesExist ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="material-symbols-outlined text-[15px]">database</span>
              <span className="hidden sm:inline">
                {supabaseStatus?.tablesExist ? 'Supabase Conectado' : 'Configurar Supabase'}
              </span>
            </button>
          )}

          {/* Quick Notification Button */}
          <button
            aria-label="Notificações"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 relative"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            aria-label="Alternar Tema"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile Avatar with Online Badge */}
          <div className="relative ml-1 cursor-pointer group">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
              <img
                src={USER_AVATAR_URL}
                alt="Foto de perfil do usuário"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
