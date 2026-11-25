import { expect, test, type Page, type Route } from '@playwright/test'

const businessId = 'qa-aurora'
const publicPath = '/registarcita/' + businessId
const appointmentApi = '/api/public/appointments/' + businessId
const business = { name: 'Óptica Aurora', phone: '+56900000000' }
const timezone = 'America/Santiago'
const token = 'qa-private-appointment-token'
const occupied = {
  startsAt: '2026-11-26T14:00:00.000Z',
  endsAt: '2026-11-26T14:30:00.000Z',
  dateKey: '2026-11-26',
  label: '11:00',
}
const alternative = {
  startsAt: '2026-11-26T14:30:00.000Z',
  endsAt: '2026-11-26T15:00:00.000Z',
  dateKey: '2026-11-26',
  label: '11:30',
}
const nextMonth = {
  startsAt: '2026-12-01T13:00:00.000Z',
  endsAt: '2026-12-01T13:30:00.000Z',
  dateKey: '2026-12-01',
  label: '10:00',
}
const requestDetails = { firstName: 'Ana', lastName: 'Demo', phoneNumber: '900000000' }

async function reply(route: Route, json: unknown, status = 200) {
  const origin = route.request().headers().origin
  const headers = {
    ...(origin ? { 'access-control-allow-origin': origin } : {}),
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type,authorization,x-business-id',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
  }
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers })
    return
  }
  await route.fulfill({ status, headers, json })
}

async function fillDetails(page: Page) {
  await page.getByLabel('Nombre', { exact: true }).fill(requestDetails.firstName)
  await page.getByLabel('Apellido', { exact: true }).fill(requestDetails.lastName)
  await page.getByLabel(/Celular/).fill(requestDetails.phoneNumber)
  await page.getByRole('checkbox', { name: /Autorizo/ }).check()
}

test.describe('Reserva de citas desde el celular', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'es-CL',
    timezoneId: 'America/Los_Angeles',
  })

  test('ofrece horas arriba, conserva los datos tras perder un cupo y permite gestionar la solicitud', async ({
    page,
  }) => {
    let attempts = 0
    let slotReads = 0
    let status = 'PENDING'
    const appointment = {
      appointmentId: 'demo-a',
      startsAt: alternative.startsAt,
      endsAt: alternative.endsAt,
    }
    await page.route(new RegExp(appointmentApi + '(?:/|$)'), async (route) => {
      const path = new URL(route.request().url()).pathname
      const method = route.request().method()
      if (method === 'OPTIONS') return reply(route, {})
      if (path.endsWith('/slots')) {
        slotReads++
        if (attempts && slotReads === 2) {
          return reply(route, { message: 'No se pudieron cargar los horarios.' }, 503)
        }
        return reply(route, {
          timezone,
          slots: attempts ? [alternative, nextMonth] : [occupied, alternative, nextMonth],
        })
      }
      if (path.endsWith('/manage')) {
        expect(route.request().headers().authorization).toBe('Bearer ' + token)
        if (method === 'PATCH') {
          expect(route.request().postDataJSON()).toEqual({ action: 'cancel' })
          status = 'CANCELLED'
        }
        return reply(route, {
          appointment: { ...appointment, status },
          timezone,
          business,
          location: null,
          canCancel: status === 'PENDING',
          canReschedule: status === 'PENDING',
        })
      }
      if (method === 'POST') {
        attempts++
        const body = route.request().postDataJSON()
        expect(body).toMatchObject({ ...requestDetails, contactConsent: true })
        if (attempts === 1) {
          expect(body.startsAt).toBe(occupied.startsAt)
          return reply(route, { code: 'SLOT_UNAVAILABLE', message: 'El horario ya se ocupó.' }, 409)
        }
        expect(body.startsAt).toBe(alternative.startsAt)
        return reply(
          route,
          { appointment: { ...appointment, status }, timezone, managementToken: token },
          201,
        )
      }
      return reply(route, {
        available: true,
        business,
        timezone,
        customerNotificationsEnabled: true,
        emailRequired: false,
        slotDurationMinutes: 30,
        galleryImageUrls: ['/booking-reception.jpg'],
        location: null,
      })
    })

    await page.goto(publicPath)
    const earliest = page.getByRole('button', { name: '11:00', exact: true })
    await expect(earliest).toBeInViewport()
    await earliest.click()
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await fillDetails(page)
    await page.getByRole('button', { name: 'Solicitar cita', exact: true }).click()

    await expect(page.getByText(/El horario ya se ocupó/).first()).toBeVisible()
    await page.getByRole('button', { name: 'Reintentar', exact: true }).click()
    await page.getByRole('button', { name: '11:30', exact: true }).click()
    await page.getByRole('button', { name: 'Usar esta hora', exact: true }).click()
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue(requestDetails.firstName)
    await expect(page.getByLabel(/Celular/)).toHaveValue(/900000000/)
    await page.getByRole('button', { name: 'Solicitar cita', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible()
    await expect(page.getByText(/Pendiente de confirmación/).first()).toBeVisible()
    await expect(page.getByText(/11:30/).first()).toBeVisible()
    expect(attempts).toBe(2)

    await page.getByRole('link', { name: 'Gestionar solicitud' }).click()
    await expect(page.getByRole('heading', { name: 'Tu cita' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar cita', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar cancelación', exact: true }).click()
    await expect(page.getByText(/Cita cancelada/i).first()).toBeVisible()
  })

  test('diferencia la falta de horas de un error de carga', async ({ page }) => {
    await page.route(new RegExp(appointmentApi + '(?:/|$)'), (route) => {
      if (new URL(route.request().url()).pathname.endsWith('/slots')) {
        return reply(route, { timezone, slots: [] })
      }
      return reply(route, { available: true, business, timezone, slotDurationMinutes: 30 })
    })
    await page.goto(publicPath)
    await expect(page.getByText(/No hay (horas|horarios) disponibles/).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Contactar al negocio/ })).toBeVisible()
  })
})

test('mantiene el día y sus horas sincronizados al cambiar de mes', async ({ page }) => {
  await page.route(new RegExp(appointmentApi + '(?:/|$)'), (route) => {
    if (new URL(route.request().url()).pathname.endsWith('/slots')) {
      return reply(route, { timezone, slots: [occupied, nextMonth] })
    }
    return reply(route, { available: true, business, timezone, slotDurationMinutes: 30 })
  })
  await page.goto(publicPath)
  await page.getByRole('button', { name: 'Ver calendario', exact: true }).click()
  await page.getByRole('button', { name: 'Mes siguiente', exact: true }).click()
  await expect(page.getByRole('button', { name: '11:00', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '10:00', exact: true })).toBeVisible()
})

test('el negocio distingue pendientes de hoy y puede previsualizar su enlace', async ({ page }) => {
  const settings = {
    appointmentsEnabled: true,
    slotDurationMinutes: 30,
    maxConcurrentPerSlot: 1,
    maxDaysAhead: 30,
    customerNotificationsEnabled: false,
    weeklyAvailability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00' }],
    publicLink: new URL(publicPath, test.info().project.use.baseURL).href,
    timezone,
  }
  await page.addInitScript(() => localStorage.setItem('token', 'qa-business-session'))
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const path = new URL(route.request().url()).pathname.slice(4)
      let response: unknown = []
      if (path === '/verify') response = { id: 'qa-owner' }
      else if (path === '/users/isSuperAdmin') response = { isSuperAdmin: false }
      else if (path.startsWith('/users/')) response = { userId: 'qa-owner', userFirstName: 'Dueña' }
      else if (path === '/userBusiness') {
        response = [{ userBusinessBusinessId: businessId, userBusinessRole: 'ADMIN' }]
      } else if (path.startsWith('/subscriptions/')) {
        response = [
          {
            subscriptionPlanId: 'P006',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2100-01-01',
          },
        ]
      } else if (path === '/business/' + businessId) {
        response = { businessId, businessName: business.name, businessType: 'optics' }
      } else if (path === '/appointments/settings') {
        response = { settings }
      } else if (path === '/appointments') {
        const today = new Date().toISOString()
        response = {
          appointments: [
            {
              appointmentId: 'pending',
              firstName: 'Ana',
              lastName: 'Pendiente',
              status: 'PENDING',
              startsAt: '2099-11-26T14:00:00.000Z',
            },
            {
              appointmentId: 'confirmed',
              firstName: 'Laura',
              lastName: 'Confirmada',
              status: 'CONFIRMED',
              startsAt: today,
            },
          ],
        }
      }
      return reply(route, response)
    },
  )
  await page.goto('/appointments')
  const body = page.getByRole('main')
  await expect(
    body.getByRole('heading', { name: 'Solicitudes pendientes', exact: true }),
  ).toBeVisible()
  await expect(body.getByRole('heading', { name: 'Citas de hoy', exact: true })).toBeVisible()
  await body.getByRole('button', { name: 'Configuración', exact: true }).click()
  await expect(body.getByRole('link', { name: 'Vista previa' })).toHaveAttribute(
    'href',
    settings.publicLink,
  )
  await expect(body.getByRole('button', { name: 'Copiar enlace' })).toBeEnabled()
})
