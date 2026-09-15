import React, { useState } from 'react';
import { CreditCard } from '../../types';
import { formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CreditCard) => void;
}

export const NewCardModal: React.FC<NewCardModalProps> = ({
  isOpen,
  onClose,
  onAddCard,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('Crédito & Débito');
  const [digits, setDigits] = useState('');
  const [brand, setBrand] = useState<'mastercard' | 'visa'>('mastercard');
  const [limitStr, setLimitStr] = useState('3.500,00');
  const [closingDay, setClosingDay] = useState(15);
  const [dueDay, setDueDay] = useState(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitStr.replace(/\./g, '').replace(',', '.')) || 1000;
    const finalDigits = digits.replace(/\D/g, '').slice(0, 4) || String(Math.floor(1000 + Math.random() * 9000));

    const newCard: CreditCard = {
      id: `card-${Date.now()}`,
      name: name.trim() || 'Meu Cartão',
      subtitle: subtitle.trim() || 'Crédito & Débito',
      digits: finalDigits,
      brand,
      totalLimit: limit,
      usedLimit: 0,
      closingDay,
      dueDay,
      gradientClass:
        brand === 'mastercard'
          ? 'bg-gradient-to-br from-[#24133b] via-[#351c56] to-[#121b2d]'
          : 'bg-gradient-to-br from-[#0c1e3d] via-[#162a52] to-[#0a1426]',
      status: 'Aberta',
      isPrincipal: false,
      colorAccent: brand === 'mastercard' ? '#ec4899' : '#3b82f6',
    };

    onAddCard(newCard);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_card</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Cadastrar Novo Cartão
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Nome do Cartão / Banco
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: C6 Carbon, Itaú Personnalité, Inter Black..."
              className="w-full px-3.5 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Final do Cartão (4 dígitos)
            </label>
            <input
              type="text"
              maxLength={4}
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 5123"
              className="w-full px-3.5 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Bandeira
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as 'mastercard' | 'visa')}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 outline-none"
              >
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Limite Total (R$)
              </label>
              <input
                type="text"
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Dia Fechamento
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Dia Vencimento
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Subtítulo / Uso
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Milhas • Sala VIP, Compras Internacionais..."
              className="w-full px-3.5 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:border-blue-600 outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all active:scale-98"
            >
              Adicionar Cartão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
