import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
