const BUSINESS_TIMEZONE = "America/Santiago";

function getBusinessDateFromValue(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", { timeZone: BUSINESS_TIMEZONE });
}

function getTodayBusinessDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: BUSINESS_TIMEZONE });
}

function isSameBusinessDay(dateValue) {
  return getBusinessDateFromValue(dateValue) === getTodayBusinessDate();
}

function isSameBusinessMonth(dateValue) {
  const businessDate = getBusinessDateFromValue(dateValue);
  const today = getTodayBusinessDate();
  return Boolean(businessDate && businessDate.slice(0, 7) === today.slice(0, 7));
}

export const DELIVERY_FILTERS = {
    ALL: "all",
    PENDING: "pending",
    DELIVERED: "delivered",
};

export function filterSalesByDeliveryStatus(sales, filter) {
    if (!Array.isArray(sales) || !filter || filter === DELIVERY_FILTERS.ALL) {
        return sales ?? [];
    }

    if (filter === DELIVERY_FILTERS.PENDING) {
        return sales.filter((sale) => sale.saleDeliveryStatus === "PENDING");
    }

    if (filter === DELIVERY_FILTERS.DELIVERED) {
        return sales.filter((sale) => sale.saleDeliveryStatus === "DELIVERED");
    }

    return sales;
}

export function getDeliveryStatusLabel(status) {
    if (status === "PENDING") return "Pendiente de entrega";
    if (status === "DELIVERED") return "Entregado";
    return null;
}

export function filterSalesByDashboardView(sales, view) {
  if (!Array.isArray(sales)) return [];

  switch (view) {
    case "today":
      return sales.filter((sale) => isSameBusinessDay(sale.createdAt));
    case "todayIncome":
      return sales.filter(
        (sale) =>
          isSameBusinessDay(sale.createdAt) && (sale.saleTotalPayments ?? 0) > 0,
      );
    case "month":
      return sales.filter((sale) => isSameBusinessMonth(sale.createdAt));
    case "pending":
      return sales.filter(
        (sale) =>
          isSameBusinessMonth(sale.createdAt) && (sale.salePendingAmount ?? 0) > 0,
      );
    default:
      return sales;
  }
}
