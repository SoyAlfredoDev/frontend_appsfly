import { expect, test } from '@playwright/test'
import { PUBLIC_PLANS } from '../src/config/publicPlans'

const catalog = PUBLIC_PLANS.map((plan) => ({
  planId: plan.id,
  planPrice: plan.net,
  planDuration: plan.months,
  planCurrency: 'CLP',
  planActive: true,
}))

test.beforeEach(async ({ page }) => {
  // Isolate public marketing tests from authenticated services and billing providers.
  await page.route('**/api/**', async (route) => {
    if (new URL(route.request().url()).pathname.endsWith('/plans')) {
      await route.fulfill({ json: catalog })
    } else {
      await route.fulfill({ status: 401, json: { code: 'UNAUTHENTICATED' } })
    }
  })
})

for (const width of [390, 1440]) {
  test(`home and prices show the verified offer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/precios']) {
      await page.goto(path)
      const plans = page.getByRole('region', { name: 'Planes de AppsFly' })
      await expect(plans.getByRole('article')).toHaveCount(3)
      await plans.scrollIntoViewIfNeeded()
      await expect(plans.getByText('$29.738 al mes con IVA incluido')).toBeVisible()
      await expect(plans.getByText('$47.588 al mes con IVA incluido')).toBeVisible()
      await expect(plans.getByText('por 2 meses', { exact: true })).toBeVisible()
      await expect(plans.getByText(/Tienda de ropa: tallas, colores, SKU/)).toBeVisible()
      const links = plans.getByRole('link')
      await expect(links).toHaveCount(3)
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute('href', '/register')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      )
    }
    await page
      .getByRole('region', { name: 'Planes de AppsFly' })
      .getByRole('link', { name: 'Probar 2 meses gratis', exact: true })
      .click()
    await expect(page).toHaveURL(/\/register$/)
    await expect(page.getByRole('heading', { name: 'Crear cuenta nueva' })).toBeVisible()
  })
}

test('an unavailable catalog can be retried without blanking the public page', async ({ page }) => {
  let calls = 0
  await page.route('**/api/plans', async (route) => {
    calls += 1
    await route.fulfill(
      calls === 1 ? { status: 503, json: { code: 'CATALOG_UNAVAILABLE' } } : { json: catalog },
    )
  })
  await page.goto('/precios')
  const plans = page.getByRole('region', { name: 'Planes de AppsFly' })
  await expect(plans.getByRole('alert')).toContainText('No pudimos confirmar')
  await expect(page.getByRole('heading', { name: 'Precios de AppsFly', exact: true })).toBeVisible()
  await expect(plans.getByRole('link')).toHaveCount(0)
  await plans.getByRole('button', { name: 'Volver a consultar' }).click()
  await expect(plans.getByRole('article')).toHaveCount(3)
})

test('an empty catalog never advertises retired plans', async ({ page }) => {
  await page.route('**/api/plans', (route) => route.fulfill({ json: [] }))
  await page.goto('/precios')
  const plans = page.getByRole('region', { name: 'Planes de AppsFly' })
  await expect(plans.getByRole('status')).toContainText('No hay planes disponibles')
  await expect(plans.getByRole('link')).toHaveCount(0)
})

test('the optical landing preserves its specialized registration destination', async ({ page }) => {
  await page.goto('/optica')
  const plans = page.getByRole('region', { name: 'Planes de AppsFly' })
  await expect(plans.getByRole('article')).toHaveCount(3)
  await expect(plans.getByRole('link', { name: 'Probar 2 meses gratis' })).toHaveAttribute(
    'href',
    '/register?source=optica',
  )
})
