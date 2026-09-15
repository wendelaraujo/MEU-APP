import React from 'react';
import { CreditCard, Transaction, CategorySummary, TabType, FixedExpense } from '../../types';
import { formatCurrency, formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface HomeScreenProps {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: CategorySummary[];
  fixedExpenses?: FixedExpense[];
  onNavigateTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
  onOpenNewPurchase: () => void;
  onShowToast: (msg: string) => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  cards,
  transactions,
  categories,
  fixedExpenses = [],
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewPurchase,
  onShowToast,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  const primaryCard = cards[0] || {
    name: 'Nubank Ultravioleta',
    digits: '4829',
    usedLimit: 1840.5,
    totalLimit: 5000,
    gradientClass: 'bg-gradient-to-br from-[#1b1429] via-[#2d1b4e] to-[#0f172a]',
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0) || 8500;

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0)
  ) || 4250;

  const currentBalance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 5);

  const usedPercent = Math.min(
    100,
    Math.round((primaryCard.usedLimit / (primaryCard.totalLimit || 1)) * 100)
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-5 animate-in fade-in duration-200">
      {/* Saldo Principal Bento Card */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-100 font-medium tracking-wide uppercase">
              Saldo Total em Conta
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-xs">
              Março 2025
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-blue-100 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-300">
                trending_up
              </span>
              <span>
                <strong>+R$ 4.250,00</strong> economizado neste mês
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
            <div>
              <span className="text-blue-200 block text-[11px]">Receitas Recebidas</span>
              <span className="font-bold text-white text-sm sm:text-base">
                +{formatCurrency(totalIncome)}
              </span>
            </div>
            <div>
              <span className="text-blue-200 block text-[11px]">Despesas Pagas</span>
              <span className="font-bold text-rose-200 text-sm sm:text-base">
                -{formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Instalação Nativa Android */}
      {!isInstalled && onOpenInstallModal && (
        <section
          onClick={onOpenInstallModal}
          className="cursor-pointer bg-gradient-to-r from-[#0b1c30] to-[#1e3a8a] rounded-2xl p-3.5 sm:p-4 text-white shadow-md border border-slate-700/60 flex items-center justify-between gap-3 hover:border-emerald-400/50 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 p-1.5">
              <img src="/pwa-192x192.png" alt="W-Finanças" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">android</span>
                  Aplicativo Android Nativo
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">WebAPK</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5 truncate">
                Instale o W-Finanças no seu celular
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                Sem barra de navegador, atalhos rápidos e funciona offline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 shadow-sm">
            <span>Instalar</span>
            <span className="material-symbols-outlined text-[16px]">download</span>
          </div>
        </section>
      )}

      {/* Ações Rápidas */}
      <section className="grid grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
            Lançamento
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenNewPurchase}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1.5">
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
          </div>
          <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
            No Cartão
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('fixas')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center relative"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
            <span className="material-symbols-outlined text-[20px]">event_repeat</span>
          </div>
          <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
            Contas Fixas
          </span>
          {fixedExpenses.filter((e) => !e.isPaid).length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('relatorios')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-1.5">
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </div>
          <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
            Relatórios
          </span>
        </button>
      </section>

      {/* Mini Widget: Destaque de Despesas Fixas */}
      {fixedExpenses.length > 0 && (
        <section
          onClick={() => onNavigateTab('fixas')}
          className="cursor-pointer bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 rounded-2xl p-4 border border-amber-300/70 dark:border-amber-700/60 shadow-xs flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Despesas Fixas do Mês
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                  {fixedExpenses.filter((e) => !e.isPaid).length} pendentes
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Total:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {formatCurrency(fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0))}
                </strong>{' '}
                • {fixedExpenses.filter((e) => e.isPaid).length} de {fixedExpenses.length} pagas
              </p>
            </div>
          </div>

          <div className="flex items-center text-amber-600 dark:text-amber-400 font-bold text-xs gap-1">
            <span>Acessar</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </section>
      )}

      {/* Cartão de Crédito em Destaque */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
              credit_card
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Cartão Principal
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('cartoes')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Ver todos</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {primaryCard.name}
              </span>
              <span className="text-xs text-slate-400">•••• {primaryCard.digits}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fatura Aberta: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(primaryCard.usedLimit)}</strong>
            </div>
          </div>

          <div className="sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{usedPercent}% limite</span>
              <span>Disp: {formatCurrency(primaryCard.totalLimit - primaryCard.usedLimit)}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${usedPercent}%` }}
                className="bg-rose-500 h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Maiores Gastos do Mês */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Distribuição de Despesas
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('relatorios')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Análise completa
          </button>
        </div>

        {/* Segmented Track Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              style={{ width: `${cat.percentage}%`, backgroundColor: cat.colorHex }}
              className="h-full"
              title={`${cat.name}: ${cat.percentage}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {categories.slice(0, 4).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
              <div className="truncate">
                <span className="text-slate-700 dark:text-slate-300 block truncate">{cat.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lançamentos Recentes */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Lançamentos Recentes
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('lancamentos')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Ver extrato completo</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isIncome ? 'payments' : 'shopping_bag'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.date.split('-')[2]} Mar • {tx.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs sm:text-sm font-bold shrink-0 ${
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : ''}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
