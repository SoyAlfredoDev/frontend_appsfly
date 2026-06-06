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

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
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

export const generateMonthOptions = (count = 24) => {
  const options = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

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
