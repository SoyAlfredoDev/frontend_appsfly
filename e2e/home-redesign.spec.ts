import { expect, test } from '@playwright/test'
import { PUBLIC_PLANS } from '../src/config/publicPlans'

const catalog = PUBLIC_PLANS.map((plan) => ({
  planId: plan.id,
  planPrice: plan.net,
  planDuration: plan.months,
  planActive: true,
}))

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) =>
    route.fulfill({
      json: new URL(route.request().url()).pathname.endsWith('/plans') ? catalog : [],
    }),
  )
})
for (const width of [390, 1440]) {
  test(`public tour, contact and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Vende, controla tu inventario y cobra lo pendiente.',
    )
    await page.getByRole('link', { name: 'Ver cómo funciona' }).click()
    await expect(page).toHaveURL(/#demostracion$/)
    const demo = page.getByRole('region', { name: 'De la venta al cobro, sin perder el hilo.' })
    await demo.getByRole('button', { name: /Sigue los abonos/ }).click()
    await expect(demo.getByRole('img')).toHaveAttribute('src', '/hero/recorrido-abonos.png')
    await demo.getByRole('button', { name: /Revisa tu stock/ }).click()
    await expect(demo.getByRole('link', { name: /Ampliar captura/ })).toHaveAttribute(
      'href',
      '/hero/recorrido-inventario.png',
    )
    for (const src of [
      '/hero/recorrido-venta.png',
      '/hero/recorrido-abonos.png',
      '/hero/recorrido-inventario.png',
    ]) {
      const image = await page.request.get(src)
      expect(image.ok()).toBeTruthy()
      expect(image.headers()['content-type']).toContain('image/png')
    }
    await expect(page.locator('body')).not.toContainText(
      'Implementamos autenticación de dos factores',
    )
    await expect(page.locator('body')).not.toContainText('Enviamos notificaciones al WhatsApp')
    for (const link of await page.locator('a[href^="https://wa.me/"]').all())
      await expect(link).toHaveAttribute('href', /wa.me\/56935784716/)
    if (width < 1024) {
      await page.getByRole('button', { name: 'Abrir menú' }).click()
      await page.locator('header').getByRole('link', { name: 'Planes', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    } else await page.locator('header').getByRole('link', { name: 'Planes', exact: true }).click()
    await expect(page).toHaveURL(/#planes$/)
    await expect(
      page.getByRole('region', { name: 'Planes de AppsFly' }).getByRole('article'),
    ).toHaveCount(3)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
    expect(errors).toEqual([])
  })
}
