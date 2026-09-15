/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, CreditCard, Transaction, CategorySummary, FixedExpense } from './types';
import {
  INITIAL_CARDS,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_FIXED_EXPENSES,
  MONTHLY_BALANCE_DATA,
  INCOME_SOURCES,
  FUTURE_INVOICES,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CardsScreen } from './components/screens/CardsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { FixedExpensesScreen } from './components/screens/FixedExpensesScreen';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { NewCardPurchaseModal } from './components/modals/NewCardPurchaseModal';
import { AdjustLimitModal } from './components/modals/AdjustLimitModal';
import { NewCardModal } from './components/modals/NewCardModal';
import { PayInvoiceModal } from './components/modals/PayInvoiceModal';
import { SupabaseSyncModal } from './components/modals/SupabaseSyncModal';
import { NewFixedExpenseModal } from './components/modals/NewFixedExpenseModal';
import { InstallAppModal } from './components/modals/InstallAppModal';
import { Toast } from './components/ui/Toast';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { AndroidInstallBanner } from './components/ui/AndroidInstallBanner';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  checkSupabaseStatus,
  fetchCardsFromSupabase,
  fetchTransactionsFromSupabase,
  fetchFixedExpensesFromSupabase,
  upsertCardToSupabase,
  updateCardLimitInSupabase,
  updateCardUsedLimitInSupabase,
  insertTransactionToSupabase,
  updateTransactionInSupabase,
  deleteTransactionFromSupabase,
  deleteCardFromSupabase,
  upsertFixedExpenseToSupabase,
  toggleFixedExpensePaidInSupabase,
  deleteFixedExpenseFromSupabase,
  SupabaseStatus,
} from './lib/supabase';

export default function App() {
  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Tab State: default to 'cartoes' as highlighted in user screen 1, easily toggled
  const [currentTab, setCurrentTab] = useState<TabType>('cartoes');

  // Cards State
  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('wfinancas_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CARDS;
      }
    }
    return INITIAL_CARDS;
  });

  useEffect(() => {
    localStorage.setItem('wfinancas_cards', JSON.stringify(cards));
  }, [cards]);

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wfinancas_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('wfinancas_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Fixed Expenses State
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = localStorage.getItem('wfinancas_fixed_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FIXED_EXPENSES;
      }
    }
    return INITIAL_FIXED_EXPENSES;
  });

  useEffect(() => {
    localStorage.setItem('wfinancas_fixed_expenses', JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  // Supabase State & Sync
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    isConnected: false,
    tablesExist: false,
    loading: true,
    error: null,
  });
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Categories
  const [categories] = useState<CategorySummary[]>(INITIAL_CATEGORIES);

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [isAdjustLimitModalOpen, setIsAdjustLimitModalOpen] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState(false);
  const [cardToPay, setCardToPay] = useState<CreditCard | null>(null);
  const [isNewFixedExpenseModalOpen, setIsNewFixedExpenseModalOpen] = useState(false);
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpense | null>(null);

  // Native Android PWA Installation state
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check Supabase and pull remote data
  const refreshSupabaseStatus = useCallback(async () => {
    const status = await checkSupabaseStatus();
    setSupabaseStatus(status);

    if (status.tablesExist) {
      // 1. Fetch remote cards
      const remoteCards = await fetchCardsFromSupabase();
      if (remoteCards && remoteCards.length > 0) {
        setCards(remoteCards);
      } else if (remoteCards && remoteCards.length === 0) {
        // Se as tabelas existirem mas estiverem vazias, envia os cartões locais
        for (const card of cards) {
          await upsertCardToSupabase(card);
        }
      }

      // 2. Fetch remote transactions
      const remoteTx = await fetchTransactionsFromSupabase();
      if (remoteTx && remoteTx.length > 0) {
        setTransactions(remoteTx);
      } else if (remoteTx && remoteTx.length === 0) {
        // Se as tabelas existirem mas estiverem vazias, envia as transações locais
        for (const tx of transactions) {
          await insertTransactionToSupabase(tx);
        }
      }

      // 3. Fetch remote fixed expenses
      const remoteFixed = await fetchFixedExpensesFromSupabase();
      if (remoteFixed && remoteFixed.length > 0) {
        setFixedExpenses(remoteFixed);
      } else if (remoteFixed && remoteFixed.length === 0) {
        // Se as tabelas existirem mas estiverem vazias, envia as despesas fixas locais
        for (const fe of fixedExpenses) {
          await upsertFixedExpenseToSupabase(fe);
        }
      }
    }
  }, [cards, transactions, fixedExpenses]);

  // Initial check on mount
  useEffect(() => {
    refreshSupabaseStatus();
  }, []);

  // Handlers for Fixed Expenses
  const handleSaveFixedExpense = async (data: Omit<FixedExpense, 'id'>) => {
    const newExpense: FixedExpense = {
      ...data,
      id: `fix-${Date.now()}`,
    };
    setFixedExpenses((prev) => [...prev, newExpense]);

    if (supabaseStatus.tablesExist) {
      await upsertFixedExpenseToSupabase(newExpense);
    }
    showToast(`Despesa "${newExpense.title}" cadastrada com sucesso!`);
  };

  const handleUpdateFixedExpense = async (updated: FixedExpense) => {
    setFixedExpenses((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );

    if (supabaseStatus.tablesExist) {
      await upsertFixedExpenseToSupabase(updated);
    }
    setEditingFixedExpense(null);
    showToast(`Despesa "${updated.title}" atualizada com sucesso!`);
  };

  const handleToggleFixedExpensePaid = async (id: string) => {
    const target = fixedExpenses.find((e) => e.id === id);
    if (!target) return;

    const newPaidStatus = !target.isPaid;
    const paidAt = newPaidStatus ? new Date().toISOString().split('T')[0] : null;

    setFixedExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isPaid: newPaidStatus, paidAt: paidAt || undefined } : e
      )
    );

    if (supabaseStatus.tablesExist) {
      await toggleFixedExpensePaidInSupabase(id, newPaidStatus, paidAt);
    }
  };

  const handleDeleteFixedExpense = async (id: string) => {
    setFixedExpenses((prev) => prev.filter((e) => e.id !== id));

    if (supabaseStatus.tablesExist) {
      await deleteFixedExpenseFromSupabase(id);
    }
  };

  // Handler: Add Transaction
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    let updatedCards = cards;
    // If credit card transaction, update used limit of that card
    if (newTx.paymentMethod === 'credit' && newTx.cardId) {
      const charge = Math.abs(newTx.amount);
      updatedCards = cards.map((c) =>
        c.id === newTx.cardId ? { ...c, usedLimit: c.usedLimit + charge } : c
      );
      setCards(updatedCards);

      if (supabaseStatus.tablesExist) {
        const targetCard = updatedCards.find((c) => c.id === newTx.cardId);
        if (targetCard) {
          updateCardUsedLimitInSupabase(targetCard.id, targetCard.usedLimit);
        }
      }
    }

    if (supabaseStatus.tablesExist) {
      await insertTransactionToSupabase(newTx);
    }

    showToast('Lançamento adicionado com sucesso!');
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // If it was a credit transaction, deduct from usedLimit
    if (target.paymentMethod === 'credit' && target.cardId) {
      const refund = Math.abs(target.amount);
      const updatedCards = cards.map((c) =>
        c.id === target.cardId ? { ...c, usedLimit: Math.max(0, c.usedLimit - refund) } : c
      );
      setCards(updatedCards);

      if (supabaseStatus.tablesExist) {
        const targetCard = updatedCards.find((c) => c.id === target.cardId);
        if (targetCard) {
          updateCardUsedLimitInSupabase(targetCard.id, targetCard.usedLimit);
        }
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (supabaseStatus.tablesExist) {
      await deleteTransactionFromSupabase(id);
    }

    showToast('Lançamento excluído.');
  };

  // Handler: Update Existing Transaction
  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    // Recalculate card limits if credit transactions are involved
    let updatedCards = [...cards];
    if (oldTx.paymentMethod === 'credit' && oldTx.cardId) {
      const refund = Math.abs(oldTx.amount);
      updatedCards = updatedCards.map((c) =>
        c.id === oldTx.cardId ? { ...c, usedLimit: Math.max(0, c.usedLimit - refund) } : c
      );
    }
    if (updatedTx.paymentMethod === 'credit' && updatedTx.cardId) {
      const cost = Math.abs(updatedTx.amount);
      updatedCards = updatedCards.map((c) =>
        c.id === updatedTx.cardId ? { ...c, usedLimit: c.usedLimit + cost } : c
      );
    }
    setCards(updatedCards);

    // Sync card limits to Supabase
    if (supabaseStatus.tablesExist) {
      if (oldTx.cardId) {
        const c1 = updatedCards.find((c) => c.id === oldTx.cardId);
        if (c1) updateCardUsedLimitInSupabase(c1.id, c1.usedLimit);
      }
      if (updatedTx.cardId && updatedTx.cardId !== oldTx.cardId) {
        const c2 = updatedCards.find((c) => c.id === updatedTx.cardId);
        if (c2) updateCardUsedLimitInSupabase(c2.id, c2.usedLimit);
      }
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    if (supabaseStatus.tablesExist) {
      await updateTransactionInSupabase(updatedTx);
    }

    setEditingTransaction(null);
    showToast('Lançamento atualizado com sucesso!');
  };

  // Handler: Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (cards.length <= 1) {
      showToast('Você precisa manter ao menos 1 cartão cadastrado.');
      return;
    }

    const cardToDelete = cards.find((c) => c.id === cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActiveCardIndex(0);

    if (supabaseStatus.tablesExist) {
      await deleteCardFromSupabase(cardId);
    }

    showToast(`Cartão ${cardToDelete?.name || ''} excluído com sucesso.`);
  };

  // Handler: Adjust Limit
  const handleSaveLimit = async (cardId: string, newLimit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, totalLimit: newLimit } : c))
    );

    if (supabaseStatus.tablesExist) {
      await updateCardLimitInSupabase(cardId, newLimit);
    }

    showToast('Limite atualizado com sucesso!');
  };

  // Handler: Add New Card
  const handleAddCard = async (newCard: CreditCard) => {
    setCards((prev) => [...prev, newCard]);
    setActiveCardIndex(cards.length);

    if (supabaseStatus.tablesExist) {
      await upsertCardToSupabase(newCard);
    }

    showToast(`Cartão ${newCard.name} adicionado com sucesso!`);
  };

  // Handler: Pay Invoice
  const handleOpenPayInvoice = (card: CreditCard) => {
    setCardToPay(card);
    setIsPayInvoiceModalOpen(true);
  };

  const handleConfirmPayment = async (cardId: string, paidAmount: number) => {
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const newUsedLimit = Math.max(0, targetCard.usedLimit - paidAmount);

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, usedLimit: newUsedLimit } : c))
    );

    // Also register an expense transaction for invoice payment
    const paymentTx: Transaction = {
      id: `tx-pay-${Date.now()}`,
      title: `Pagamento Fatura ${targetCard.name}`,
      amount: -paidAmount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Serviços',
      paymentMethod: 'debit',
      notes: 'Pagamento de fatura de cartão',
    };

    setTransactions((prev) => [paymentTx, ...prev]);

    if (supabaseStatus.tablesExist) {
      await updateCardUsedLimitInSupabase(cardId, newUsedLimit);
      await insertTransactionToSupabase(paymentTx);
    }

    showToast(`Fatura de ${targetCard.name} paga com sucesso!`);
  };

  const activeCard = cards[activeCardIndex] || cards[0];

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-slate-950 text-[#0b1c30] dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Android Native Install Banner for Mobile Users */}
      <AndroidInstallBanner
        isInstalled={isInstalled}
        onOpenModal={() => setIsInstallModalOpen(true)}
        onInstall={install}
        isInstallable={isInstallable}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Shared Header with Theme Toggle, User Avatar & Supabase Status */}
      <Header
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenNotifications={() =>
          showToast('Você tem 2 faturas com vencimento nos próximos 15 dias.')
        }
        supabaseStatus={supabaseStatus}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
      />

      {/* Main Canvas Based on Active Tab */}
      <main className="flex-1 w-full">
        {currentTab === 'inicio' && (
          <HomeScreen
            cards={cards}
            transactions={transactions}
            categories={categories}
            fixedExpenses={fixedExpenses}
            onNavigateTab={setCurrentTab}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsNewTxModalOpen(true);
            }}
            onOpenNewPurchase={() => setIsNewPurchaseModalOpen(true)}
            onShowToast={showToast}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            isInstalled={isInstalled}
          />
        )}

        {currentTab === 'cartoes' && (
          <CardsScreen
            cards={cards}
            activeCardIndex={activeCardIndex}
            onSelectCardIndex={setActiveCardIndex}
            onOpenNewPurchase={() => setIsNewPurchaseModalOpen(true)}
            onOpenNewCard={() => setIsNewCardModalOpen(true)}
            onOpenAdjustLimit={() => setIsAdjustLimitModalOpen(true)}
            onPayInvoice={handleOpenPayInvoice}
            onDeleteCard={handleDeleteCard}
            transactions={transactions}
            futureInvoices={FUTURE_INVOICES}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'fixas' && (
          <FixedExpensesScreen
            fixedExpenses={fixedExpenses}
            onOpenNewExpense={() => {
              setEditingFixedExpense(null);
              setIsNewFixedExpenseModalOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingFixedExpense(expense);
              setIsNewFixedExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteFixedExpense}
            onTogglePaid={handleToggleFixedExpensePaid}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'relatorios' && (
          <ReportsScreen
            categories={categories}
            monthlyData={MONTHLY_BALANCE_DATA}
            incomeSources={INCOME_SOURCES}
            transactions={transactions}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsNewTxModalOpen(true);
            }}
            onShowToast={showToast}
            onNavigateToTransactions={() => setCurrentTab('lancamentos')}
          />
        )}

        {currentTab === 'lancamentos' && (
          <TransactionsScreen
            transactions={transactions}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsNewTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsNewTxModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Shared Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewModal={() => {
          if (currentTab === 'cartoes') {
            setIsNewPurchaseModalOpen(true);
          } else if (currentTab === 'fixas') {
            setEditingFixedExpense(null);
            setIsNewFixedExpenseModalOpen(true);
          } else {
            setEditingTransaction(null);
            setIsNewTxModalOpen(true);
          }
        }}
      />

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => {
          setIsNewTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onUpdate={handleUpdateTransaction}
        transactionToEdit={editingTransaction}
        cards={cards}
      />

      <NewCardPurchaseModal
        isOpen={isNewPurchaseModalOpen}
        onClose={() => setIsNewPurchaseModalOpen(false)}
        cards={cards}
        activeCard={activeCard}
        onConfirmPurchase={handleSaveTransaction}
      />

      {activeCard && (
        <AdjustLimitModal
          isOpen={isAdjustLimitModalOpen}
          onClose={() => setIsAdjustLimitModalOpen(false)}
          card={activeCard}
          onSaveLimit={handleSaveLimit}
        />
      )}

      <NewCardModal
        isOpen={isNewCardModalOpen}
        onClose={() => setIsNewCardModalOpen(false)}
        onAddCard={handleAddCard}
      />

      {cardToPay && (
        <PayInvoiceModal
          isOpen={isPayInvoiceModalOpen}
          onClose={() => {
            setIsPayInvoiceModalOpen(false);
            setCardToPay(null);
          }}
          card={cardToPay}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Modal de Despesa Fixa */}
      <NewFixedExpenseModal
        isOpen={isNewFixedExpenseModalOpen}
        onClose={() => {
          setIsNewFixedExpenseModalOpen(false);
          setEditingFixedExpense(null);
        }}
        onSave={handleSaveFixedExpense}
        onUpdate={handleUpdateFixedExpense}
        expenseToEdit={editingFixedExpense}
      />

      {/* Modal de Instalação Nativa Android */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={install}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isAndroid={isAndroid}
        isIOS={isIOS}
        onShowToast={showToast}
      />

      {/* Supabase Status & Setup Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        status={supabaseStatus}
        onRefreshStatus={refreshSupabaseStatus}
        cards={cards}
        transactions={transactions}
        fixedExpenses={fixedExpenses}
        onShowToast={showToast}
      />
    </div>
  );
}
