import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onShowToast: (msg: string) => void;
}

type FilterType = 'all' | 'income' | 'expense' | 'category' | 'paymentMethod';

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onOpenNewTransaction,
  onDeleteTransaction,
  onEditTransaction,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showCategoryPills, setShowCategoryPills] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('Março 2025');

  const months = ['Janeiro 2025', 'Fevereiro 2025', 'Março 2025', 'Abril 2025', 'Maio 2025'];

  const handlePrevMonth = () => {
    const idx = months.indexOf(selectedMonth);
    if (idx > 0) {
      setSelectedMonth(months[idx - 1]);
      onShowToast(`Exibindo lançamentos de ${months[idx - 1]}`);
    }
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(selectedMonth);
    if (idx < months.length - 1) {
      setSelectedMonth(months[idx + 1]);
      onShowToast(`Exibindo lançamentos de ${months[idx + 1]}`);
    }
  };

  const categoriesList = Array.from(new Set(transactions.map((t) => t.category)));

  // Financial summary
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0)
  );

  const netBalance = totalIncome - totalExpense;

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchCategory = tx.category.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchTitle && !matchCategory && !matchAmount) return false;
    }

    // Type filter
    if (filterType === 'income' && tx.type !== 'income') return false;
    if (filterType === 'expense' && tx.type !== 'expense') return false;

    if (selectedCategoryFilter && tx.category !== selectedCategoryFilter) return false;

    return true;
  });

  // Group by date label
  const groups: { [key: string]: { label: string; sublabel: string; total: number; items: Transaction[] } } = {};

  filtered.forEach((tx) => {
    let dateKey = tx.date;
    let label = tx.date;
    let sublabel = '';

    if (tx.date === '2025-03-24') {
      label = 'Hoje';
      sublabel = '24 de Março';
    } else if (tx.date === '2025-03-23') {
      label = 'Ontem';
      sublabel = '23 de Março';
    } else if (tx.date === '2025-03-18') {
      label = '18 de Março';
      sublabel = 'Terça-feira';
    } else if (tx.date === '2025-03-05') {
      label = '05 de Março';
      sublabel = 'Quarta-feira';
    } else {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        label = `${parts[2]} de Março`;
        sublabel = '2025';
      }
    }

    if (!groups[dateKey]) {
      groups[dateKey] = { label, sublabel, total: 0, items: [] };
    }
    groups[dateKey].items.push(tx);
    groups[dateKey].total += tx.amount;
  });

  // Sort groups descending by date
  const sortedDateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-4 animate-in fade-in duration-200">
      {/* Title & Add Button */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Lançamentos
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie e acompanhe todas as suas receitas e despesas
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Novo Lançamento</span>
          </button>
        </div>

        {/* Month Switcher & Summary Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Month Switcher Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs md:col-span-1 transition-colors">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
              aria-label="Mês anterior"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                calendar_month
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {selectedMonth}
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                arrow_drop_down
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
              aria-label="Próximo mês"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          {/* Compact Financial Summary Bar Bento */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs md:col-span-3 items-center transition-colors">
            {/* Entradas */}
            <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Entradas
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatCurrency(totalIncome)}
              </span>
            </div>

            {/* Saídas */}
            <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 px-1 sm:px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Saídas
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                -{formatCurrency(totalExpense)}
              </span>
            </div>

            {/* Saldo Atual */}
            <div className="flex flex-col pl-2 sm:pl-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Saldo
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatCurrency(netBalance)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Input & Quick Filter Chips */}
      <section className="flex flex-col md:flex-row md:items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição ou valor..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setSelectedCategoryFilter(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              filterType === 'all' && !selectedCategoryFilter
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Todos</span>
            <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-slate-900/20 text-[10px] flex items-center justify-center font-bold">
              {transactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterType('income');
              setSelectedCategoryFilter(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Receitas (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterType('expense');
              setSelectedCategoryFilter(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Despesas (-)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCategoryPills((prev) => !prev);
            }}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold shrink-0 flex items-center gap-1 transition-all ${
              selectedCategoryFilter
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : showCategoryPills
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">category</span>
            <span>{selectedCategoryFilter || 'Categorias'}</span>
            {selectedCategoryFilter && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategoryFilter(null);
                }}
                className="material-symbols-outlined text-[14px] hover:text-white"
              >
                close
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Expandable Category Pills Row */}
      {showCategoryPills && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 bg-slate-100/60 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-slate-400 px-1 shrink-0">Filtrar:</span>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategoryFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategoryFilter(cat === selectedCategoryFilter ? null : cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Transaction Groups by Date */}
      <section className="space-y-4 pt-1">
        {sortedDateKeys.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          sortedDateKeys.map((dateKey) => {
            const group = groups[dateKey];
            const isGroupPositive = group.total > 0;

            return (
              <div key={dateKey} className="space-y-2">
                {/* Group Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {group.label}
                    </span>
                    <span className="text-xs text-slate-400">{group.sublabel}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isGroupPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isGroupPositive ? '+' : ''}
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Items in this date */}
                <div className="space-y-2">
                  {group.items.map((tx) => {
                    const isIncome = tx.type === 'income';

                    let icon = 'shopping_basket';
                    let iconBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';

                    if (isIncome) {
                      icon = 'payments';
                      iconBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400';
                    } else if (tx.category.toLowerCase().includes('saúde')) {
                      icon = 'medication';
                      iconBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';
                    } else if (tx.category.toLowerCase().includes('transporte')) {
                      icon = 'local_gas_station';
                      iconBg = 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
                    } else if (tx.category.toLowerCase().includes('alimentação')) {
                      icon = 'restaurant';
                      iconBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400';
                    } else if (tx.category.toLowerCase().includes('lazer')) {
                      icon = 'subscriptions';
                      iconBg = 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400';
                    }

                    return (
                      <div
                        key={tx.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                          >
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                              {icon}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">
                              {tx.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                {tx.category}
                              </span>
                              <span className="bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-blue-700 dark:text-blue-300 capitalize">
                                {tx.paymentMethod === 'credit' && tx.installmentTotal
                                  ? `Crédito ${tx.installmentCurrent || 1}/${tx.installmentTotal}`
                                  : tx.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <span
                            className={`text-xs sm:text-sm font-bold tabular-nums ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : ''}
                            {formatCurrency(tx.amount)}
                          </span>

                          <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEditTransaction(tx)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              aria-label="Editar"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              aria-label="Excluir"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
