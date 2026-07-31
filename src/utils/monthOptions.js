import {
  DEFAULT_BUSINESS_TIMEZONE,
  getTodayBusinessDate,
  resolveBusinessTimezone,
} from "./businessTime.js";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const getCurrentMonthYear = (timeZoneOrBusiness = DEFAULT_BUSINESS_TIMEZONE) => {
  const today = getTodayBusinessDate(resolveBusinessTimezone(timeZoneOrBusiness));
  const [year, month] = today.split("-").map(Number);
  return { month, year };
};

export const toMonthYearKey = (month, year) => `${year}-${month}`;

export const parseMonthYearKey = (key) => {
  const [year, month] = key.split("-").map(Number);
  return { month, year };
};

export const formatMonthYearLabel = (month, year) => {
  const name = MONTH_NAMES[month - 1] ?? "";
  return `${name} ${year}`;
};

export const generateMonthOptions = (
  count = 24,
  timeZoneOrBusiness = DEFAULT_BUSINESS_TIMEZONE,
) => {
  const options = [];
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear(
    timeZoneOrBusiness,
  );

  for (let i = 0; i < count; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }

    options.push({
      value: toMonthYearKey(month, year),
      month,
      year,
      label: formatMonthYearLabel(month, year),
    });
  }

  return options;
};

export const PAYMENT_METHOD_LABELS = {
  0: "Tarjeta de Crédito",
  1: "Tarjeta Débito",
  2: "Efectivo",
  3: "Transferencia",
};

export const getPaymentMethodLabel = (method) =>
  PAYMENT_METHOD_LABELS[String(method)] ?? "No especificado";
