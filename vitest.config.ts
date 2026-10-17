import { defineConfig } from 'vitest/config'

// Cakupan tes: logika murni di src/lib (schema, stats, shift, recap, backup,
// meta). Environment 'node' supaya tidak perlu jsdom — komponen React, akses
// localStorage, dan API browser (Notification/service worker) sengaja di luar
// cakupan karena butuh mock DOM yang berat dan hasilnya rapuh.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
