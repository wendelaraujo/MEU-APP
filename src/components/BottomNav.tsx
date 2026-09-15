import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNewModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewModal,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-lg dark:shadow-none transition-colors duration-200">
      <div className="max-w-md md:max-w-lg mx-auto flex items-center justify-between px-3 py-1.5 sm:py-2">
        {/* Tab 1: Início */}
        <button
          onClick={() => onSelectTab('inicio')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'inicio'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{
              fontVariationSettings: currentTab === 'inicio' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            dashboard
          </span>
          <span className="text-[11px] mt-0.5">Início</span>
        </button>

        {/* Tab 2: Lançamentos */}
        <button
          onClick={() => onSelectTab('lancamentos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'lancamentos'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: currentTab === 'lancamentos' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            receipt_long
          </span>
          <span className="text-[10px] mt-0.5">Lançamentos</span>
        </button>

        {/* Tab 3: Despesas Fixas */}
        <button
          onClick={() => onSelectTab('fixas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'fixas'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: currentTab === 'fixas' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            event_repeat
          </span>
          <span className="text-[10px] mt-0.5">Fixas</span>
        </button>

        {/* Central Floating Quick Action Button */}
        <div className="flex-1 flex justify-center">
          <button
            aria-label="Adicionar lançamento ou compra"
            onClick={onOpenNewModal}
            className="w-11 h-11 -mt-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ring-4 ring-white dark:ring-slate-900"
            type="button"
          >
            <span className="material-symbols-outlined text-[26px] font-bold">add</span>
          </button>
        </div>

        {/* Tab 4: Cartões */}
        <button
          onClick={() => onSelectTab('cartoes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'cartoes'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: currentTab === 'cartoes' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            credit_card
          </span>
          <span className="text-[10px] mt-0.5">Cartões</span>
        </button>

        {/* Tab 5: Relatórios */}
        <button
          onClick={() => onSelectTab('relatorios')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'relatorios'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: currentTab === 'relatorios' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            bar_chart
          </span>
          <span className="text-[10px] mt-0.5">Relatórios</span>
        </button>
      </div>
    </nav>
  );
};
