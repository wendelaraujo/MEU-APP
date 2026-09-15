import React, { useState } from 'react';
import { CreditCard } from '../../types';
import { formatCurrency, formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface PayInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard;
  onConfirmPayment: (cardId: string, paidAmount: number) => void;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  isOpen,
  onClose,
  card,
  onConfirmPayment,
}) => {
  const [paymentOption, setPaymentOption] = useState<'total' | 'min' | 'custom'>('total');
  const [method, setMethod] = useState<'account' | 'pix' | 'boleto'>('account');
  const [customAmountStr, setCustomAmountStr] = useState<string>(
    formatCurrencyWithoutPrefix(card.usedLimit)
  );

  if (!isOpen) return null;

  const minAmount = card.usedLimit * 0.15;
  const customAmount = parseFloat(customAmountStr.replace(/\./g, '').replace(',', '.')) || 0;

  const getAmountToPay = () => {
    if (paymentOption === 'total') return card.usedLimit;
    if (paymentOption === 'min') return minAmount;
    return customAmount;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = getAmountToPay();
    if (amount <= 0) return;

    onConfirmPayment(card.id, amount);
    onClose();
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
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Pagar Fatura - {card.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Valor Total Fechado
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(card.usedLimit)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Vencimento em {String(card.dueDay).padStart(2, '0')}/04
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Opção de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('total')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  paymentOption === 'total'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Total</span>
                <span className="block text-[11px] font-bold mt-0.5">
                  {formatCurrency(card.usedLimit)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('min')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  paymentOption === 'min'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Mínimo</span>
                <span className="block text-[11px] font-bold mt-0.5">
                  {formatCurrency(minAmount)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('custom')}
                className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  paymentOption === 'custom'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Outro Valor</span>
                <span className="block text-[11px] font-bold mt-0.5">Editar</span>
              </button>
            </div>
          </div>

          {paymentOption === 'custom' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Digite o valor que deseja pagar
              </label>
              <input
                type="text"
                value={customAmountStr}
                onChange={(e) => setCustomAmountStr(e.target.value)}
                className="w-full px-3 h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Forma de Quitação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('account')}
                className={`py-2 px-1 rounded-xl text-xs font-medium border text-center ${
                  method === 'account'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Conta Itaú
              </button>
              <button
                type="button"
                onClick={() => setMethod('pix')}
                className={`py-2 px-1 rounded-xl text-xs font-medium border text-center ${
                  method === 'pix'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Pix Imediato
              </button>
              <button
                type="button"
                onClick={() => setMethod('boleto')}
                className={`py-2 px-1 rounded-xl text-xs font-medium border text-center ${
                  method === 'boleto'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Boleto
              </button>
            </div>
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
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all active:scale-98"
            >
              Confirmar Pagamento ({formatCurrency(getAmountToPay())})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
