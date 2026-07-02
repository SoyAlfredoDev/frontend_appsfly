import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const APPSFLY_THEME = '#01c676'
const APPSFLY_BG = '#ffffff'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'iconoAppsfly.png',
        'logo_appsfly.png',
        'pwa/apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'AppsFly — Gestión para tu negocio',
        short_name: 'AppsFly',
        description:
          'Controla inventario, ventas, cotizaciones y reportes de tu negocio con AppsFly.',
        theme_color: APPSFLY_THEME,
        background_color: APPSFLY_BG,
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/login',
        lang: 'es',
        dir: 'ltr',
        categories: ['business', 'productivity', 'finance'],
        icons: [
          {
            src: 'pwa/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Inicio',
            description: 'Panel principal de tu negocio',
            url: '/dashboard',
            icons: [{ src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Nueva venta',
            short_name: 'Venta',
            description: 'Registrar una venta',
            url: '/sales/register',
            icons: [{ src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,jpg}'],
        globIgnores: ['**/businesses/**', '**/hero/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'appsfly-google-fonts',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'appsfly-gstatic-fonts',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
