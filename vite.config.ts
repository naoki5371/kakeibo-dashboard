import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages用のベースパス（本番のみリポジトリ名を付与）
const base = process.env.NODE_ENV === 'production' ? '/kakeibo-dashboard/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '家計簿ダッシュボード',
        short_name: '家計簿',
        description: 'Googleスプレッドシートの支出データを可視化する家計簿ダッシュボード',
        lang: 'ja',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fafafa',
        theme_color: '#334155',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Googleスプレッドシートのデータは常に最新を取りに行く（オフライン時はキャッシュ）
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/docs\.google\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gsheets-data',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
