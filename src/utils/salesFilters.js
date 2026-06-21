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
