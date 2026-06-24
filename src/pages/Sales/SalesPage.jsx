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

export default function SalesPage() {
  const [salesData, setSalesData] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryFilter, setDeliveryFilter] = useState(DELIVERY_FILTERS.ALL);
  const { business } = useAuth();

  const deliveryControlEnabled = useMemo(
    () => isDeliveryControlEnabled(business),
    [business],
  );

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await getSales();
      setSalesData(response.data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    if (!deliveryControlEnabled) return salesData;
    return filterSalesByDeliveryStatus(salesData, deliveryFilter);
  }, [salesData, deliveryControlEnabled, deliveryFilter]);

  return (
    <ExpensePageLayout
      title="Ventas"
      subtitle="Historial y gestión de ventas realizadas"
      actions={
        <button type="button" onClick={() => navigate("/sales/register")} className={PRIMARY_BTN}>
          <FaPlus /> Nueva Venta
        </button>
      }
    >
      <SalesTable
        data={filteredSales}
        isLoading={isLoading}
        emptyHint='Usa el botón "Nueva Venta" para registrar la primera.'
        showDeliveryColumn={deliveryControlEnabled}
        deliveryFilter={deliveryFilter}
        onDeliveryFilterChange={deliveryControlEnabled ? setDeliveryFilter : undefined}
      />
    </ExpensePageLayout>
  );
}
