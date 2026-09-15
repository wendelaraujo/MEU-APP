import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center justify-between gap-3 bg-amber-500/95 text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xs border border-amber-400/50 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-900 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-950"></span>
        </span>
        <span>Modo Offline — Seus dados salvos no aparelho estão disponíveis.</span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-600/30 rounded-md">
        Offline
      </span>
    </div>
  );
};
