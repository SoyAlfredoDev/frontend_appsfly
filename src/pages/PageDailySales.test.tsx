import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PageDailySales from './PageDailySales.jsx'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => children ?? null,
  AreaChart: ({ children }: { children?: ReactNode }) => children ?? null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

const axiosGet = vi.fn()
const axiosPost = vi.fn()
const getClosureStatus = vi.fn()
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

vi.mock('../api/axios.js', () => ({
  default: {
    get: (...args: unknown[]) => axiosGet(...args),
    post: (...args: unknown[]) => axiosPost(...args),
  },
}))

vi.mock('../api/dailySales.js', () => ({
  getClosureStatus: (...args: unknown[]) => getClosureStatus(...args),
  closeAllPendingClosures: vi.fn(),
}))

vi.mock('../context/ToastContext.jsx', () => ({
  useToast: () => toast,
}))

vi.mock('../context/ConfirmationContext.jsx', () => ({
  useConfirm: () => vi.fn(),
}))

vi.mock('../context/authContext.jsx', () => ({
  useAuth: () => ({ business: { businessTimezone: 'America/Santiago' } }),
}))

class ResizeObserverMock {
  private callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ contentRect: { width: 640, height: 240 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
    void target
  }

  unobserve() {}

  disconnect() {}
}

const openStatus = {
  blocked: false,
  error: null,
  fechaPendiente: null,
  fechasPendientes: [] as string[],
  message: null,
}

function closure(day: string, id: string) {
  return {
    dailySalesId: id,
    dailySalesDay: day,
    dailySalesNumberOfSales: 2,
    dailySalesTotalSales: 15000,
    dailySalesTotalIncome: 10000,
    dailySalesDetailIncome: { '0': 0, '1': 0, '2': 10000, '3': 0 },
    dailySalesExpectedCash: 10000,
    dailySalesCountedCash: 10000,
    dailySalesCashDifference: 0,
    createdAt: `${day}T15:00:00.000Z`,
  }
}

describe('PageDailySales', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    Element.prototype.getBoundingClientRect = () =>
      ({
        width: 640,
        height: 240,
        top: 0,
        left: 0,
        bottom: 240,
        right: 640,
        x: 0,
        y: 0,
        toJSON() {
          return {}
        },
      }) as DOMRect
    axiosGet.mockReset()
    axiosPost.mockReset()
    getClosureStatus.mockReset().mockResolvedValue({ data: openStatus })
    toast.success.mockReset()
    toast.error.mockReset()
    toast.info.mockReset()
  })

  it('keeps the history visible after a successful daily close', async () => {
    const user = userEvent.setup()
    axiosGet.mockResolvedValueOnce({
      data: [closure('2026-10-07', 'prev')],
    })
    axiosPost.mockResolvedValueOnce({ data: closure('2026-10-08', 'new') })
    axiosGet.mockResolvedValueOnce({
      data: [closure('2026-10-08', 'new'), closure('2026-10-07', 'prev')],
    })

    render(
      <MemoryRouter>
        <PageDailySales />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Cierres Diarios' })).toBeInTheDocument()
    expect(await screen.findByText(/7 de octubre de 2026/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Realizar Cierre Diario/i }))
    await user.type(screen.getByLabelText('Efectivo contado'), '10000')
    await user.click(screen.getByRole('button', { name: /Guardar cierre/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(screen.queryByText(/Arqueo de/i)).not.toBeInTheDocument()
      expect(screen.getByText(/8 de octubre de 2026/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Cierres Diarios' })).toBeInTheDocument()
    expect(screen.getByText(/7 de octubre de 2026/i)).toBeInTheDocument()
  })

  it('does not blank the page when a closure day is not text', async () => {
    axiosGet.mockResolvedValueOnce({
      data: [
        { ...closure('2026-10-07', 'prev'), dailySalesDay: { bad: true } },
        closure('2026-10-08', 'ok'),
      ],
    })

    render(
      <MemoryRouter>
        <PageDailySales />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Cierres Diarios' })).toBeInTheDocument()
    expect(await screen.findByText(/8 de octubre de 2026/i)).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('keeps the new closure visible when the reload payload is not a list', async () => {
    const user = userEvent.setup()
    axiosGet.mockResolvedValueOnce({ data: [closure('2026-10-07', 'prev')] })
    axiosPost.mockResolvedValueOnce({ data: closure('2026-10-08', 'new') })
    axiosGet.mockResolvedValueOnce({ data: { message: 'unexpected' } })

    render(
      <MemoryRouter>
        <PageDailySales />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/7 de octubre de 2026/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Realizar Cierre Diario/i }))
    await user.type(screen.getByLabelText('Efectivo contado'), '10000')
    await user.click(screen.getByRole('button', { name: /Guardar cierre/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(screen.queryByText(/Arqueo de/i)).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo leer el historial de cierres.',
      )
    })

    expect(screen.getByText(/8 de octubre de 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/7 de octubre de 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cierres Diarios' })).toBeInTheDocument()
  })
})
