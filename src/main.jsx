import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'

import './index.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (window.confirm("Hay una nueva versión de AppsFly. ¿Actualizar ahora?")) {
      updateSW(true);
    }
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      registration.update().catch(() => {});
    }
    if (import.meta.env.DEV) {
      console.info('[AppsFly PWA] Service worker registrado:', swUrl);
    }
  },
  onOfflineReady() {
    if (import.meta.env.DEV) {
      console.info('[AppsFly PWA] Lista para uso offline (interfaz).');
    }
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
