import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline capability & WebAPK installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Nova versão do W-Finanças disponível.');
  },
  onOfflineReady() {
    console.log('[PWA] Aplicativo pronto para uso offline no Android.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

