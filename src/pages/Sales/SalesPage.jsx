import { useEffect, useState } from "react";
import { getSales } from "../../api/sale.js";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import SalesTable from "../../components/sales/SalesTable.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function SalesPage() {
  const [salesData, setSalesData] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
        data={salesData}
        isLoading={isLoading}
        emptyHint='Usa el botón "Nueva Venta" para registrar la primera.'
      />
    </ExpensePageLayout>
  );
}
