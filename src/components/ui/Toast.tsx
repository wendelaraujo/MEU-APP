import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top duration-200">
      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border border-slate-700/60 dark:border-slate-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600 text-[20px]">
            check_circle
          </span>
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};
