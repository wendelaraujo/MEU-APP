import React, { useState } from 'react';
import { CreditCard, Transaction, FutureInvoice } from '../../types';
import { formatCurrency, formatCurrencyWithoutPrefix } from '../../utils/formatters';

interface CardsScreenProps {
  cards: CreditCard[];
  activeCardIndex: number;
  onSelectCardIndex: (index: number) => void;
  onOpenNewPurchase: () => void;
  onOpenNewCard: () => void;
  onOpenAdjustLimit: () => void;
  onPayInvoice: (card: CreditCard) => void;
  onDeleteCard?: (cardId: string) => void;
  transactions: Transaction[];
  futureInvoices: FutureInvoice[];
  onShowToast: (msg: string) => void;
}

export const CardsScreen: React.FC<CardsScreenProps> = ({
  cards,
  activeCardIndex,
  onSelectCardIndex,
  onOpenNewPurchase,
  onOpenNewCard,
  onOpenAdjustLimit,
  onPayInvoice,
  onDeleteCard,
  transactions,
  futureInvoices,
  onShowToast,
}) => {
  const [showAllInvoiceItems, setShowAllInvoiceItems] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const activeCard = cards[activeCardIndex] || cards[0];

  // Transactions on active card
  const cardTransactions = transactions.filter(
    (t) => t.paymentMethod === 'credit' && (!t.cardId || t.cardId === activeCard.id)
  );

  const displayedTransactions = showAllInvoiceItems
    ? cardTransactions
    : cardTransactions.slice(0, 5);

  const usedPercent = Math.min(
    100,
    Math.round((activeCard.usedLimit / (activeCard.totalLimit || 1)) * 100)
  );
  const availableLimit = Math.max(0, activeCard.totalLimit - activeCard.usedLimit);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-5 animate-in fade-in duration-200">
      {/* Screen Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Meus Cartões
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {cards.length} {cards.length === 1 ? 'cartão ativo cadastrado' : 'cartões ativos cadastrados'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewCard}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* CARDS CAROUSEL */}
      <section aria-label="Cartões Virtuais" className="space-y-2">
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-1 pb-2">
          {cards.map((card, idx) => {
            const isActive = idx === activeCardIndex;
            return (
              <article
                key={card.id}
                onClick={() => onSelectCardIndex(idx)}
                className={`snap-center shrink-0 w-[88vw] max-w-[340px] rounded-2xl p-5 relative overflow-hidden text-white shadow-lg border transition-all cursor-pointer flex flex-col justify-between h-[215px] select-none ${
                  card.gradientClass
                } ${
                  isActive
                    ? 'ring-2 ring-blue-500/50 shadow-xl scale-[1.01] border-white/20'
                    : 'opacity-85 hover:opacity-100 border-white/10'
                }`}
              >
                {/* Glow circle */}
                <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top: Name & Contactless */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white tracking-wide">
                        {card.name}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: card.colorAccent }}
                      />
                    </div>
                    <p className="text-xs text-slate-300">{card.subtitle}</p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-slate-300">
                    contactless
                  </span>
                </div>

                {/* Chip & Digits */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-300 to-amber-100 border border-amber-400/50 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60" />
                  </div>
                  <span className="text-base font-semibold tracking-widest text-slate-200">
                    •••• {card.digits}
                  </span>
                </div>

                {/* Bottom: Invoice & Brand Logo */}
                <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Fatura Aberta</span>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {formatCurrency(card.usedLimit)}
                    </span>
                  </div>
                  {card.brand === 'mastercard' ? (
                    <div className="flex items-center -space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
                      <div className="w-7 h-7 rounded-full bg-amber-500 opacity-90" />
                    </div>
                  ) : (
                    <span className="text-lg italic font-extrabold tracking-wider text-slate-100">
                      VISA
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {cards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Selecionar cartão ${idx + 1}`}
              onClick={() => onSelectCardIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeCardIndex
                  ? 'w-6 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ACTIVE CARD METRICS & BRAZILIAN LIMIT PROGRESSION BAR */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Limite do Cartão ({activeCard.name})
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
            {usedPercent}% utilizado
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-rose-600 dark:bg-rose-500 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
            <div
              className="bg-slate-200 dark:bg-slate-700 h-full transition-all"
              style={{ width: `${100 - usedPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Utilizado:{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                {formatCurrency(activeCard.usedLimit)}
              </strong>
            </span>
            <span>
              Disponível:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(availableLimit)}
              </strong>
            </span>
          </div>
        </div>

        {/* Details Summary Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Limite Total
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(activeCard.totalLimit)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Fechamento
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Dia {String(activeCard.closingDay).padStart(2, '0')}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Vencimento
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Dia {String(activeCard.dueDay).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="space-y-2">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {/* Nova Compra */}
          <button
            type="button"
            onClick={onOpenNewPurchase}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_shopping_cart
              </span>
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
              Nova Compra
            </span>
          </button>

          {/* Pagar Fatura */}
          <button
            type="button"
            onClick={() => onPayInvoice(activeCard)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
              Pagar Fatura
            </span>
          </button>

          {/* Ajustar Limite */}
          <button
            type="button"
            onClick={onOpenAdjustLimit}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all active:scale-95 shadow-xs text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-tight">
              Ajustar Limite
            </span>
          </button>

          {/* Excluir Cartão */}
          <button
            type="button"
            onClick={() => {
              if (cards.length <= 1) {
                onShowToast('Você precisa manter pelo menos 1 cartão cadastrado.');
                return;
              }
              setIsDeleteModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all active:scale-95 shadow-xs text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 group-hover:text-rose-600 dark:group-hover:text-rose-400 flex items-center justify-center mb-1.5 transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 font-semibold leading-tight transition-colors">
              Excluir
            </span>
          </button>
        </div>
      </section>

      {/* FATURA ATUAL */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Fatura Atual (Março 2025)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Fechamento em {String(activeCard.closingDay).padStart(2, '0')}/03 • Vence em{' '}
              {String(activeCard.dueDay).padStart(2, '0')}/04
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            {activeCard.status}
          </span>
        </div>

        {/* Resumo Card Fatura */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total Parcial da Fatura
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(activeCard.usedLimit)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowToast(`Fatura de ${formatCurrency(activeCard.usedLimit)} adiantada com sucesso!`)}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              Adiantar
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {displayedTransactions.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">
                Nenhum lançamento no cartão ativo no momento.
              </p>
            ) : (
              displayedTransactions.map((tx) => {
                let icon = 'shopping_cart';
                let iconBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';

                if (tx.category.toLowerCase().includes('lazer')) {
                  icon = 'subscriptions';
                  iconBg = 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300';
                } else if (tx.category.toLowerCase().includes('transporte')) {
                  icon = 'local_gas_station';
                  iconBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
                } else if (tx.category.toLowerCase().includes('moradia') || tx.category.toLowerCase().includes('casa')) {
                  icon = 'smartphone';
                  iconBg = 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
                } else if (tx.category.toLowerCase().includes('alimentação')) {
                  icon = 'restaurant';
                  iconBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
                }

                return (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">
                          {tx.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tx.date.split('-')[2]} Mar
                          {tx.installmentTotal
                            ? ` • Parcela ${tx.installmentCurrent || 1}/${tx.installmentTotal}`
                            : tx.isRecurring
                            ? ' • Assinatura Mensal'
                            : ' • À vista'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {formatCurrency(Math.abs(tx.amount))}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {tx.totalPurchaseAmount
                          ? `Total ${formatCurrency(tx.totalPurchaseAmount)}`
                          : tx.isRecurring
                          ? 'Recorrente'
                          : tx.notes || tx.category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cardTransactions.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllInvoiceItems(!showAllInvoiceItems)}
              className="w-full py-2.5 text-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors"
            >
              {showAllInvoiceItems
                ? 'Recolher despesas da fatura'
                : `Ver todas as ${cardTransactions.length} despesas da fatura`}
            </button>
          )}
        </div>
      </section>

      {/* PRÓXIMAS PARCELAS & PREVISÃO */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Próximas Parcelas & Previsão
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Faturas futuras</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {futureInvoices.map((fut, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors"
            >
              <div className={`w-1.5 h-full ${fut.borderOpacity} absolute left-0 top-0`} />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {fut.month}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block my-0.5">
                R$ {formatCurrencyWithoutPrefix(fut.amount)}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {fut.installmentCount} parceladas
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Confirmation Modal: Delete Card */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Excluir Cartão?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Deseja realmente excluir o cartão{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {activeCard.name}
              </strong>{' '}
              (•••• {activeCard.digits})? Ele será removido localmente e também do banco de dados Supabase.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onDeleteCard?.(activeCard.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
              >
                Sim, Excluir Cartão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
