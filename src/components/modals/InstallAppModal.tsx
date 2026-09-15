import React, { useState } from 'react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  onShowToast: (msg: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isInstalled,
  isAndroid,
  isIOS,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'apk'>('install');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const [manifestUrl, setManifestUrl] = useState(`${defaultOrigin}/manifest.webmanifest`);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const installed = await onInstall();
      if (installed) {
        onShowToast('Instalação iniciada! O app foi adicionado ao seu Android.');
        onClose();
      }
    } else {
      onShowToast('Siga as instruções abaixo para instalar pelo menu do navegador.');
    }
  };

  const bubblewrapInitCommand = `bubblewrap init --manifest="${manifestUrl}"`;

  const fullBubblewrapScript = `# 1. Instalar a ferramenta oficial do Google (Node.js e Java 17+ necessários)
npm install -g @bubblewrap/cli

# 2. Inicializar o projeto Android apontando para o Manifest público do W-Finanças
bubblewrap init --manifest="${manifestUrl}"

# 3. Compilar o arquivo APK nativo assinado
bubblewrap build

# O arquivo APK (.apk) ou App Bundle (.aab) gerado estará pronto para instalar no Android ou publicar na Play Store!`;

  const handleCopy = async (text: string, label: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      onShowToast(`${label} copiado para a área de transferência!`);
      setTimeout(() => setCopiedSection(null), 3000);
    } catch {
      onShowToast('Selecione e copie o texto manualmente.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center p-2">
              <img
                src="/pwa-192x192.png"
                alt="W-Finanças Icon"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Instalar no Android
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                  WebAPK / Nativo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                W-Finanças na tela inicial e gaveta de apps
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

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Instalação Direta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Gerar Arquivo APK
          </button>
        </div>

        {activeTab === 'install' && (
          <div className="space-y-4">
            {/* Status if already installed */}
            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">
                  check_circle
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Aplicativo Já Instalado no seu Dispositivo!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                    Você já está executando o W-Finanças como aplicativo nativo em modo standalone
                    (tela cheia, sem barra de navegação).
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 1-Click Install Button */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b1c30] to-[#1e3a8a] text-white space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">android</span>
                      Instalação em 1 Toque
                    </span>
                    <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                      Oficial Android
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Instalar W-Finanças no Celular
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                      Instala o aplicativo oficial no Android via WebAPK gerado pelo Google Play
                      Services. Sem ocupar a memória pesada de lojas.
                    </p>
                  </div>

                  <button
                    id="btn-install-android-pwa"
                    type="button"
                    onClick={handleTriggerInstall}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
                    <span>{isInstallable ? 'Instalar Agora no Android' : 'Instalar pelo Navegador'}</span>
                  </button>
                </div>

                {/* Vantagens Nativas */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                      fullscreen
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      Tela Cheia Nativa
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sem barra de endereços do Chrome ou abas.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">
                      wifi_off
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      Funciona Offline
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Acesse cartões e despesas mesmo sem conexão.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">
                      apps
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      Menu de Aplicativos
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ícone fixo junto a WhatsApp, Nubank e outros.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">
                      bolt
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      Atalhos Rápidos
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Segure o ícone para abrir Novo Lançamento.
                    </p>
                  </div>
                </div>

                {/* Passo a Passo Manual no Android Chrome */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">
                      help_outline
                    </span>
                    Como Instalar Manualmente no Chrome / Samsung Internet:
                  </h4>
                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-4 list-decimal">
                    <li>
                      Abra o link desta aplicação no <strong>Google Chrome</strong> do seu celular Android.
                    </li>
                    <li>
                      Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do navegador.
                    </li>
                    <li>
                      Selecione <strong>"Instalar aplicativo"</strong> (ou <strong>"Adicionar à tela inicial"</strong>).
                    </li>
                    <li>
                      Confirme em <strong>"Instalar"</strong>. O Android criará o aplicativo nativo automaticamente com ícone e tela de carregamento própria!
                    </li>
                  </ol>
                </div>
              </>
            )}

            {isIOS && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">apple</span>
                  No iPhone / iPad (iOS):
                </span>
                <p>
                  Toque no botão de <strong>Compartilhar</strong> do Safari (quadrado com seta) e escolha{' '}
                  <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            {/* Overview & Live Status */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
                    check_circle
                  </span>
                  Manifest Real e Acessível Publicamente
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                  Pronto para Bubblewrap
                </span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed text-[11px]">
                O arquivo <code>manifest.webmanifest</code> (e <code>manifest.json</code>) está configurado com nome,
                ícones 192px/512px, ícone adaptativo <em>maskable</em>, cores de tema e modo <em>standalone</em>.
              </p>
            </div>

            {/* Manifest URL Box with Test Link */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                URL Pública do Manifest (Usada pelo Bubblewrap):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manifestUrl}
                  onChange={(e) => setManifestUrl(e.target.value)}
                  placeholder="https://sua-url.com/manifest.webmanifest"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(manifestUrl, 'URL do Manifest', 'url')}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedSection === 'url' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedSection === 'url' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={manifestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Abrir e Testar Manifest no Navegador</span>
                </a>
                <span className="text-[11px] text-slate-400">
                  (Clique para confirmar que o JSON abre com sucesso)
                </span>
              </div>
            </div>

            {/* Bubblewrap Command Step by Step */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">
                    terminal
                  </span>
                  Comando Direto para o Bubblewrap CLI:
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(bubblewrapInitCommand, 'Comando Bubblewrap Init', 'cmd')}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedSection === 'cmd' ? 'check' : 'content_copy'}
                  </span>
                  {copiedSection === 'cmd' ? 'Copiado!' : 'Copiar comando'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 select-all">
                {bubblewrapInitCommand}
              </div>

              {/* Full Script Details */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Script Completo (Instalação + Inicialização + Build do APK):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(fullBubblewrapScript, 'Script Completo', 'script')}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedSection === 'script' ? 'check' : 'content_copy'}
                    </span>
                    {copiedSection === 'script' ? 'Copiado!' : 'Copiar Script Completo'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                  {fullBubblewrapScript}
                </pre>
              </div>
            </div>

            {/* Dicas e Alternativa PWABuilder */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">public</span>
                Alternativa Rápida Online (PWABuilder):
              </span>
              <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                Você também pode acessar <strong>pwabuilder.com</strong>, colar a URL do site e clicar em{' '}
                <strong>"Package for Android"</strong> para baixar o APK compilado instantaneamente sem precisar de terminal.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
