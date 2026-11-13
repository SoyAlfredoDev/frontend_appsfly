import { expect, test, type Page } from '@playwright/test'

async function mockBusiness(page: Page, businessType: 'general' | 'optics' | 'clothing_store') {
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
  const clothingStock = ['M', 'L'].map((talla, index) => ({
    productId: `pol-${talla}`,
    productName: `Polera · Talla ${talla} · Color negro`,
    modelName: 'Polera',
    productSKU: `POL-${talla}`,
    productPrice: 12000,
    productPriceFixed: true,
    productStock: index + 2,
    quantityOnHand: index + 2,
    variantOptions: { talla, color: 'negro' },
  }))
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
    else if (path === '/categories')
      data = [{ categoryId: 'ropa', categoryName: 'Ropa', allowedFor: 'PRODUCTS' }]
    else if (path === '/products')
      data =
        businessType === 'clothing_store'
          ? clothingStock
          : [
              {
                productId: 'product-a',
                productName: 'Cuaderno',
                productSKU: 'CUAD-1',
                productPrice: 12000,
                productPriceFixed: true,
                productStock: 2,
              },
            ]
    else if (path === '/products/variants/bulk' && route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toMatchObject({
        parent: { name: 'Polera', sku: 'POL', categoryId: 'ropa', price: 12000 },
        variants: [
          { sku: 'POL-M', options: { talla: 'M', color: 'Negro' }, initialStock: 2 },
          { sku: 'POL-L', options: { talla: 'L', color: 'Negro' }, initialStock: 3 },
        ],
      })
      data = { createdCount: 2, skippedCount: 0 }
    } else if (path === '/dailySales/closure-status') data = { blocked: false }
    else if (path === '/sales/general' && route.request().method() === 'POST') {
      const input = route.request().postDataJSON()
      const itemId = businessType === 'clothing_store' ? 'pol-M' : 'product-a'
      expect(input).toMatchObject({
        customerId: customer.customerId,
        documentType: 'RECEIPT',
        lines: [{ itemId, type: 'PRODUCT', quantity: 1, price: 12000 }],
        payments: [],
      })
      if (businessType === 'clothing_store') {
        clothingStock[0].quantityOnHand -= 1
        clothingStock[0].productStock -= 1
      }
      data = { sale: { saleId: input.saleId, saleNumber: 'a00002' } }
    } else if (path === '/inventory/summary')
      data = { totalSku: 1, totalUnits: 2, totalValuation: 20000 }
    else if (path === '/inventory/stock')
      data =
        businessType === 'clothing_store'
          ? clothingStock
          : [
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

test('tienda de ropa registra y vende la talla seleccionada y filtra su stock', async ({
  page,
}) => {
  await mockBusiness(page, 'clothing_store')
  await page.goto('/products_services')
  await page.getByRole('link', { name: 'Nuevo modelo con variantes' }).click()
  await expect(page.getByRole('heading', { name: 'Modelo de ropa con variantes' })).toBeVisible()
  await page.getByLabel('Nombre del modelo').fill('Polera')
  await page.getByLabel('SKU del modelo').fill('POL')
  await page.getByLabel('Precio unitario (CLP)').fill('12000')
  await page.getByRole('button', { name: 'Agregar variante' }).click()
  for (const [number, talla, stock] of [
    [1, 'M', '2'],
    [2, 'L', '3'],
  ] as const) {
    const group = page.getByRole('group', { name: `Variante ${number}` })
    await group.getByLabel('Talla', { exact: true }).fill(talla)
    await group.getByLabel('Color', { exact: true }).fill('Negro')
    await group.getByLabel('SKU de la variante').fill(`POL-${talla}`)
    await group.getByLabel('Stock inicial').fill(stock)
  }
  await page.getByRole('button', { name: 'Guardar modelo' }).click()
  await expect(
    page.getByRole('heading', { name: 'Productos y Servicios', exact: true }),
  ).toBeVisible()

  await page.goto('/sales/register')
  await page
    .getByPlaceholder('Buscar por nombre, RUT, teléfono o correo...')
    .filter({ visible: true })
    .fill('Ana')
  await page.getByRole('button', { name: /Ana Pérez/ }).click()
  await page.locator('select:has(option[value="pol-M"]):visible').selectOption('pol-M')
  await page.getByRole('button', { name: /^Finalizar(?: venta)?$/ }).click()
  await page.getByRole('button', { name: 'Confirmar venta', exact: true }).click()
  await expect(page.getByText('La venta se registró correctamente.')).toBeVisible()

  await page.goto('/inventory')
  await page.getByRole('combobox', { name: 'Talla', exact: true }).selectOption('M')
  await page.getByRole('combobox', { name: 'Color', exact: true }).selectOption('negro')
  const medium = page.getByRole('row').filter({ hasText: 'POL-M' })
  await expect(medium.getByRole('cell', { name: '1', exact: true })).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'POL-L' })).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Talla', exact: true }).selectOption('L')
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'POL-L' })
      .getByRole('cell', { name: '3', exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Cuentas por cobrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Cuentas por cobrar', exact: true })).toBeVisible()
})

test('Óptica cierra un día pendiente con una sola acción y abre su detalle', async ({ page }) => {
  await mockBusiness(page, 'optics')
  let saved = false
  const closure = {
    dailySalesId: 'cierre-qa',
    dailySalesDay: '2026-11-12',
    dailySalesNumberOfSales: 3,
    dailySalesTotalSales: 170000,
    dailySalesTotalIncome: 170000,
    dailySalesExpectedCash: 22000,
    dailySalesCountedCash: 22000,
    dailySalesCashDifference: 0,
  }
  await page.route(/\/api\/dailySales(?:\/|$)/, async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname.endsWith('/closure-status')) {
      return route.fulfill({
        json: saved
          ? { blocked: false, fechasPendientes: [] }
          : {
              blocked: true,
              error: 'BLOQUEO_CIERRE_PENDIENTE',
              fechaPendiente: closure.dailySalesDay,
              fechasPendientes: [closure.dailySalesDay],
            },
      })
    }
    if (pathname.endsWith('/detail')) {
      return route.fulfill({
        json: {
          closure,
          sales: [],
          payments: [],
          hourlySales: [],
          totals: { sales: 170000, income: 170000, pending: 0, transactions: 3 },
        },
      })
    }
    if (route.request().method() === 'POST') {
      expect(pathname).toBe('/api/dailySales')
      expect(route.request().postDataJSON()).toEqual({
        dailySalesDay: closure.dailySalesDay,
        countedCash: 22000,
      })
      saved = true
      return route.fulfill({ status: 201, json: closure })
    }
    return route.fulfill({ json: saved ? [closure] : [] })
  })
  await page.goto('/sales/dailySales')
  await expect(page.getByText('Cierres pendientes detectados')).toBeVisible()
  await expect(page.getByRole('button', { name: /cerrar|cierre diario/i })).toHaveCount(1)
  await page.getByRole('button', { name: 'Realizar cierre diario' }).click()
  await page.getByLabel('Efectivo contado').fill('22000')
  await page.getByRole('button', { name: 'Guardar cierre' }).click()
  await expect(page.getByText('Cierre realizado', { exact: true })).toBeVisible()
  await expect(page.getByText('Cierres pendientes detectados')).toHaveCount(0)
  await page.getByRole('link', { name: 'Ver detalle completo' }).click()
  await expect(page.getByText('Efectivo esperado', { exact: true })).toBeVisible()
})
