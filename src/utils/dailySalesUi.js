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

/** YYYY-MM-DD from a date-only string, an ISO datetime, or timestamp text. */
export function closureDayKey(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return value.toISOString().slice(0, 10);
  }
  const match = String(value ?? '')
    .trim()
    .match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? '';
}

export function formatClosureDate(dateStr) {
  const key = closureDayKey(dateStr);
  if (!key) return '—';
  const [year, month, day] = key.split('-').map(Number);
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

export function getCurrentMonthKey(date = new Date(), timeZone) {
  if (timeZone) {
    const key = new Date(date).toLocaleDateString("en-CA", { timeZone });
    return key.slice(0, 7);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isDailySalesDayInCurrentMonth(dailySalesDay, date = new Date(), timeZone) {
  const key = closureDayKey(dailySalesDay);
  if (!key) return false;
  return key.startsWith(getCurrentMonthKey(date, timeZone));
}

/** List payloads that are not an array used to crash the page during render. */
export function closureRowsFromPayload(payload) {
  if (!Array.isArray(payload)) return null;
  return payload.filter((row) => row && typeof row === 'object');
}
