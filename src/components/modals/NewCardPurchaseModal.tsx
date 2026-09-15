import React, { useState } from 'react';
import { CreditCard, Transaction } from '../../types';
import { formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface NewCardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  activeCard: CreditCard;
  onConfirmPurchase: (tx: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Supermercado', 'Outros'];

export const NewCardPurchaseModal: React.FC<NewCardPurchaseModalProps> = ({
  isOpen,
  onClose,
  cards,
  activeCard,
  onConfirmPurchase,
}) => {
  const [amountStr, setAmountStr] = useState<string>('342,80');
  const [description, setDescription] = useState<string>('Pão de Açúcar - Compras Mensais');
  const [selectedCardId, setSelectedCardId] = useState<string>(activeCard.id);
  const [installments, setInstallments] = useState<number>(3);
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<string>('Alimentação');

  if (!isOpen) return null;

  const currentCard = cards.find((c) => c.id === selectedCardId) || activeCard;
  const numericAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) || 0;
  const singleInstallment = installments > 0 ? numericAmount / installments : numericAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('0,00');
      return;
    }
    const val = Number(raw) / 100;
    setAmountStr(formatCurrencyWithoutPrefix(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    onConfirmPurchase({
      title: description.trim() || 'Nova Compra no Cartão',
      amount: -singleInstallment, // amount that goes into current month invoice
      type: 'expense',
      date: purchaseDate,
      category,
      paymentMethod: 'credit',
      cardId: currentCard.id,
      installmentCurrent: 1,
      installmentTotal: installments,
      totalPurchaseAmount: numericAmount,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl p-5 sm:p-6 shadow-2xl border-t border-slate-200/80 dark:border-slate-800 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              Comprar no Cartão
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Valor com Prefixo R$ */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Valor Total da Compra
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xl font-bold text-slate-400 dark:text-slate-500">
                R$
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                className="w-full pl-12 pr-4 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Eletrônico, Passagem..."
              className="w-full px-3.5 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
            />
          </div>

          {/* Cartão de Crédito Selecionado */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Selecione o Cartão
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full px-3.5 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Final {c.digits}) - Limite Disponível:{' '}
                  R$ {formatCurrencyWithoutPrefix(c.totalLimit - c.usedLimit)}
                </option>
              ))}
            </select>
          </div>

          {/* Parcelas & Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Parcelas
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              >
                <option value={1}>1x (À vista na fatura)</option>
                <option value={2}>2x de R$ {formatCurrencyWithoutPrefix(numericAmount / 2)}</option>
                <option value={3}>3x de R$ {formatCurrencyWithoutPrefix(numericAmount / 3)}</option>
                <option value={4}>4x de R$ {formatCurrencyWithoutPrefix(numericAmount / 4)}</option>
                <option value={6}>6x de R$ {formatCurrencyWithoutPrefix(numericAmount / 6)}</option>
                <option value={10}>10x de R$ {formatCurrencyWithoutPrefix(numericAmount / 10)}</option>
                <option value={12}>12x de R$ {formatCurrencyWithoutPrefix(numericAmount / 12)}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Data da Compra
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Categoria
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Banner de impacto na Fatura */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-slate-800/90 border border-blue-100 dark:border-slate-700/60 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              A 1ª parcela de{' '}
              <strong>R$ {formatCurrencyWithoutPrefix(singleInstallment)}</strong> entrará na
              fatura atual de <strong>Março</strong> (vence dia{' '}
              {String(currentCard.dueDay).padStart(2, '0')}/04).
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="w-2/3 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md active:scale-98"
            >
              Confirmar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
