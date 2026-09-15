import React, { useState, useEffect } from 'react';
import { FixedExpense, PaymentMethod } from '../../types';
import { formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface NewFixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<FixedExpense, 'id'>) => void;
  onUpdate?: (expense: FixedExpense) => void;
  expenseToEdit?: FixedExpense | null;
}

const FIXED_CATEGORIES = [
  'Moradia / Casa',
  'Serviços',
  'Saúde',
  'Educação',
  'Transporte',
  'Alimentação',
  'Lazer',
  'Assinaturas',
  'Outros',
];

export const NewFixedExpenseModal: React.FC<NewFixedExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  expenseToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('0,00');
  const [dueDay, setDueDay] = useState<number>(10);
  const [category, setCategory] = useState<string>('Moradia / Casa');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmountStr(formatCurrencyWithoutPrefix(expenseToEdit.amount));
      setDueDay(expenseToEdit.dueDay);
      setCategory(expenseToEdit.category);
      setPaymentMethod(expenseToEdit.paymentMethod || 'pix');
      setIsPaid(expenseToEdit.isPaid);
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmountStr('0,00');
      setDueDay(10);
      setCategory('Moradia / Casa');
      setPaymentMethod('pix');
      setIsPaid(false);
      setNotes('');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  // Formatador monetário para digitação em centavos
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = parseInt(rawVal || '0', 10) / 100;
    setAmountStr(formatCurrencyWithoutPrefix(num));
  };

  const getNumericAmount = (): number => {
    const cleanStr = amountStr.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanStr) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getNumericAmount();

    if (!title.trim()) {
      alert('Por favor, informe a descrição da despesa fixa.');
      return;
    }
    if (finalAmount <= 0) {
      alert('Por favor, informe um valor maior que zero.');
      return;
    }

    if (expenseToEdit && onUpdate) {
      onUpdate({
        ...expenseToEdit,
        title: title.trim(),
        amount: finalAmount,
        dueDay: Math.min(31, Math.max(1, dueDay)),
        category,
        paymentMethod,
        isPaid,
        paidAt: isPaid ? (expenseToEdit.paidAt || new Date().toISOString().split('T')[0]) : null,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        title: title.trim(),
        amount: finalAmount,
        dueDay: Math.min(31, Math.max(1, dueDay)),
        category,
        paymentMethod,
        isPaid,
        paidAt: isPaid ? new Date().toISOString().split('T')[0] : null,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">event_repeat</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {expenseToEdit ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conta mensal com vencimento programado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Valor Principal com Destaque */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Valor Mensal da Despesa
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 dark:text-slate-500">
                R$
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Nome / Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Descrição / Nome da Conta
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aluguel, Internet Fibra, Netflix, Energia"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Dia de Vencimento e Categoria em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dia do Vencimento */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Dia de Vencimento
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  Dia
                </span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Repete todo dia {dueDay} de cada mês
              </span>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {FIXED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Forma de Pagamento Habitual */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'pix', label: 'Pix', icon: 'qr_code_2' },
                { id: 'credit', label: 'Crédito', icon: 'credit_card' },
                { id: 'debit', label: 'Débito', icon: 'account_balance' },
                { id: 'money', label: 'Boleto', icon: 'receipt' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === m.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] mb-1">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Inicial do Mês Atual (Ticar como Paga) */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer accent-emerald-600"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                  Já foi paga neste mês?
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {isPaid
                    ? 'Marcada como paga (não constará em pendências)'
                    : 'Pendente de pagamento para este mês'}
                </span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isPaid
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                }`}
              >
                {isPaid ? 'Paga' : 'Pendente'}
              </span>
            </label>
          </div>

          {/* Observações / Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Código do boleto, chave Pix ou link de pagamento"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              {expenseToEdit ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
