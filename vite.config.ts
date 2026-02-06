import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'deePwn Portfolio',
        short_name: 'deePwn',
        description: "deePwn's Personal Portfolio",
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Global workbox settings
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

        // Runtime caching for GitHub API requests
        runtimeCaching: [
          {
            // Cache GitHub REST API responses (users, repos, etc.)
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'github-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              backgroundSync: {
                name: 'github-api-queue',
                options: {
                  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
                },
              },
            },
          },
          {
            // Cache GitHub GraphQL API responses
            urlPattern: /^https:\/\/api\.github\.com\/graphql/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'github-graphql-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              backgroundSync: {
                name: 'github-graphql-queue',
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
          },
          {
            // Cache GitHub avatar images
            urlPattern: /^https:\/\/avatars\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-avatars-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60, // 1 hour
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
          {
            // Cache raw content from GitHub (readme, etc.)
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-raw-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
        ],

        // Precache manifest (optional but useful)
        manifestTransforms: [
          async (manifest) => {
            // Add cache busting with build timestamp
            const timestamp = Date.now();
            const warnings: string[] = [];
            const transformedManifest = manifest.map((entry) => {
              if (entry.url.startsWith('/assets/')) {
                return {
                  ...entry,
                  url: `${entry.url}?v=${timestamp}`,
                };
              }
              return entry;
            });
            return { manifest: transformedManifest, warnings };
          },
        ],

        // Dev mode settings (optional, for debugging)
        // @ts-expect-error devOptions is valid for InjectManifest but not fully typed in GenerateSW
        devOptions: {
          enabled: true,
          type: 'module',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'docs',
  },
});
