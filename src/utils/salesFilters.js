function isSameDay(dateValue) {
  const d = new Date(dateValue);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isSameMonth(dateValue) {
  const d = new Date(dateValue);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
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
      return sales.filter((sale) => isSameDay(sale.createdAt));
    case "month":
      return sales.filter((sale) => isSameMonth(sale.createdAt));
    case "pending":
      return sales.filter(
        (sale) => isSameMonth(sale.createdAt) && (sale.salePendingAmount ?? 0) > 0
      );
    default:
      return sales;
  }
}
