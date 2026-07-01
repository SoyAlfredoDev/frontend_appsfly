import { useEffect, useMemo, useState } from "react";
import { getQuotations } from "../../api/quotation.js";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import QuotationsTable from "../../components/quotations/QuotationsTable.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function QuotationsPage() {
  const [quotationsData, setQuotationsData] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await getQuotations();
      setQuotationsData(response.data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuotations = useMemo(() => {
    if (statusFilter === "all") return quotationsData;
    return quotationsData.filter((q) => q.quotationStatus === statusFilter);
  }, [quotationsData, statusFilter]);

  return (
    <ExpensePageLayout
      title="Cotizaciones"
      subtitle="Historial y gestión de cotizaciones generadas"
      actions={
        <button type="button" onClick={() => navigate("/quotations/register")} className={PRIMARY_BTN}>
          <FaPlus /> Nueva Cotización
        </button>
      }
    >
      <QuotationsTable
        data={filteredQuotations}
        isLoading={isLoading}
        emptyHint='Usa el botón "Nueva Cotización" para registrar la primera.'
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </ExpensePageLayout>
  );
}
