import { expect, test } from '@playwright/test'

test('login page exposes the primary authentication controls', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /correo electrónico/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Regístrate aquí' })).toBeVisible()
})

test('development proxy reaches the AppsFly backend', async ({ request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBeTruthy()
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    service: 'appsfly-api',
  })
})
