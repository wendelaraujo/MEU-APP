import React, { useState, useMemo } from 'react';
import { FixedExpense } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface FixedExpensesScreenProps {
  fixedExpenses: FixedExpense[];
  onOpenNewExpense: () => void;
  onEditExpense: (expense: FixedExpense) => void;
  onDeleteExpense: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onShowToast: (msg: string) => void;
}

type FilterType = 'all' | 'upcoming' | 'pending' | 'paid';

export const FixedExpensesScreen: React.FC<FixedExpensesScreenProps> = ({
  fixedExpenses,
  onOpenNewExpense,
  onEditExpense,
  onDeleteExpense,
  onTogglePaid,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expenseToDelete, setExpenseToDelete] = useState<FixedExpense | null>(null);

  // Considera o dia atual do mês para cálculo de vencimentos
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthName = today.toLocaleDateString('pt-BR', { month: 'long' });

  // Cálculos de totais
  const totalAmount = useMemo(
    () => fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0),
    [fixedExpenses]
  );

  const paidExpenses = useMemo(
    () => fixedExpenses.filter((e) => e.isPaid),
    [fixedExpenses]
  );

  const paidAmount = useMemo(
    () => paidExpenses.reduce((acc, curr) => acc + curr.amount, 0),
    [paidExpenses]
  );

  const pendingExpenses = useMemo(
    () => fixedExpenses.filter((e) => !e.isPaid),
    [fixedExpenses]
  );

  const pendingAmount = totalAmount - paidAmount;

  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Despesas Próximas de Vencer (Não pagas, que vencem hoje ou nos próximos 5 dias, ou atrasadas no mês)
  const upcomingExpenses = useMemo(() => {
    return fixedExpenses
      .filter((e) => {
        if (e.isPaid) return false;
        // Vencidas no mês ou vencendo nos próximos 5 dias
        const diff = e.dueDay - currentDay;
        return diff <= 5; // inclui vencidas no mês (diff < 0) e próximas (0 <= diff <= 5)
      })
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [fixedExpenses, currentDay]);

  // Filtro e busca dos itens exibidos
  const filteredExpenses = useMemo(() => {
    return fixedExpenses
      .filter((e) => {
        // Filtro por tab
        if (filter === 'paid') return e.isPaid;
        if (filter === 'pending') return !e.isPaid;
        if (filter === 'upcoming') {
          if (e.isPaid) return false;
          return e.dueDay - currentDay <= 5;
        }
        return true;
      })
      .filter((e) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Ordena primeiro por pendentes, depois por dia de vencimento
        if (a.isPaid !== b.isPaid) {
          return a.isPaid ? 1 : -1;
        }
        return a.dueDay - b.dueDay;
      });
  }, [fixedExpenses, filter, searchQuery, currentDay]);

  // Helper para obter status e estilo do vencimento
  const getDueStatusInfo = (expense: FixedExpense) => {
    if (expense.isPaid) {
      return {
        label: 'Paga',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: 'check_circle',
        isAlert: false,
      };
    }

    const diff = expense.dueDay - currentDay;

    if (diff < 0) {
      return {
        label: `Venceu dia ${expense.dueDay}`,
        badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse',
        icon: 'warning',
        isAlert: true,
      };
    }

    if (diff === 0) {
      return {
        label: 'Vence Hoje!',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse font-bold',
        icon: 'priority_high',
        isAlert: true,
      };
    }

    if (diff <= 3) {
      return {
        label: `Vence em ${diff} ${diff === 1 ? 'dia' : 'dias'} (Dia ${expense.dueDay})`,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: 'schedule',
        isAlert: true,
      };
    }

    return {
      label: `Vence dia ${expense.dueDay}`,
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      icon: 'calendar_today',
      isAlert: false,
    };
  };

  // Helper para ícone da categoria
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('moradia') || c.includes('casa') || c.includes('aluguel') || c.includes('condomínio')) return 'home';
    if (c.includes('serviço') || c.includes('internet') || c.includes('energia')) return 'wifi';
    if (c.includes('saúde') || c.includes('médico') || c.includes('plano')) return 'favorite';
    if (c.includes('educação') || c.includes('curso') || c.includes('faculdade')) return 'school';
    if (c.includes('transporte') || c.includes('carro') || c.includes('combustível')) return 'directions_car';
    if (c.includes('lazer') || c.includes('streaming') || c.includes('netflix')) return 'movie';
    if (c.includes('alimentação') || c.includes('mercado')) return 'restaurant';
    return 'receipt_long';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[26px]">event_repeat</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Despesas Fixas & Contas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de contas recorrentes e vencimentos de {currentMonthName}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewExpense}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nova Despesa Fixa
        </button>
      </div>

      {/* Bento Grid: Cards de Resumo Mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Total do Mês */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <span>Total Fixas do Mês</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {fixedExpenses.length} {fixedExpenses.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
          </div>
        </div>

        {/* Card 2: Já Pago com Barra de Progresso */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            <span>Já Pago ({paidPercentage}%)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(paidAmount)}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex justify-between">
            <span>{paidExpenses.length} de {fixedExpenses.length} quitadas</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{paidPercentage}%</span>
          </div>
        </div>

        {/* Card 3: Pendente a Pagar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            <span>Pendente a Pagar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(pendingAmount)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {pendingExpenses.length} {pendingExpenses.length === 1 ? 'conta em aberto' : 'contas em aberto'}
          </div>
        </div>
      </div>

      {/* SEÇÃO ESPECIAL: Próximas de Vencer (Destaque visual) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 rounded-3xl p-5 border border-amber-300/60 dark:border-amber-700/50 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
              Atenção: Próximas do Vencimento
            </h2>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            {upcomingExpenses.length} {upcomingExpenses.length === 1 ? 'conta requer atenção' : 'contas requerem atenção'}
          </span>
        </div>

        {upcomingExpenses.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-amber-200/50 dark:border-amber-800/40 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">task_alt</span>
            <span>Tudo tranquilo! Nenhuma despesa pendente vencendo nos próximos dias.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingExpenses.map((expense) => {
              const status = getDueStatusInfo(expense);
              return (
                <div
                  key={`upcoming-${expense.id}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 shadow-xs flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {getCategoryIcon(expense.category)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {expense.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-bold border inline-flex items-center gap-1 ${status.badgeClass}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
                          {status.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onTogglePaid(expense.id);
                      onShowToast(`"${expense.title}" marcada como paga!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Pagar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controles: Busca e Filtros */}
      <div className="space-y-3">
        {/* Barra de Busca */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome da despesa, categoria ou observação..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filtros em Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Todas', count: fixedExpenses.length },
            { id: 'upcoming', label: 'Próximas de Vencer', count: upcomingExpenses.length, badgeColor: 'bg-amber-500 text-white' },
            { id: 'pending', label: 'Pendentes', count: pendingExpenses.length },
            { id: 'paid', label: 'Pagas', count: paidExpenses.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as FilterType)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tab.badgeColor
                    ? tab.badgeColor
                    : filter === tab.id
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista Principal de Despesas Fixas */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[30px]">event_busy</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhuma despesa fixa encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Tente alterar os termos da busca.'
                : 'Você não tem contas nesta categoria. Cadastre uma nova despesa fixa no botão acima.'}
            </p>
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Cadastrar Agora
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const status = getDueStatusInfo(expense);
            return (
              <div
                key={expense.id}
                className={`group p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                  expense.isPaid
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100'
                    : status.isAlert
                    ? 'border-amber-300 dark:border-amber-700/80 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Checkbox e Detalhes */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Botão de Ticar como Paga */}
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePaid(expense.id);
                        onShowToast(
                          expense.isPaid
                            ? `"${expense.title}" desmarcada (pendente).`
                            : `"${expense.title}" marcada como paga!`
                        );
                      }}
                      title={expense.isPaid ? 'Clique para desmarcar' : 'Clique para marcar como paga'}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                        expense.isPaid
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {expense.isPaid ? 'check' : 'radio_button_unchecked'}
                      </span>
                    </button>

                    {/* Ícone da Categoria */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {getCategoryIcon(expense.category)}
                      </span>
                    </div>

                    {/* Informações da Despesa */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate ${
                            expense.isPaid ? 'line-through text-slate-500 dark:text-slate-400' : ''
                          }`}
                        >
                          {expense.title}
                        </h4>
                        <span
                          className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${status.badgeClass}`}
                        >
                          <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          Todo dia {expense.dueDay}
                        </span>
                        <span>•</span>
                        <span>{expense.category}</span>
                        {expense.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="uppercase text-[10px] font-semibold tracking-wider">
                              {expense.paymentMethod}
                            </span>
                          </>
                        )}
                        {expense.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 truncate max-w-[200px]">
                              {expense.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-bold ${
                          expense.isPaid
                            ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-75'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatCurrency(expense.amount)}
                      </div>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        {expense.isPaid ? 'Quitada' : 'A vencer'}
                      </span>
                    </div>

                    {/* Botões de Ação (Editar e Excluir) */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200/80 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onEditExpense(expense)}
                        title="Editar despesa fixa"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpenseToDelete(expense)}
                        title="Excluir despesa fixa"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Excluir Despesa Fixa?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tem certeza que deseja remover <strong>"{expenseToDelete.title}"</strong> ({formatCurrency(expenseToDelete.amount)}) do controle mensal?
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  onShowToast(`Despesa "${expenseToDelete.title}" excluída com sucesso.`);
                  setExpenseToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
