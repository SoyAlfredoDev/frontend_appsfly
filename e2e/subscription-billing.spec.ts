import { expect, test } from '@playwright/test'

for (const expired of [false, true]) {
  test(`billing remains manageable ${expired ? 'after expiry' : 'during trial'}`, async ({
    context,
    page,
  }) => {
    let cancelled = false
    const end = expired ? '2020-12-14T15:00:00Z' : '2099-12-14T15:00:00Z'
    await context.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
      let data: unknown = []
      if (path === '/verify') data = { id: 'qa-a' }
      else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
      else if (path.startsWith('/users/'))
        data = { userId: 'qa-a', userFirstName: 'QA', userLastName: 'Billing' }
      else if (path === '/userBusiness')
        data = [{ userBusinessBusinessId: 'tenant-a', userBusinessRole: 'ADMIN' }]
      else if (path.endsWith('/cancel')) {
        cancelled = true
        data = { ok: true }
      } else if (path === '/subscriptions/billing/tenant-a')
        data = {
          hasSubscription: true,
          subscription: {
            subscriptionStatus: expired ? 'EXPIRED' : 'ACTIVE',
            subscriptionEndDate: end,
            isPromoFreeTrial: true,
            accessStillValid: !expired,
            autoRenewEnabled: false,
          },
          pendingCheckout: cancelled
            ? null
            : {
                paymentId: 'p',
                planName: 'Pro',
                firstChargeAt: end,
                authorized: true,
                checkoutUrl: null,
                amount: 47588,
                currency: 'CLP',
                canCancel: true,
              },
        }
      else if (path.startsWith('/subscriptions/'))
        data = [
          {
            subscriptionPlanId: 'P001',
            subscriptionStatus: expired ? 'EXPIRED' : 'ACTIVE',
            subscriptionEndDate: end,
          },
        ]
      else if (path.startsWith('/business/'))
        data = { businessId: 'tenant-a', businessName: 'QA Billing', businessType: 'optics' }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    })
    await page.goto('/login')
    await page.evaluate(() => localStorage.setItem('token', 'qa-billing'))
    await page.goto('/configuration/subscription')
    await expect(
      page.getByRole('heading', { name: 'Medio de pago autorizado · Pro' }),
    ).toBeVisible()
    await expect(page.getByText(/Autorizar la tarjeta no confirma el pago/)).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar contratación pendiente' }).click()
    const label = page.getByLabel(/Escribe/)
    const phrase = (await page.locator('label[for="cancel-pending-subscription"]').innerText())
      .replace(/^Escribe /, '')
      .replace(' para cancelar los cobros futuros.', '')
    await label.fill(phrase)
    await page.getByRole('button', { name: 'Confirmar cancelación' }).click()
    await expect(page.getByRole('heading', { name: 'Medio de pago autorizado · Pro' })).toHaveCount(
      0,
    )
    expect(cancelled).toBe(true)
  })
}

test('the return page does not announce payment when only the card was authorized', async ({
  context,
  page,
}) => {
  await context.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
    let data: unknown = []
    if (path === '/verify') data = { id: 'qa-a' }
    else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
    else if (path.startsWith('/users/')) data = { userId: 'qa-a', userFirstName: 'QA' }
    else if (path === '/userBusiness')
      data = [{ userBusinessBusinessId: 'tenant-a', userBusinessRole: 'ADMIN' }]
    else if (path.endsWith('/sync'))
      data = {
        authorizationOnly: true,
        firstChargeAt: '2099-12-14T15:00:00Z',
        payment: { status: 'PENDING' },
        subscription: { subscriptionStatus: 'PENDIENT' },
      }
    else if (path.startsWith('/subscriptions/'))
      data = [
        {
          subscriptionPlanId: 'P001',
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: '2099-12-14T15:00:00Z',
        },
      ]
    else if (path.startsWith('/business/'))
      data = { businessId: 'tenant-a', businessName: 'QA', businessType: 'optics' }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  })
  await page.goto('/login')
  await page.evaluate(() => localStorage.setItem('token', 'qa-billing'))
  await page.goto('/subscription/payment/return?external_reference=p')
  await expect(page.getByRole('heading', { name: 'Autorización registrada' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pago confirmado' })).toHaveCount(0)
})
