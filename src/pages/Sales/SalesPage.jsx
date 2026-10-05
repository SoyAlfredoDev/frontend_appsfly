import { useEffect, useMemo, useState } from "react";
import { getSales } from "../../api/sale.js";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import SalesTable from "../../components/sales/SalesTable.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";
import { useAuth } from "../../context/authContext.jsx";
import { isDeliveryControlEnabled } from "../../utils/businessReceiptSettings.js";
import {
  DELIVERY_FILTERS,
  filterSalesByDeliveryStatus,
} from "../../utils/salesFilters.js";
import { unwrapListPayload } from "../../utils/listPayload.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";

export default function SalesPage() {
  const [salesData, setSalesData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 50 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryFilter, setDeliveryFilter] = useState(DELIVERY_FILTERS.ALL);
  const { business } = useAuth();

  const deliveryControlEnabled = useMemo(
    () => isDeliveryControlEnabled(business),
    [business],
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, deliveryFilter]);

  useEffect(() => {
    let cancelled = false;
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const response = await getSales({
          page,
          limit: 50,
          q: debouncedSearch.trim() || undefined,
          deliveryStatus:
            deliveryControlEnabled && deliveryFilter !== DELIVERY_FILTERS.ALL
              ? deliveryFilter
              : undefined,
        });
        if (cancelled) return;
        const { rows, pagination: paging } = unwrapListPayload(response.data);
        setSalesData(rows);
        if (paging) setPagination(paging);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSales();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, deliveryFilter, deliveryControlEnabled]);

  const filteredSales = useMemo(() => {
    // Delivery already filtered server-side when enabled; keep client fallback for safety
    if (!deliveryControlEnabled) return salesData;
    return filterSalesByDeliveryStatus(salesData, deliveryFilter);
  }, [salesData, deliveryControlEnabled, deliveryFilter]);

  return (
    <ExpensePageLayout
      title="Ventas"
      subtitle="Historial y gestión de ventas realizadas"
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate("/sales/quick")} className={PRIMARY_BTN}>
            <FaPlus /> Caja rápida
          </button>
          <button
            type="button"
            onClick={() => navigate("/sales/register")}
            className={`${PRIMARY_BTN} bg-white !text-primary border border-primary`}
          >
            Nueva Venta
          </button>
        </div>
      }
    >
      <SalesTable
        data={filteredSales}
        isLoading={isLoading}
        emptyHint='Usa el botón "Nueva Venta" para registrar la primera.'
        showDeliveryColumn={deliveryControlEnabled}
        deliveryFilter={deliveryFilter}
        onDeliveryFilterChange={deliveryControlEnabled ? setDeliveryFilter : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        pagination={pagination}
        onPageChange={setPage}
      />
    </ExpensePageLayout>
  );
}
