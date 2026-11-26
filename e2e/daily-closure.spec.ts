import { expect, test, type Page } from '@playwright/test'

const overdueDay = '2025-09-07'

async function mockClosures(page: Page, isOverdue: boolean) {
  const businessId = 'closure-qa'
  const requests: Array<{
    dailySalesDay: string
    countedCash?: number
    withoutCashCount?: boolean
  }> = []
  const history: unknown[] = []
  await page.addInitScript(() => localStorage.setItem('token', 'test-closure-session'))
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const path = new URL(route.request().url()).pathname.slice('/api'.length)
      const method = route.request().method()
      const headers = {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'authorization, content-type, x-appsfly-business-id',
      }
      if (method === 'OPTIONS') return route.fulfill({ status: 204, headers })

      let data: unknown = []
      if (path === '/verify') data = { id: 'test-admin' }
      else if (path === '/users/test-admin') data = { userId: 'test-admin', userFirstName: 'Admin' }
      else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
      else if (path === '/userBusiness')
        data = [{ userBusinessBusinessId: businessId, userBusinessRole: 'ADMIN' }]
      else if (path.startsWith('/subscriptions/'))
        data = [{ subscriptionStatus: 'ACTIVE', subscriptionEndDate: '2100-01-01' }]
      else if (path === '/business/' + businessId)
        data = {
          businessId,
          businessName: 'Local de prueba',
          businessType: 'optics',
          businessTimezone: 'America/Santiago',
        }
      else if (path === '/dailySales/closure-status') {
        const pending = isOverdue && requests.length === 0
        data = pending
          ? {
              blocked: true,
              error: 'BLOQUEO_CIERRE_PENDIENTE',
              fechaPendiente: overdueDay,
              fechasPendientes: [overdueDay],
            }
          : { blocked: false, fechasPendientes: [] }
      } else if (path === '/dailySales' && method === 'POST') {
        const input = route.request().postDataJSON()
        requests.push(input)
        const closure = {
          dailySalesDay: input.dailySalesDay,
          dailySalesCountedCash: input.countedCash ?? null,
          dailySalesCashDifference: input.countedCash ?? null,
          dailySalesId: 'closure-saved',
          dailySalesNumberOfSales: 1,
          dailySalesTotalSales: 1000,
          dailySalesTotalIncome: 1000,
        }
        history.push(closure)
        return route.fulfill({ status: 201, headers, json: closure })
      } else if (path === '/dailySales') data = history
      else if (path === '/dailySales/close-all-pending')
        throw new Error('The new web client must close using the cash count form')
      await route.fulfill({ status: 200, headers, json: data })
    },
  )
  return requests
}

test.use({ serviceWorkers: 'block', reducedMotion: 'reduce' })

test('Cierres Diarios pide efectivo contado para cerrar hoy', async ({ page }) => {
  const requests = await mockClosures(page, false)
  await page.goto('/sales/dailySales')
  await expect(page.getByRole('heading', { name: 'Cierres Diarios' })).toBeVisible()
  const start = page.getByRole('button', { name: 'Realizar cierre diario' })
  await expect(start).toHaveCount(1)
  await start.click()
  const form = page.getByRole('form', { name: /Arqueo de/ })
  await expect(form.getByRole('checkbox', { name: /Cerrar sin arqueo/ })).toHaveCount(0)
  await form.getByRole('button', { name: 'Guardar cierre' }).click()
  await expect(form.getByRole('alert')).toContainText('Ingresa el efectivo contado')
  expect(requests).toHaveLength(0)
  await form.getByLabel('Efectivo contado').fill('0')
  await form.getByRole('button', { name: 'Guardar cierre' }).click()
  await expect(form).toHaveCount(0)
  expect(requests).toMatchObject([{ countedCash: 0 }])
})

test('registrar venta usa el mismo formulario y permite un pendiente sin arqueo', async ({
  page,
}) => {
  const requests = await mockClosures(page, true)
  await page.goto('/sales/register')
  const blocked = page.getByRole('heading', { name: 'Operación bloqueada', level: 2 })
  await expect(blocked).toBeVisible()
  await page.getByRole('button', { name: 'Realizar cierre diario' }).click()
  const form = page.getByRole('form', { name: /Arqueo de/ })
  const input = form.getByLabel('Efectivo contado')
  await expect(input).toBeEnabled()
  await form.getByRole('checkbox', { name: /Cerrar sin arqueo/ }).check()
  await expect(input).toBeDisabled()
  await form.getByRole('button', { name: 'Guardar cierre' }).click()
  await expect(blocked).toHaveCount(0)
  expect(requests).toEqual([{ dailySalesDay: overdueDay, withoutCashCount: true }])

  await page.goto('/sales/dailySales')
  await expect(page.getByRole('cell', { name: 'Sin arqueo' })).toBeVisible()
})
