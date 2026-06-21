/** Métodos de pago — alineado a RegisterPayments.jsx */
export const DAILY_SALE_PAYMENT_METHODS = [
  { id: '0', label: 'Tarjeta Débito', color: '#094fd1', bg: 'bg-secondary/10', text: 'text-secondary' },
  { id: '1', label: 'Tarjeta Crédito', color: '#8b5cf6', bg: 'bg-purple-100', text: 'text-purple-700' },
  { id: '2', label: 'Efectivo', color: '#01c676', bg: 'bg-primary/10', text: 'text-primary' },
  { id: '3', label: 'Transferencia', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
];

export function getDailySalePaymentLabel(methodId) {
  return DAILY_SALE_PAYMENT_METHODS.find((m) => m.id === String(methodId))?.label ?? 'Otro';
}

export function formatClosureDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function parseDetailIncome(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isDailySalesDayInCurrentMonth(dailySalesDay, date = new Date()) {
  if (!dailySalesDay) return false;
  return dailySalesDay.startsWith(getCurrentMonthKey(date));
}
