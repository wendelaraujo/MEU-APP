import React, { useState, useEffect } from 'react';

interface AndroidInstallBannerProps {
  isInstalled: boolean;
  onOpenModal: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  isInstalled,
  onOpenModal,
  onInstall,
  isInstallable,
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleAction = async () => {
    if (isInstallable) {
      const success = await onInstall();
      if (!success) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <div
      id="android-native-install-banner"
      className="bg-gradient-to-r from-[#0b1c30] via-[#10243e] to-[#0b1c30] text-white border-b border-slate-700/50 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs shadow-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 p-1">
          <img src="/pwa-192x192.png" alt="W-Finanças" className="w-full h-full object-contain rounded-md" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white truncate">Instalar no Android</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold shrink-0">
              App Nativo
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            Tela cheia sem barra do navegador, ícone no celular e offline.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleAction}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[15px]">download</span>
          <span>Instalar</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-md transition-colors"
          title="Fechar aviso"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
