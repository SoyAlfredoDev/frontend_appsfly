import { expect, test } from '@playwright/test'

test('customer names disappear automatically when another tab signs in to a different business', async ({
  context,
  page,
}) => {
  await context.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
    const isB = route.request().headers().authorization === 'Bearer qa-session-b'
    const userId = isB ? 'qa-b' : 'qa-a'
    const businessId = isB ? 'tenant-b' : 'tenant-a'
    let data: unknown = []
    if (path === '/verify') data = { id: userId }
    else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
    else if (path.startsWith('/users/'))
      data = { userId, userFirstName: 'QA', userLastName: userId }
    else if (path === '/userBusiness')
      data = [{ userBusinessBusinessId: businessId, userBusinessRole: 'ADMIN' }]
    else if (path.startsWith('/subscriptions/'))
      data = [{ subscriptionStatus: 'ACTIVE', subscriptionEndDate: '2100-01-01' }]
    else if (path.startsWith('/business/'))
      data = { businessId, businessName: businessId, businessType: 'optics' }
    else if (path === '/customers') {
      expect(route.request().headers()['x-appsfly-business-id']).toBe(businessId)
      data = isB
        ? []
        : [{ customerId: 'qa-client-a', customerFirstName: 'Cliente', customerLastName: 'Privado' }]
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  })
  await page.goto('/login')
  await page.evaluate(() => localStorage.setItem('token', 'qa-session-a'))
  await page.goto('/customers')
  await expect(page.getByText('Cliente Privado')).toBeVisible()
  const otherTab = await context.newPage()
  await otherTab.goto('/profile')
  await otherTab.evaluate(() => localStorage.setItem('token', 'qa-session-b'))
  await expect(page.getByText('No hay clientes registrados.')).toBeVisible()
  await expect(page.getByText('Cliente Privado')).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('appsfly_business_id')))
    .toBe('tenant-b')
})

test('logging out in another tab removes the local identity and tenant selection', async ({
  context,
  page,
}) => {
  await context.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    let data: unknown = []
    if (url.pathname.endsWith('/verify')) data = { id: 'qa-a' }
    else if (url.pathname.includes('/users/'))
      data = {
        userId: 'qa-a',
        userFirstName: 'QA',
        userLastName: 'A',
        userEmail: 'qa@example.invalid',
      }
    else if (url.pathname.includes('superAdmin')) data = { isSuperAdmin: false }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  })
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.setItem('token', 'qa-session-a')
    sessionStorage.setItem('appsfly_business_id', 'qa-tenant-a')
  })
  await page.reload()
  const otherTab = await context.newPage()
  await otherTab.goto('/login')
  const reload = page.waitForEvent('load')
  await otherTab.evaluate(() => localStorage.removeItem('token'))
  await reload
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('appsfly_business_id')))
    .toBeNull()
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
})
