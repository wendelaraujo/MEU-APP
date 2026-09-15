import React, { useState, useEffect } from 'react';
import { CreditCard, PaymentMethod, Transaction, TransactionType } from '../../types';
import { formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onUpdate?: (tx: Transaction) => void;
  cards: CreditCard[];
  initialType?: TransactionType;
  transactionToEdit?: Transaction | null;
}

const CATEGORIES = [
  'Alimentação',
  'Mercado',
  'Transporte',
  'Moradia / Casa',
  'Saúde',
  'Lazer',
  'Salário',
  'Serviços',
  'Outros',
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  cards,
  initialType = 'expense',
  transactionToEdit,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('0,00');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Alimentação');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [installments, setInstallments] = useState<number>(1);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountStr(formatCurrencyWithoutPrefix(Math.abs(transactionToEdit.amount)));
      setTitle(transactionToEdit.title);
      setDate(transactionToEdit.date);
      setCategory(transactionToEdit.category);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setSelectedCardId(transactionToEdit.cardId || cards[0]?.id || '');
      setInstallments(transactionToEdit.installmentTotal || 1);
    } else {
      setType(initialType);
      setAmountStr('0,00');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Alimentação');
      setPaymentMethod('credit');
      setSelectedCardId(cards[0]?.id || '');
      setInstallments(1);
    }
  }, [transactionToEdit, isOpen, initialType, cards]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) || 0;
  const installmentValue = installments > 0 ? numericAmount / installments : numericAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
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

    const isCreditInstallment = type === 'expense' && paymentMethod === 'credit' && installments > 1;
    const monthlyAmount = isCreditInstallment ? installmentValue : numericAmount;
    const finalAmount = type === 'expense' ? -monthlyAmount : numericAmount;

    if (transactionToEdit && onUpdate) {
      onUpdate({
        ...transactionToEdit,
        title: title.trim() || (type === 'income' ? 'Receita' : 'Despesa'),
        amount: finalAmount,
        type,
        date,
        category,
        paymentMethod,
        cardId: paymentMethod === 'credit' ? selectedCardId : undefined,
        installmentCurrent: isCreditInstallment ? (transactionToEdit.installmentCurrent || 1) : undefined,
        installmentTotal: isCreditInstallment ? installments : undefined,
        totalPurchaseAmount: isCreditInstallment ? numericAmount : undefined,
      });
    } else {
      onSave({
        title: title.trim() || (type === 'income' ? 'Nova Receita' : 'Nova Despesa'),
        amount: finalAmount,
        type,
        date,
        category,
        paymentMethod,
        cardId: paymentMethod === 'credit' ? selectedCardId : undefined,
        installmentCurrent: isCreditInstallment ? 1 : undefined,
        installmentTotal: isCreditInstallment ? installments : undefined,
        totalPurchaseAmount: isCreditInstallment ? numericAmount : undefined,
      });
    }

    // Reset & close
    setAmountStr('0,00');
    setTitle('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Pull Handle on Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {type === 'expense' ? 'receipt_long' : 'payments'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            type="button"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Type Toggle: Despesa vs Receita */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            <span>Receita</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Large Monetary Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Valor do lançamento
            </label>
            <div className="flex items-baseline gap-2 border-b-2 border-blue-600 pb-1 pt-0.5">
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">R$</span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                className={`w-full bg-transparent text-3xl font-bold outline-none p-0 tracking-tight ${
                  type === 'expense'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
                placeholder="0,00"
                autoFocus
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Descrição
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                edit_note
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'income'
                    ? 'Ex: Salário, Freelance, Rendimentos...'
                    : 'Ex: Almoço de domingo no shopping, Supermercado...'
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Data de Competência */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Data de competência
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                calendar_today
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Categoria
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'pix', label: 'Pix' },
                  { id: 'money', label: 'Dinheiro' },
                  { id: 'debit', label: 'Débito' },
                  { id: 'credit', label: 'Crédito' },
                ] as const
              ).map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2 px-1 rounded-xl text-xs text-center font-medium border transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cartão e Parcelamento (Only if Crédito) */}
          {paymentMethod === 'credit' && (
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                  Selecione o Cartão
                </label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Final {c.digits})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Parcelamento:
                </span>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value={1}>1x à vista ({formatCurrencyWithoutPrefix(numericAmount)})</option>
                  <option value={2}>2x de R$ {formatCurrencyWithoutPrefix(numericAmount / 2)}</option>
                  <option value={3}>3x de R$ {formatCurrencyWithoutPrefix(numericAmount / 3)}</option>
                  <option value={4}>4x de R$ {formatCurrencyWithoutPrefix(numericAmount / 4)}</option>
                  <option value={6}>6x de R$ {formatCurrencyWithoutPrefix(numericAmount / 6)}</option>
                  <option value={10}>10x de R$ {formatCurrencyWithoutPrefix(numericAmount / 10)}</option>
                  <option value={12}>12x de R$ {formatCurrencyWithoutPrefix(numericAmount / 12)}</option>
                </select>
              </div>

              {numericAmount > 0 && installments > 1 && (
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>
                    A 1ª parcela de <strong>R$ {formatCurrencyWithoutPrefix(installmentValue)}</strong>{' '}
                    entrará na fatura atual.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all active:scale-98"
            >
              {transactionToEdit ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
