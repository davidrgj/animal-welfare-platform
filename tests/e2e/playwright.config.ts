import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'https://animal-welfare-platform-vepq.vercel.app';

export default defineConfig({
  testDir: './specs',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: '../../tests/results/e2e.json' }]],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off'
  },
  outputDir: '../../docs/evidence/playwright-failures',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }
  ]
});
