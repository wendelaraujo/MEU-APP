import React, { useState } from 'react';
import { CreditCard } from '../../types';
import { formatCurrency, formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface AdjustLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard;
  onSaveLimit: (cardId: string, newLimit: number) => void;
}

export const AdjustLimitModal: React.FC<AdjustLimitModalProps> = ({
  isOpen,
  onClose,
  card,
  onSaveLimit,
}) => {
  const [limit, setLimit] = useState<number>(card.totalLimit);

  if (!isOpen) return null;

  const minLimit = Math.max(card.usedLimit, 500);
  const maxLimit = 50000;

  const handleSave = () => {
    onSaveLimit(card.id, limit);
    onClose();
  };

  const addAmount = (val: number) => {
    setLimit((prev) => Math.min(maxLimit, prev + val));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Ajustar Limite - {card.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Info */}
        <div className="text-center py-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Novo Limite Total Disponível
          </span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(limit)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Limite mínimo permitido: {formatCurrency(minLimit)} (utilizado atualmente)
          </span>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={100}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{formatCurrency(minLimit)}</span>
            <span>{formatCurrency(maxLimit)}</span>
          </div>
        </div>

        {/* Quick increments */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => addAmount(500)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-750 transition-colors"
          >
            + R$ 500
          </button>
          <button
            type="button"
            onClick={() => addAmount(1000)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-750 transition-colors"
          >
            + R$ 1.000
          </button>
          <button
            type="button"
            onClick={() => addAmount(2500)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-750 transition-colors"
          >
            + R$ 2.500
          </button>
        </div>

        {/* Available calculation */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex justify-between items-center">
          <span>Novo Saldo Disponível para compras:</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
            R$ {formatCurrencyWithoutPrefix(limit - card.usedLimit)}
          </strong>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all active:scale-98"
          >
            Salvar Limite
          </button>
        </div>
      </div>
    </div>
  );
};
