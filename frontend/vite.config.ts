import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Railfan Archive Manager',
        short_name: 'RailFan',
        theme_color: '#C98A2C',
        background_color: '#19181c',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [{
          urlPattern: /^https:\/\/.*\/api\/(reference|locos|stats)/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 300 } }
        }]
      }
    })
  ]
})
