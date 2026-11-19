import { expect, test } from '@playwright/test'

test('un administrador crea y revoca una llave desde Configuración', async ({ page }) => {
  const key = { id: 'key-qa', name: 'Sistema de caja', scopes: ['sales:write'], lastUsedAt: null }
  let revoked = false
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
    let data: unknown = []
    if (path === '/verify') data = { id: 'qa-admin' }
    else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
    else if (path.startsWith('/users/')) data = { userId: 'qa-admin', userFirstName: 'QA' }
    else if (path === '/userBusiness')
      data = [{ userBusinessBusinessId: 'qa-business', userBusinessRole: 'ADMIN' }]
    else if (path.startsWith('/subscriptions/'))
      data = [
        {
          subscriptionPlanId: 'P001',
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: '2099-01-01T00:00:00Z',
        },
      ]
    else if (path.startsWith('/business/'))
      data = { businessId: 'qa-business', businessName: 'QA', businessType: 'general' }
    else if (path === '/integration-keys') {
      expect(route.request().headers()['x-appsfly-business-id']).toBe('qa-business')
      if (route.request().method() === 'POST') {
        expect(route.request().postDataJSON()).toEqual({ name: key.name, scopes: key.scopes })
        return route.fulfill({ status: 201, json: { key, secret: 'llave-de-prueba' } })
      }
      data = { keys: [] }
    } else if (path === '/integration-keys/key-qa' && route.request().method() === 'DELETE') {
      revoked = true
      return route.fulfill({ status: 204 })
    }
    await route.fulfill({ status: 200, json: data })
  })

  await page.goto('/login')
  await page.evaluate(() => localStorage.setItem('token', 'qa-integration'))
  await page.goto('/configuration')
  await expect(page.getByText('Este negocio todavía no tiene llaves.')).toBeVisible()
  await page.getByLabel('Nombre de la integración').fill(key.name)
  await page.getByRole('checkbox', { name: 'Registrar ventas' }).check()
  await page.getByRole('button', { name: 'Crear llave' }).click()
  await expect(page.getByLabel('Llave generada')).toHaveValue('llave-de-prueba')
  await page.getByRole('button', { name: 'Ocultar llave' }).click()
  await expect(page.getByLabel('Llave generada')).toHaveCount(0)
  await page.getByRole('button', { name: 'Revocar Sistema de caja' }).click()
  await page.getByRole('button', { name: 'Confirmar revocación' }).click()
  await expect(page.getByText('Sistema de caja · Revocada')).toBeVisible()
  expect(revoked).toBe(true)
})
