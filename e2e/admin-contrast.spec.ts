import { expect, test, type Locator } from '@playwright/test'

const plan = { planId: 'test-plan', planName: 'Plan de prueba' }
const activeBusiness = { businessId: 'business-active', businessName: 'Comercio activo' }
const expiringBusiness = { businessId: 'business-expiring', businessName: 'Comercio por vencer' }
const leadBusiness = { businessId: 'business-lead', businessName: 'Comercio prospecto' }

function subscription(business: typeof activeBusiness, daysUntilExpiration: number) {
  return {
    subscriptionId: `sub-${business.businessId}`,
    subscriptionBusinessId: business.businessId,
    subscriptionStatus: 'ACTIVE',
    subscriptionPlanId: plan.planId,
    subscriptionStartDate: '2025-05-01T12:00:00Z',
    subscriptionEndDate: new Date(Date.now() + daysUntilExpiration * 86_400_000).toISOString(),
    subscriptionAmount: 30_000,
    subscriptionDuration: 1,
    business,
    plan,
  }
}

function textContrast(element: Element) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const pixel = canvas.getContext('2d')!
  const backgrounds: string[] = []

  // Includes translucent fills on count badges and surfaces supplied by ancestors.
  for (let node: Element | null = element; node; node = node.parentElement) {
    backgrounds.unshift(getComputedStyle(node).backgroundColor)
  }

  function paint(color: string) {
    pixel.fillStyle = color
    pixel.fillRect(0, 0, 1, 1)
  }

  function luminance() {
    const [red, green, blue] = Array.from(pixel.getImageData(0, 0, 1, 1).data, (channel) => {
      const value = channel / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return red * 0.2126 + green * 0.7152 + blue * 0.0722
  }

  paint('white')
  backgrounds.forEach(paint)
  const background = luminance()
  paint(getComputedStyle(element).color)
  const foreground = luminance()
  return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
}

async function expectTextContrast(locator: Locator) {
  await expect(locator).toBeVisible()
  await expect.poll(() => locator.evaluate(textContrast)).toBeGreaterThanOrEqual(4.5)
}

async function expectFilterContrast(button: Locator, selected: boolean, count?: number) {
  await expect(button).toHaveAttribute('aria-pressed', String(selected))
  await expectTextContrast(button)
  if (count !== undefined) {
    await expectTextContrast(button.getByText(String(count), { exact: true }))
  }
}

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' })

test.beforeEach(async ({ page }) => {
  const activeSubscription = subscription(activeBusiness, 45)
  const expiringSubscription = subscription(expiringBusiness, 3)
  const businessDetail = {
    ...activeBusiness,
    businessType: 'general',
    businessCountry: 'chile',
    createdAt: '2025-05-01T12:00:00Z',
    subscriptions: [activeSubscription],
  }
  const responses: Record<string, unknown> = {
    '/verify': { id: 'test-admin' },
    '/users/test-admin': { userId: 'test-admin', userFirstName: 'Admin' },
    '/users/isSuperAdmin': { isSuperAdmin: true },
    '/users/isPlatformOwner': { isPlatformOwner: true },
    '/admin/businesses': [
      businessDetail,
      { ...expiringBusiness, subscriptions: [expiringSubscription] },
      { ...leadBusiness, subscriptions: [] },
    ],
    [`/admin/businesses/${activeBusiness.businessId}`]: {
      business: businessDetail,
      tenant: { available: true },
    },
    '/admin/subscriptions': [activeSubscription, expiringSubscription],
    '/plans': [plan],
    '/admin/agent-tasks/access': { canManageQueue: true, hasLocalAccess: true },
    '/admin/agent-tasks': {
      tasks: [
        { taskId: 'one', title: 'Revisar ficha', status: 'PENDING' },
        { taskId: 'two', title: 'Actualizar listado', status: 'COMPLETED' },
      ],
    },
    '/admin/email-campaigns': [
      {
        campaignId: 'example-campaign',
        campaignName: 'Campaña de ejemplo',
        scheduleEligibility: { due: true },
      },
    ],
    '/admin/email-campaigns/ensure-system': {},
  }

  await page.addInitScript(() => localStorage.setItem('token', 'test-admin-session'))
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
      const headers = {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'Authorization, X-AppsFly-Agent-Token',
      }
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers })
        return
      }
      expect(route.request().method()).toBe(
        path === '/admin/email-campaigns/ensure-system' ? 'POST' : 'GET',
      )
      await route.fulfill({ headers, json: responses[path] ?? [] })
    },
  )
})

for (const [device, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
] as const) {
  test.describe(device, () => {
    test.use({ viewport })

    test('company segment filters and counts stay legible and switch the results', async ({
      page,
    }) => {
      await page.goto('/admin/businesses')
      const filters = page.getByRole('group', { name: 'Estado comercial' })
      const active = filters.getByRole('button', { name: 'Con plan activo 1', exact: true })
      const pending = filters.getByRole('button', {
        name: 'Pendientes / por vencer 1',
        exact: true,
      })
      const leads = filters.getByRole('button', { name: 'Sin suscripción 1', exact: true })

      await expectFilterContrast(active, true, 1)
      await expectFilterContrast(pending, false, 1)
      await expectFilterContrast(leads, false, 1)
      await expect(page.getByRole('cell', { name: /Comercio activo/ })).toBeVisible()

      await active.click()
      await page.keyboard.press('Tab')
      await expect(pending).toBeFocused()
      await expect(pending).toHaveCSS('outline-style', 'solid')
      await expect(pending).toHaveCSS('outline-width', '2px')
      await page.keyboard.press('Enter')
      await expectFilterContrast(pending, true, 1)
      await expectFilterContrast(active, false, 1)
      await expect(page.getByRole('cell', { name: /Comercio por vencer/ })).toBeVisible()
      await expect(page.getByRole('cell', { name: /Comercio activo/ })).toHaveCount(0)

      await leads.click()
      await expectFilterContrast(leads, true, 1)
      await expect(page.getByRole('cell', { name: /Comercio prospecto/ })).toBeVisible()
      await expect(page.getByRole('cell', { name: /Comercio por vencer/ })).toHaveCount(0)
    })

    test('subscription state filters and counts stay legible and show renewals', async ({
      page,
    }) => {
      await page.goto('/admin/subscriptions')
      const filters = page.getByRole('group', { name: 'Estado de suscripción' })
      const active = filters.getByRole('button', { name: 'Activas 1', exact: true })
      const expiring = filters.getByRole('button', { name: 'Próximas a vencer 1', exact: true })

      await expectFilterContrast(active, true, 1)
      await expectFilterContrast(expiring, false, 1)
      await expect(page.getByRole('cell', { name: /Comercio activo/ })).toBeVisible()

      await expiring.click()
      await expectFilterContrast(expiring, true, 1)
      await expectFilterContrast(active, false, 1)
      await expect(page.getByRole('cell', { name: /Comercio por vencer/ })).toBeVisible()
      await expect(page.getByRole('cell', { name: /Comercio activo/ })).toHaveCount(0)
    })

    test('company detail filters stay legible and open their corresponding sections', async ({
      page,
    }) => {
      await page.goto(`/admin/businesses/${activeBusiness.businessId}`)
      const sections = page.getByRole('group', { name: 'Secciones de la empresa' })
      const users = sections.getByRole('button', { name: 'Usuarios asociados' })
      const history = sections.getByRole('button', { name: 'Historial SaaS' })
      const movements = sections.getByRole('button', { name: 'Movimientos tenant' })

      await expectFilterContrast(users, true)
      await expectFilterContrast(history, false)
      await expectFilterContrast(movements, false)
      await expect(page.getByText('Colaboradores vinculados')).toBeVisible()

      await history.click()
      await expectFilterContrast(history, true)
      await expectFilterContrast(users, false)
      await expect(page.getByText('Historial de pagos SaaS')).toBeVisible()

      await movements.click()
      await expectFilterContrast(movements, true)
      await expect(page.getByText('Sin movimientos recientes en el tenant.')).toBeVisible()
    })

    test('agent task filters stay legible and filter the queue', async ({ page }) => {
      await page.goto('/admin/agent-tasks')
      const filters = page.getByRole('group', { name: 'Estado de las tareas' })
      const all = filters.getByRole('button', { name: 'Todas' })
      const pending = filters.getByRole('button', { name: 'Pendientes' })

      await expectFilterContrast(all, true)
      await expectFilterContrast(pending, false)
      await expect(page.getByRole('heading', { name: 'Revisar ficha' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Actualizar listado' })).toBeVisible()

      await pending.click()
      await expectFilterContrast(pending, true)
      await expectFilterContrast(all, false)
      await expect(page.getByRole('heading', { name: 'Revisar ficha' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Actualizar listado' })).toHaveCount(0)
    })

    test('campaign actions and navigation are legible', async ({ page }) => {
      await page.goto('/admin/email-campaigns')
      const sections = page.getByRole('navigation', { name: 'Secciones de campañas de email' })
      const catalog = sections.getByRole('link', { name: 'Catálogo' })
      const history = sections.getByRole('link', { name: 'Historial de envíos' })

      await expectTextContrast(page.getByRole('link', { name: 'Nueva campaña' }))
      await expectTextContrast(page.getByRole('link', { name: 'Ver campaña' }))
      await expectTextContrast(page.getByRole('button', { name: 'Enviar ahora' }))
      await expectTextContrast(page.getByRole('button', { name: 'Enviar pendientes' }))
      await expectTextContrast(catalog)
      await expectTextContrast(history)
      await expect(catalog).toHaveAttribute('aria-current', 'page')

      await history.click()
      await expect(page).toHaveURL(/\/admin\/email-campaigns\/history$/)
      await expect(history).toHaveAttribute('aria-current', 'page')
      await expectTextContrast(catalog)
      await expectTextContrast(history)
    })
  })
}
