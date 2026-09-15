import React, { useState } from 'react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SCHEMA_SQL,
  SUPABASE_HARDENING_SQL,
  SupabaseStatus,
  seedInitialDataToSupabase,
} from '../../lib/supabase';
import { CreditCard, Transaction, FixedExpense } from '../../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SupabaseStatus;
  onRefreshStatus: () => Promise<void>;
  cards: CreditCard[];
  transactions: Transaction[];
  fixedExpenses?: FixedExpense[];
  onShowToast: (msg: string) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
  cards,
  transactions,
  fixedExpenses = [],
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'security'>('status');
  const [copied, setCopied] = useState(false);
  const [copiedHardening, setCopiedHardening] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSQLDetails, setShowSQLDetails] = useState(false);

  if (!isOpen) return null;

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopied(true);
      onShowToast('Script SQL copiado com sucesso!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      onShowToast('Selecione e copie o texto manualmente.');
    }
  };

  const handleCopyHardeningSQL = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_HARDENING_SQL);
      setCopiedHardening(true);
      onShowToast('Script de Correção RLS copiado!');
      setTimeout(() => setCopiedHardening(false), 3000);
    } catch {
      onShowToast('Selecione e copie o texto manualmente.');
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    const result = await seedInitialDataToSupabase(cards, transactions, fixedExpenses);
    setSyncing(false);
    onShowToast(result.message);
    if (result.success) {
      await onRefreshStatus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Integração Supabase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Banco de Dados PostgreSQL em Nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Visão Geral & Dados</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Segurança & RLS</span>
          </button>
        </div>

        {/* TAB 1: STATUS & DATA */}
        {activeTab === 'status' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Credentials Overview */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Supabase Project URL
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                  {SUPABASE_URL}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Chave Pública (Anon Key)
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                  {SUPABASE_ANON_KEY.substring(0, 16)}...{SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 8)}
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                status.tablesExist
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">
                {status.tablesExist ? 'verified' : 'pending'}
              </span>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">
                  {status.tablesExist
                    ? 'Conexão 100% Concluída e Operacional'
                    : 'Conexão Estabelecida — Tabelas Pendentes'}
                </div>
                <p className="leading-relaxed opacity-90">
                  {status.tablesExist
                    ? 'Todas as tabelas necessárias foram encontradas e validadas no Supabase! Cada inclusão, edição, exclusão e pagamento de fatura é gravado instantaneamente no banco em nuvem.'
                    : 'Sua chave e URL foram validadas com sucesso! Para que os dados sejam salvos no Supabase, execute o script SQL abaixo no seu painel.'}
                </p>
              </div>
            </div>

            {/* Cloud Tables Overview (when connected) */}
            {status.tablesExist && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tabelas Criadas e Sincronizadas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">credit_card</span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">public.cards</div>
                        <div className="text-[11px] text-slate-400">Cartões e limites</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      {cards.length} ativo{cards.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">receipt_long</span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">public.transactions</div>
                        <div className="text-[11px] text-slate-400">Lançamentos e faturas</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      {transactions.length} registros
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSQLDetails((prev) => !prev)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showSQLDetails ? 'expand_less' : 'expand_more'}
                    </span>
                    <span>{showSQLDetails ? 'Ocultar Estrutura Inicial' : 'Ver Estrutura Inicial'}</span>
                  </button>

                  {showSQLDetails && (
                    <div className="mt-2 relative animate-in fade-in duration-150">
                      <pre className="bg-slate-950 text-slate-100 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed border border-slate-800 select-all">
                        {SUPABASE_SCHEMA_SQL}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  await onRefreshStatus();
                  onShowToast('Dados atualizados com sucesso!');
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                <span>Atualizar do Supabase</span>
              </button>

              <button
                type="button"
                disabled={syncing}
                onClick={handleSyncData}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>{syncing ? 'Sincronizando...' : 'Enviar Dados Locais'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & HARDENING */}
        {activeTab === 'security' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            {/* Vulnerability Summary Card */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 space-y-2 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px] text-amber-600">security</span>
                <span>Auditoria de Políticas RLS</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed opacity-95">
                <li>
                  <strong>Acesso Inseguro Global:</strong> Políticas com <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">USING (true)</code> permitem que qualquer pessoa com a chave anon visualize, altere ou exclua qualquer registro.
                </li>
                <li>
                  <strong>Falta de Isolamento por Usuário:</strong> As tabelas precisavam da coluna <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">user_id</code> vinculada a <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">auth.uid()</code> para garantir que cada usuário só acesse suas próprias finanças.
                </li>
                <li>
                  <strong>Validação de Dados:</strong> Ausência de constraints para barrar valores negativos de limite ou lançamentos corrompidos.
                </li>
              </ul>
            </div>

            {/* Hardening Script Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                  <span>Script de Blindagem e Correção RLS</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyHardeningSQL}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedHardening ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedHardening ? 'Copiado!' : 'Copiar Script de Correção'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-100 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800 select-all">
                  {SUPABASE_HARDENING_SQL}
                </pre>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-800 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Como aplicar a correção no Supabase:</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Abra o <strong>SQL Editor</strong> no painel do Supabase, cole o script acima e clique em <strong>Run</strong>. Ele substituirá as políticas vulneráveis pelas políticas blindadas por usuário e manterá seus dados existentes intactos!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
