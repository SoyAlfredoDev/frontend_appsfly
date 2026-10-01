import { defineConfig, devices } from '@playwright/test'

const frontendPort = 4180
const ciApiPort = 4181
const apiTarget =
  process.env.PLAYWRIGHT_API_TARGET ||
  (process.env.CI ? `http://127.0.0.1:${ciApiPort}` : 'http://127.0.0.1:3000')

const webServers = [
  {
    command: `npm run preview -- --host 127.0.0.1 --port ${frontendPort}`,
    url: `http://127.0.0.1:${frontendPort}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_DEV_API_PROXY_TARGET: apiTarget,
    },
  },
]

if (process.env.CI) {
  webServers.push({
    command: 'npx tsx e2e/mock-api-server.ts',
    url: `${apiTarget}/api/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: { VITE_DEV_API_PROXY_TARGET: apiTarget },
  })
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: webServers,
})
