import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ScheduledSubscriptionCard from './ScheduledSubscriptionCard'
import { SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE } from '../../constants/subscriptionCancel.js'
const cancel = vi.hoisted(() => vi.fn())
vi.mock('../../api/subscriptionBilling.js', () => ({ cancelBusinessSubscriptionRequest: cancel }))
const pending = {
  planName: 'Pro',
  firstChargeAt: '2026-12-14T15:00:00Z',
  authorized: true,
  checkoutUrl: null,
  amount: 47588,
  currency: 'CLP',
  canCancel: true,
}
describe('future subscription', () => {
  it('displays the first charge date and distinguishes authorization from payment', () => {
    render(<ScheduledSubscriptionCard pending={pending} businessId="a" onChange={vi.fn()} />)
    expect(screen.getByText(/14 de diciembre de 2026/)).toBeInTheDocument()
    expect(screen.getByText(/no confirma el pago/)).toBeInTheDocument()
  })
  it('requires explicit cancellation and reloads the billing status', async () => {
    cancel.mockResolvedValue({})
    const changed = vi.fn()
    render(<ScheduledSubscriptionCard pending={pending} businessId="a" onChange={changed} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar contratación pendiente' }))
    expect(screen.getByRole('button', { name: 'Confirmar cancelación' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Escribe/), {
      target: { value: SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1))
  })
})
