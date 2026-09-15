export type TabType = 'inicio' | 'lancamentos' | 'fixas' | 'cartoes' | 'relatorios';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'pix' | 'money' | 'debit' | 'credit';

export interface FixedExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDay: number; // 1 to 31
  isPaid: boolean;
  paidAt?: string | null;
  notes?: string;
  paymentMethod?: PaymentMethod;
  createdAt?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  subtitle: string;
  digits: string;
  brand: 'mastercard' | 'visa';
  totalLimit: number;
  usedLimit: number;
  closingDay: number;
  dueDay: number;
  gradientClass: string;
  status: string;
  isPrincipal: boolean;
  colorAccent: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  category: string;
  paymentMethod: PaymentMethod;
  cardId?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
  totalPurchaseAmount?: number;
  isRecurring?: boolean;
  notes?: string;
  account?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  subtext: string;
  icon: string;
  colorHex: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
}

export interface MonthlyBalanceData {
  id: string;
  month: string;
  fullName: string;
  income: number;
  expense: number;
  isCurrent?: boolean;
}

export interface IncomeSource {
  id: string;
  name: string;
  origin: string;
  amount: number;
  badge: string;
  icon: string;
  isEstimate?: boolean;
}

export interface FutureInvoice {
  month: string;
  amount: number;
  installmentCount: number;
  borderOpacity: string;
}
