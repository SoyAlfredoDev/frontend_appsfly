import { expect, test } from '@playwright/test'

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
