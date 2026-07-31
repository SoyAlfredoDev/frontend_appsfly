import {
  DEFAULT_BUSINESS_TIMEZONE,
  getTodayBusinessDate as getTodayKey,
  resolveBusinessTimezone,
  toBusinessDateKey,
} from "./businessTime.js";

function getBusinessDateFromValue(dateValue, timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  return toBusinessDateKey(dateValue, timeZone) || null;
}

function getTodayBusinessDate(timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  return getTodayKey(timeZone);
}

function isSameBusinessDay(dateValue, timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  return getBusinessDateFromValue(dateValue, timeZone) === getTodayBusinessDate(timeZone);
}

function isSameBusinessMonth(dateValue, timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  const businessDate = getBusinessDateFromValue(dateValue, timeZone);
  const today = getTodayBusinessDate(timeZone);
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

export function filterSalesByDashboardView(sales, view, timeZoneOrBusiness = DEFAULT_BUSINESS_TIMEZONE) {
  const timeZone = resolveBusinessTimezone(timeZoneOrBusiness);
  if (!Array.isArray(sales)) return [];

  switch (view) {
    case "today":
      return sales.filter((sale) => isSameBusinessDay(sale.createdAt, timeZone));
    case "todayIncome":
      return sales.filter(
        (sale) =>
          isSameBusinessDay(sale.createdAt, timeZone) && (sale.saleTotalPayments ?? 0) > 0,
      );
    case "month":
      return sales.filter((sale) => isSameBusinessMonth(sale.createdAt, timeZone));
    case "pending":
      return sales.filter(
        (sale) =>
          isSameBusinessMonth(sale.createdAt, timeZone) && (sale.salePendingAmount ?? 0) > 0,
      );
    default:
      return sales;
  }
}
