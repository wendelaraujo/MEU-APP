import React, { useState } from 'react';
import { CategorySummary, MonthlyBalanceData, IncomeSource, Transaction } from '../../types';
import { formatCurrency, formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface ReportsScreenProps {
  categories: CategorySummary[];
  monthlyData: MonthlyBalanceData[];
  incomeSources: IncomeSource[];
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToTransactions: () => void;
}

type PeriodHorizon = 'mes_atual' | '3_meses' | '6_meses' | 'ano_2025';

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  categories,
  monthlyData,
  incomeSources,
  transactions,
  onOpenNewTransaction,
  onShowToast,
  onNavigateToTransactions,
}) => {
  const [period, setPeriod] = useState<PeriodHorizon>('mes_atual');
  const [activeBarHover, setActiveBarHover] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('Março 2025');

  const months = ['Janeiro 2025', 'Fevereiro 2025', 'Março 2025', 'Abril 2025', 'Maio 2025'];

  const handlePrevMonth = () => {
    const idx = months.indexOf(selectedMonth);
    if (idx > 0) {
      setSelectedMonth(months[idx - 1]);
      onShowToast(`Exibindo relatório de ${months[idx - 1]}`);
    }
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(selectedMonth);
    if (idx < months.length - 1) {
      setSelectedMonth(months[idx + 1]);
      onShowToast(`Exibindo relatório de ${months[idx + 1]}`);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0) || 8500;

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0)
  ) || 4250;

  const netSavings = totalIncome - totalExpense;
  const savingsPercent = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const dailyAverage = totalExpense / 31;

  const handleExportPDF = () => {
    window.print();
    onShowToast('Relatório preparado para impressão / exportação em PDF.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-5 animate-in fade-in duration-200">
      {/* Page Title & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Relatórios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              Mensal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Análise financeira e desempenho
          </p>
        </div>

        {/* Action Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs sm:text-sm font-semibold shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar PDF</span>
          </button>
          <button
            type="button"
            onClick={() => onShowToast('Filtro de relatórios atualizado.')}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-xs active:scale-95"
            aria-label="Mais opções"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Seletor de Período / Filtro Temporal */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month Navigator */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
              aria-label="Mês anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                calendar_month
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {selectedMonth}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
              aria-label="Próximo mês"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Quick Horizon Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
            {[
              { id: 'mes_atual', label: 'Mês Atual' },
              { id: '3_meses', label: '3 Meses' },
              { id: '6_meses', label: '6 Meses' },
              { id: 'ano_2025', label: 'Ano 2025' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id as PeriodHorizon)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  period === item.id
                    ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Resumo Consolidado do Período (Metric Bento Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total de Receitas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total de Receitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>+100% recebido no prazo</span>
            </div>
          </div>
        </div>

        {/* Total de Despesas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total de Despesas
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[14px] text-rose-500">info</span>
              <span>50% do limite orçamentário</span>
            </div>
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Saldo Líquido
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[18px]">savings</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{formatCurrency(netSavings)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{savingsPercent}% guardado / economizado</span>
            </div>
          </div>
        </div>

        {/* Média Diária */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Média Diária
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              R$ {formatCurrencyWithoutPrefix(dailyAverage)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ dia</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[14px]">timelapse</span>
              <span>Base 31 dias de Março</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Split: Balanço Mensal & Fontes de Receita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Balanço Mensal */}
        <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Balanço Mensal
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparativo de Receitas versus Despesas (Últimos 6 meses)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-blue-600 dark:bg-blue-500" />
                  <span>Receitas</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-rose-500" />
                  <span>Despesas</span>
                </div>
              </div>
            </div>

            {/* Vertical Bar Chart Visualizer */}
            <div className="pt-6 pb-2">
              <div className="relative h-56 flex flex-col justify-between">
                {/* Y-Axis Ticks & Guides */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-slate-400 dark:text-slate-500 text-[10px]">
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-end pr-1">
                    R$ 10k
                  </div>
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-end pr-1">
                    R$ 7.5k
                  </div>
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-end pr-1">
                    R$ 5k
                  </div>
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-end pr-1">
                    R$ 2.5k
                  </div>
                  <div className="border-b border-slate-200 dark:border-slate-800 w-full flex justify-end pr-1">
                    R$ 0
                  </div>
                </div>

                {/* Bars Container */}
                <div className="relative h-full flex items-end justify-around px-2 sm:px-4 z-10">
                  {monthlyData.map((item) => {
                    const incomeHeight = `${(item.income / 10000) * 100}%`;
                    const expenseHeight = `${(item.expense / 10000) * 100}%`;
                    const isHovered = activeBarHover === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveBarHover(item.id)}
                        onMouseLeave={() => setActiveBarHover(null)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div className="flex items-end gap-1 sm:gap-2 h-44">
                          {/* Income Bar */}
                          <div
                            style={{ height: incomeHeight }}
                            className={`w-3.5 sm:w-5 rounded-t-xs transition-all relative ${
                              item.isCurrent
                                ? 'bg-blue-600 dark:bg-blue-500 ring-2 ring-blue-400/30'
                                : 'bg-blue-600/80 group-hover:bg-blue-600'
                            }`}
                          >
                            <div
                              className={`absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded-xs transition-opacity pointer-events-none whitespace-nowrap shadow-xs z-20 ${
                                isHovered || item.isCurrent ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              R$ {(item.income / 1000).toFixed(1)}k
                            </div>
                          </div>

                          {/* Expense Bar */}
                          <div
                            style={{ height: expenseHeight }}
                            className={`w-3.5 sm:w-5 rounded-t-xs transition-all relative ${
                              item.isCurrent
                                ? 'bg-rose-500 ring-2 ring-rose-500/30'
                                : 'bg-rose-500/80 group-hover:bg-rose-500'
                            }`}
                          >
                            <div
                              className={`absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded-xs transition-opacity pointer-events-none whitespace-nowrap shadow-xs z-20 ${
                                isHovered || item.isCurrent ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              R$ {(item.expense / 1000).toFixed(2)}k
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            item.isCurrent
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600'
                          }`}
                        >
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Superávit Footer Metric */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Taxa média de poupança (Semestre):</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              46,8% superavitário
            </span>
          </div>
        </section>

        {/* Fontes de Receita */}
        <section className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Fontes de Receita
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Origem dos ingressos em Março
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>

            {/* Total Highlight Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-4">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Total Ingressado
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conta Corrente Principal (Banco Itaú)
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3">
              {incomeSources.map((src) => (
                <div
                  key={src.id}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    src.isEstimate
                      ? 'opacity-90 border border-dashed border-slate-300 dark:border-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        src.isEstimate
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{src.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {src.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {src.origin}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-bold ${
                        src.isEstimate
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {src.isEstimate ? `Prev. ${formatCurrency(src.amount)}` : formatCurrency(src.amount)}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {src.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="w-full py-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold hover:underline flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Cadastrar outra fonte</span>
            </button>
          </div>
        </section>
      </div>

      {/* 5. Despesas por Categoria (Gráfico Segmentado e Distribuição Percentual Detalhada) */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Despesas por Categoria
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {categories.length} Categorias
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total consumido no período:{' '}
              <strong className="text-slate-800 dark:text-slate-100">
                {formatCurrency(totalExpense)}
              </strong>
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2 self-start sm:self-auto">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
              pie_chart
            </span>
            <span>
              Maior impacto: <strong>Alimentação (35%)</strong>
            </span>
          </div>
        </div>

        {/* Segmented Multi-Color Progress Track Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{ width: `${cat.percentage}%`, backgroundColor: cat.colorHex }}
              className="h-full transition-all hover:opacity-85"
              title={`${cat.name}: ${cat.percentage}% (${formatCurrency(cat.amount)})`}
            />
          ))}
        </div>

        {/* Detailed Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${cat.bgLight} ${cat.bgDark} ${cat.textLight} ${cat.textDark}`}
                >
                  <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.colorHex }}
                      className="h-full rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{cat.subtext}</span>
                    <span className="font-semibold" style={{ color: cat.colorHex }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Lançamentos Mais Relevantes */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Lançamentos Mais Relevantes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transações de maior impacto financeiro em Março
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToTransactions}
            className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span>Ver todos</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {transactions
            .filter((t) => t.type === 'expense')
            .slice(0, 4)
            .map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {tx.category.toLowerCase().includes('moradia')
                        ? 'home_work'
                        : tx.category.toLowerCase().includes('transporte')
                        ? 'local_gas_station'
                        : tx.category.toLowerCase().includes('lazer')
                        ? 'live_tv'
                        : 'shopping_cart'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.date.split('-')[2]} de Março • {tx.account || 'Cartão Nu / Débito'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                    - {formatCurrency(Math.abs(tx.amount))}
                  </span>
                  <span className="block text-[11px] text-slate-400">{tx.category}</span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
