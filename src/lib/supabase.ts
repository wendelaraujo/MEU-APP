import { createClient } from '@supabase/supabase-js';
import { CreditCard, Transaction, PaymentMethod, FixedExpense } from '../types';

// Normaliza a URL removendo sufixo /rest/v1 se fornecido
const rawUrl = (import.meta.env?.VITE_SUPABASE_URL || 'https://ivdufjlndgqgfdqpsiml.supabase.co') as string;
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mkl6a7-MeXBWCj6ZwrByrQ_tUioQHP2') as string;

// Cliente Supabase instanciado
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface CardRow {
  id: string;
  name: string;
  subtitle?: string | null;
  digits: string;
  brand: string;
  total_limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  gradient_class?: string | null;
  status?: string | null;
  is_principal?: boolean | null;
  color_accent?: string | null;
}

export interface TransactionRow {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  payment_method: string;
  card_id?: string | null;
  installment_current?: number | null;
  installment_total?: number | null;
  total_purchase_amount?: number | null;
  notes?: string | null;
  account?: string | null;
}

export const cardToRow = (card: CreditCard): CardRow => ({
  id: card.id,
  name: card.name,
  subtitle: card.subtitle || null,
  digits: card.digits,
  brand: card.brand,
  total_limit: card.totalLimit,
  used_limit: card.usedLimit,
  closing_day: card.closingDay,
  due_day: card.dueDay,
  gradient_class: card.gradientClass || null,
  status: card.status || 'Ativo',
  is_principal: card.isPrincipal ?? false,
  color_accent: card.colorAccent || null,
});

export const rowToCard = (row: CardRow): CreditCard => ({
  id: row.id,
  name: row.name,
  subtitle: row.subtitle || '',
  digits: row.digits,
  brand: row.brand === 'visa' ? 'visa' : 'mastercard',
  totalLimit: Number(row.total_limit),
  usedLimit: Number(row.used_limit),
  closingDay: Number(row.closing_day),
  dueDay: Number(row.due_day),
  gradientClass: row.gradient_class || 'from-slate-900 to-slate-800',
  status: row.status || 'Ativo',
  isPrincipal: Boolean(row.is_principal),
  colorAccent: row.color_accent || '#3b82f6',
});

export const transactionToRow = (tx: Transaction): TransactionRow => ({
  id: tx.id,
  title: tx.title,
  amount: tx.amount,
  type: tx.type,
  date: tx.date,
  category: tx.category,
  payment_method: tx.paymentMethod,
  card_id: tx.cardId || null,
  installment_current: tx.installmentCurrent || null,
  installment_total: tx.installmentTotal || null,
  total_purchase_amount: tx.totalPurchaseAmount || null,
  notes: tx.notes || null,
  account: tx.account || null,
});

export const rowToTransaction = (row: TransactionRow): Transaction => {
  let method: PaymentMethod = 'credit';
  if (row.payment_method === 'pix') method = 'pix';
  else if (row.payment_method === 'money') method = 'money';
  else if (row.payment_method === 'debit') method = 'debit';

  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    date: row.date,
    category: row.category,
    paymentMethod: method,
    cardId: row.card_id || undefined,
    installmentCurrent: row.installment_current || undefined,
    installmentTotal: row.installment_total || undefined,
    totalPurchaseAmount: row.total_purchase_amount ? Number(row.total_purchase_amount) : undefined,
    notes: row.notes || undefined,
    account: row.account || undefined,
  };
};

export interface FixedExpenseRow {
  id: string;
  user_id?: string | null;
  title: string;
  amount: number;
  category: string;
  due_day: number;
  is_paid: boolean;
  paid_at?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  created_at?: string;
}

export const fixedExpenseToRow = (fe: FixedExpense): FixedExpenseRow => ({
  id: fe.id,
  title: fe.title,
  amount: fe.amount,
  category: fe.category,
  due_day: fe.dueDay,
  is_paid: fe.isPaid,
  paid_at: fe.paidAt || null,
  notes: fe.notes || null,
  payment_method: fe.paymentMethod || 'pix',
});

export const rowToFixedExpense = (row: FixedExpenseRow): FixedExpense => {
  let method: PaymentMethod = 'pix';
  if (row.payment_method === 'credit') method = 'credit';
  else if (row.payment_method === 'debit') method = 'debit';
  else if (row.payment_method === 'money') method = 'money';

  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    dueDay: Number(row.due_day),
    isPaid: Boolean(row.is_paid),
    paidAt: row.paid_at || undefined,
    notes: row.notes || undefined,
    paymentMethod: method,
    createdAt: row.created_at,
  };
};

export interface SupabaseStatus {
  isConnected: boolean;
  tablesExist: boolean;
  loading: boolean;
  error?: string | null;
}

// Verifica status da conexão e se as tabelas existem no schema public
export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  try {
    const { error } = await supabase.from('cards').select('id').limit(1);

    if (error) {
      // Código PGRST205 significa que a tabela ainda não existe no schema do Supabase
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          isConnected: true,
          tablesExist: false,
          loading: false,
          error: 'Tabelas public.cards e public.transactions ainda não criadas.',
        };
      }
      return {
        isConnected: false,
        tablesExist: false,
        loading: false,
        error: error.message,
      };
    }

    return {
      isConnected: true,
      tablesExist: true,
      loading: false,
      error: null,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      tablesExist: false,
      loading: false,
      error: err?.message || 'Erro ao conectar ao Supabase',
    };
  }
}

// Busca todos os cartões do Supabase
export async function fetchCardsFromSupabase(): Promise<CreditCard[] | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('due_day', { ascending: true });

  if (error) {
    console.warn('[Supabase] Erro ao buscar cartões:', error.message);
    return null;
  }
  return (data as CardRow[]).map(rowToCard);
}

// Salva ou atualiza um cartão
export async function upsertCardToSupabase(card: CreditCard): Promise<boolean> {
  const row = cardToRow(card);
  const { error } = await supabase.from('cards').upsert(row);
  if (error) {
    console.warn('[Supabase] Erro ao salvar cartão:', error.message);
    return false;
  }
  return true;
}

// Atualiza o limite total de um cartão
export async function updateCardLimitInSupabase(cardId: string, totalLimit: number): Promise<boolean> {
  const { error } = await supabase
    .from('cards')
    .update({ total_limit: totalLimit })
    .eq('id', cardId);

  if (error) {
    console.warn('[Supabase] Erro ao atualizar limite:', error.message);
    return false;
  }
  return true;
}

// Atualiza o limite utilizado (fatura) de um cartão
export async function updateCardUsedLimitInSupabase(cardId: string, usedLimit: number): Promise<boolean> {
  const { error } = await supabase
    .from('cards')
    .update({ used_limit: usedLimit })
    .eq('id', cardId);

  if (error) {
    console.warn('[Supabase] Erro ao atualizar fatura:', error.message);
    return false;
  }
  return true;
}

// Busca transações do Supabase
export async function fetchTransactionsFromSupabase(): Promise<Transaction[] | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.warn('[Supabase] Erro ao buscar transações:', error.message);
    return null;
  }
  return (data as TransactionRow[]).map(rowToTransaction);
}

// Salva transação no Supabase
export async function insertTransactionToSupabase(tx: Transaction): Promise<boolean> {
  const row = transactionToRow(tx);
  const { error } = await supabase.from('transactions').insert(row);
  if (error) {
    console.warn('[Supabase] Erro ao inserir transação:', error.message);
    return false;
  }
  return true;
}

// Exclui transação do Supabase
export async function deleteTransactionFromSupabase(id: string): Promise<boolean> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Erro ao excluir transação:', error.message);
    return false;
  }
  return true;
}

// Atualiza uma transação existente no Supabase
export async function updateTransactionInSupabase(tx: Transaction): Promise<boolean> {
  const row = transactionToRow(tx);
  const { error } = await supabase
    .from('transactions')
    .update(row)
    .eq('id', tx.id);

  if (error) {
    console.warn('[Supabase] Erro ao atualizar transação:', error.message);
    return false;
  }
  return true;
}

// Exclui cartão do Supabase
export async function deleteCardFromSupabase(cardId: string): Promise<boolean> {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) {
    console.warn('[Supabase] Erro ao excluir cartão:', error.message);
    return false;
  }
  return true;
}

// Busca despesas fixas do Supabase
export async function fetchFixedExpensesFromSupabase(): Promise<FixedExpense[] | null> {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .order('due_day', { ascending: true });

  if (error) {
    console.warn('[Supabase] Erro ao buscar despesas fixas:', error.message);
    return null;
  }
  return (data as FixedExpenseRow[]).map(rowToFixedExpense);
}

// Insere ou atualiza uma despesa fixa no Supabase
export async function upsertFixedExpenseToSupabase(fe: FixedExpense): Promise<boolean> {
  const row = fixedExpenseToRow(fe);
  const { error } = await supabase.from('fixed_expenses').upsert(row);
  if (error) {
    console.warn('[Supabase] Erro ao salvar despesa fixa:', error.message);
    return false;
  }
  return true;
}

// Alterna o status de paga de uma despesa fixa no Supabase
export async function toggleFixedExpensePaidInSupabase(
  id: string,
  isPaid: boolean,
  paidAt?: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('fixed_expenses')
    .update({ is_paid: isPaid, paid_at: paidAt || null })
    .eq('id', id);

  if (error) {
    console.warn('[Supabase] Erro ao atualizar status de pagamento:', error.message);
    return false;
  }
  return true;
}

// Exclui uma despesa fixa do Supabase
export async function deleteFixedExpenseFromSupabase(id: string): Promise<boolean> {
  const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
  if (error) {
    console.warn('[Supabase] Erro ao excluir despesa fixa:', error.message);
    return false;
  }
  return true;
}

// Sincroniza / exporta todos os dados locais iniciais para o Supabase
export async function seedInitialDataToSupabase(
  cards: CreditCard[],
  transactions: Transaction[],
  fixedExpenses?: FixedExpense[]
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Inserir cartões
    const cardRows = cards.map(cardToRow);
    const { error: cardsErr } = await supabase.from('cards').upsert(cardRows);
    if (cardsErr) {
      throw new Error(`Erro ao enviar cartões: ${cardsErr.message}`);
    }

    // 2. Inserir transações
    const txRows = transactions.map(transactionToRow);
    const { error: txErr } = await supabase.from('transactions').upsert(txRows);
    if (txErr) {
      throw new Error(`Erro ao enviar transações: ${txErr.message}`);
    }

    // 3. Inserir despesas fixas (se houver)
    if (fixedExpenses && fixedExpenses.length > 0) {
      const fixedRows = fixedExpenses.map(fixedExpenseToRow);
      const { error: fixedErr } = await supabase.from('fixed_expenses').upsert(fixedRows);
      if (fixedErr) {
        throw new Error(`Erro ao enviar despesas fixas: ${fixedErr.message}`);
      }
    }

    return { success: true, message: 'Dados sincronizados com o Supabase com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao sincronizar' };
  }
}

// Script SQL pronto para criar as tabelas e políticas RLS no Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- 1. TABELA DE CARTÕES DE CRÉDITO
CREATE TABLE IF NOT EXISTS public.cards (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    subtitle TEXT,
    digits TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'mastercard',
    total_limit NUMERIC NOT NULL DEFAULT 0 CHECK (total_limit >= 0),
    used_limit NUMERIC NOT NULL DEFAULT 0 CHECK (used_limit >= 0),
    closing_day INTEGER NOT NULL DEFAULT 25,
    due_day INTEGER NOT NULL DEFAULT 5,
    gradient_class TEXT,
    status TEXT DEFAULT 'Ativo',
    is_principal BOOLEAN DEFAULT false,
    color_accent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE TRANSAÇÕES E LANÇAMENTOS
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount != 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    card_id TEXT REFERENCES public.cards(id) ON DELETE SET NULL,
    installment_current INTEGER,
    installment_total INTEGER,
    total_purchase_amount NUMERIC,
    notes TEXT,
    account TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE DESPESAS FIXAS
CREATE TABLE IF NOT EXISTS public.fixed_expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL DEFAULT 'Geral',
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TEXT,
    notes TEXT,
    payment_method TEXT DEFAULT 'pix',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO ISOLADAS POR USUÁRIO (COM SUPORTE A DADOS LEGADOS)
CREATE POLICY "cards_select_policy" ON public.cards
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "cards_insert_policy" ON public.cards
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "cards_update_policy" ON public.cards
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL))
    WITH CHECK (total_limit >= 0 AND used_limit >= 0);

CREATE POLICY "cards_delete_policy" ON public.cards
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_update_policy" ON public.transactions
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_delete_policy" ON public.transactions
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_select_policy" ON public.fixed_expenses
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_insert_policy" ON public.fixed_expenses
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_update_policy" ON public.fixed_expenses
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_delete_policy" ON public.fixed_expenses
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));
`;

// Script de Correção e Blindagem (Hardening) de Segurança para executar em bancos já existentes
export const SUPABASE_HARDENING_SQL = `-- ============================================================
-- SCRIPT DE HARDENING E CORREÇÃO DE VULNERABILIDADES RLS
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. CRIAR TABELA DE DESPESAS FIXAS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.fixed_expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL DEFAULT 'Geral',
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TEXT,
    notes TEXT,
    payment_method TEXT DEFAULT 'pix',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ADICIONAR COLUNA user_id PARA ISOLAMENTO MULTI-USUÁRIO
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

ALTER TABLE public.fixed_expenses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON public.fixed_expenses(user_id);

-- 3. ADICIONAR CONSTRAINTS DE VALIDAÇÃO (INTEGRIDADE DOS DADOS)
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS check_cards_limits;
ALTER TABLE public.cards ADD CONSTRAINT check_cards_limits CHECK (total_limit >= 0 AND used_limit >= 0);

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS check_tx_amount;
ALTER TABLE public.transactions ADD CONSTRAINT check_tx_amount CHECK (amount != 0);

-- 4. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

-- 5. REMOVER POLÍTICAS ANTIGAS VULNERÁVEIS
DROP POLICY IF EXISTS "Permitir leitura de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir insercao de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir atualizacao de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir exclusao de cartoes" ON public.cards;

DROP POLICY IF EXISTS "Permitir leitura anonima de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir insercao anonima de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir atualizacao anonima de cartoes" ON public.cards;
DROP POLICY IF EXISTS "Permitir exclusao anonima de cartoes" ON public.cards;

DROP POLICY IF EXISTS "Permitir leitura de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir insercao de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir atualizacao de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir exclusao de transacoes" ON public.transactions;

DROP POLICY IF EXISTS "Permitir leitura anonima de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir insercao anonima de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir atualizacao anonima de transacoes" ON public.transactions;
DROP POLICY IF EXISTS "Permitir exclusao anonima de transacoes" ON public.transactions;

DROP POLICY IF EXISTS "fixed_expenses_select_policy" ON public.fixed_expenses;
DROP POLICY IF EXISTS "fixed_expenses_insert_policy" ON public.fixed_expenses;
DROP POLICY IF EXISTS "fixed_expenses_update_policy" ON public.fixed_expenses;
DROP POLICY IF EXISTS "fixed_expenses_delete_policy" ON public.fixed_expenses;

-- 6. CRIAR POLÍTICAS SEGURAS COM ISOLAMENTO E CONTROLE DE ACESSO
CREATE POLICY "cards_select_policy" ON public.cards
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "cards_insert_policy" ON public.cards
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "cards_update_policy" ON public.cards
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL))
    WITH CHECK (total_limit >= 0 AND used_limit >= 0);

CREATE POLICY "cards_delete_policy" ON public.cards
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_update_policy" ON public.transactions
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "transactions_delete_policy" ON public.transactions
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_select_policy" ON public.fixed_expenses
    FOR SELECT
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_insert_policy" ON public.fixed_expenses
    FOR INSERT
    WITH CHECK ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_update_policy" ON public.fixed_expenses
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "fixed_expenses_delete_policy" ON public.fixed_expenses
    FOR DELETE
    USING ((auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)) OR (auth.uid() IS NULL AND user_id IS NULL));
`;
