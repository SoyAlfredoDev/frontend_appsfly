import { expect, test, type Page } from '@playwright/test'

async function mockBusiness(page: Page, businessType: 'general' | 'optics') {
  const businessId = `qa-${businessType}`
  const customer = { customerId: 'customer-a', customerFirstName: 'Ana', customerLastName: 'Pérez' }
  const sale = {
    saleId: 'sale-a',
    saleNumber: 'a00001',
    saleCustomerId: customer.customerId,
    createdAt: '2025-01-02T18:00:00.000Z',
    saleTotal: 30000,
    saleTotalPayments: 10000,
    salePendingAmount: 20000,
    customerPendingAmount: 20000,
    customer,
  }
  const paymentRows = [
    { paymentId: 'payment-1', paymentMethod: '2', paymentAmount: 10000, createdAt: sale.createdAt },
  ]
  await page.addInitScript(() => localStorage.setItem('token', 'qa-business-session'))
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '')
    let data: unknown = []
    if (path === '/verify') data = { id: 'qa-owner' }
    else if (path === '/users/isSuperAdmin') data = { isSuperAdmin: false }
    else if (path.startsWith('/users/')) data = { userId: 'qa-owner', userFirstName: 'Dueña' }
    else if (path === '/userBusiness')
      data = [{ userBusinessBusinessId: businessId, userBusinessRole: 'ADMIN' }]
    else if (path.startsWith('/subscriptions/'))
      data = [{ subscriptionStatus: 'ACTIVE', subscriptionEndDate: '2100-01-01' }]
    else if (path === `/business/${businessId}`)
      data = { businessId, businessName: 'Local QA', businessType, businessAllowCreditSales: true }
    else if (path === '/customers') data = [customer]
    else if (path === '/products')
      data = [
        {
          productId: 'product-a',
          productName: 'Cuaderno',
          productSKU: 'CUAD-1',
          productPrice: 12000,
          productPriceFixed: true,
          productStock: 2,
        },
      ]
    else if (path === '/dailySales/closure-status') data = { blocked: false }
    else if (path === '/sales/general' && route.request().method() === 'POST') {
      const input = route.request().postDataJSON()
      expect(input).toMatchObject({
        customerId: customer.customerId,
        documentType: 'RECEIPT',
        lines: [{ itemId: 'product-a', type: 'PRODUCT', quantity: 1, price: 12000 }],
        payments: [],
      })
      data = { sale: { saleId: input.saleId, saleNumber: 'a00002' } }
    } else if (path === '/inventory/summary')
      data = { totalSku: 1, totalUnits: 2, totalValuation: 20000 }
    else if (path === '/inventory/stock')
      data = [
        {
          productId: 'product-a',
          productName: 'Cuaderno',
          productSKU: 'CUAD-1',
          quantityOnHand: 2,
        },
      ]
    else if (path === '/inventory/movements')
      data = { rows: [], pagination: { total: 0, pages: 1 } }
    else if (path === '/sales/receivables') {
      expect(route.request().headers()['x-appsfly-business-id']).toBe(businessId)
      data = {
        rows: sale.salePendingAmount ? [sale] : [],
        totalPending: sale.salePendingAmount,
        pagination: { total: Number(sale.salePendingAmount > 0), pages: 1 },
      }
    } else if (path === '/sales/sale-a') data = sale
    else if (path === '/saleDetails/sale-a') data = []
    else if (path === '/payments/sale-a') data = paymentRows
    else if (path === '/payments' && route.request().method() === 'POST') {
      const input = route.request().postDataJSON()
      expect(input).toMatchObject({ saleId: sale.saleId, paymentMethod: '2', paymentAmount: 20000 })
      sale.saleTotalPayments += input.paymentAmount
      sale.salePendingAmount -= input.paymentAmount
      paymentRows.push({ ...input, createdAt: sale.createdAt })
      data = { payment: input }
    } else if (path === '/work-orders') {
      data = [
        {
          workOrderId: 'optics-order',
          workOrderNumber: 'OT-QA-1',
          workOrderStatus: 'PENDING',
          customer,
        },
      ]
    }
    await route.fulfill({ status: 200, json: data })
  })
}

test('negocio general muestra clientes, stock y cobranza de una venta anterior', async ({
  page,
}) => {
  await mockBusiness(page, 'general')
  await page.goto('/customers')
  await expect(page.getByText('Ana Pérez')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ventas', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Inventario', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Control de Inventario' })).toBeVisible()
  await expect(page.getByText('Cuaderno')).toBeVisible()

  await page.getByRole('link', { name: 'Cuentas por cobrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Cuentas por cobrar' })).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'Ana Pérez' })).toContainText('20.000')
  await page.getByRole('link', { name: 'Ver y abonar venta a00001' }).click()
  await page.getByRole('button', { name: 'Abonar', exact: true }).click()
  await page.getByRole('button', { name: 'Efectivo', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar Pago' }).click()
  await expect(page.getByRole('button', { name: 'Abonar', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Cuentas por cobrar', exact: true }).click()
  await expect(page.getByText('No hay ventas con saldo pendiente.')).toBeVisible()

  await page.goto('/work-orders')
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
})

test('una venta con saldo en Negocio general guarda sus líneas juntas', async ({ page }) => {
  await mockBusiness(page, 'general')
  await page.goto('/sales/register')
  await page
    .getByPlaceholder('Buscar por nombre, RUT, teléfono o correo...')
    .filter({ visible: true })
    .fill('Ana')
  await page.getByRole('button', { name: /Ana Pérez/ }).click()
  await page.locator('select:has(option[value="product-a"]):visible').selectOption('product-a')
  await page.getByRole('button', { name: /^Finalizar(?: venta)?$/ }).click()
  const saved = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/sales/general',
  )
  await page.getByRole('button', { name: 'Confirmar venta', exact: true }).click()
  expect((await saved).ok()).toBe(true)
  await expect(page.getByText('La venta se registró correctamente.')).toBeVisible()
})

test('óptica conserva su navegación y la consulta de órdenes de trabajo', async ({ page }) => {
  await mockBusiness(page, 'optics')
  await page.goto('/work-orders')
  await expect(page.getByRole('heading', { name: 'Órdenes de Trabajo', exact: true })).toBeVisible()
  await expect(page.getByText('OT-QA-1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pacientes' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cuentas por cobrar' })).toHaveCount(0)
  await page.goto('/sales/receivables')
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
})
