import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { getSales } from "../../api/sale.js";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaReceipt, FaMoneyBillWave } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import {
  ExpenseTableHead,
  ExpenseTableBody,
} from "../../components/ui/ExpenseTableElements.jsx";
import {
  PRIMARY_BTN,
  ACTION_VIEW,
} from "../../utils/expenseUiPatterns.js";

export default function SalesPage() {
  const [salesData, setSalesData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      header: "Fecha",
      accessorFn: (row) => row.saleDate ?? "",
      cell: (info) => (
        <span className="text-gray-600">{info.getValue()}</span>
      ),
    },
    {
      header: "Nro",
      accessorFn: (row) => row.saleNumber ?? "",
      cell: (info) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Cliente",
      accessorFn: (row) =>
        `${row.customer?.customerFirstName ?? ""} ${row.customer?.customerLastName ?? ""}`,
      cell: (info) => (
        <span className="text-gray-800 font-medium">{info.getValue()}</span>
      ),
    },
    {
      header: "Total",
      accessorFn: (row) => row.saleTotal ?? "",
      cell: ({ getValue }) => {
        const value = getValue();
        const formatted =
          typeof value === "number"
            ? value.toLocaleString("es-CL", { style: "currency", currency: "CLP" })
            : value;
        return <span className="text-primary font-semibold">{formatted}</span>;
      },
    },
    {
      header: "Pendiente",
      accessorFn: (row) => row.salePendingAmount ?? "",
      cell: ({ getValue }) => {
        const value = getValue();
        const formatted =
          typeof value === "number"
            ? value.toLocaleString("es-CL", { style: "currency", currency: "CLP" })
            : value;
        return value > 0 ? (
          <span className="text-red-500 font-semibold">{formatted}</span>
        ) : (
          <span className="text-gray-400 text-xs">Pagado</span>
        );
      },
    },
    {
      header: "Vendedor",
      accessorFn: (row) =>
        `${row.user?.userFirstName ?? ""} ${row.user?.userLastName ?? ""}`,
      cell: (info) => (
        <span className="text-gray-600">{info.getValue()}</span>
      ),
    },
    {
      header: "Comentario",
      accessorFn: (row) => row.saleComment ?? "",
      cell: (info) => (
        <span
          className="text-xs text-gray-400 italic truncate max-w-[150px] inline-block"
          title={info.getValue()}
        >
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            className={ACTION_VIEW}
            onClick={() => navigate(`/sales/view/${row.original.saleId}`)}
            title="Ver detalle"
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: salesData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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

  const filteredCount = table.getFilteredRowModel().rows.length;

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
      <ExpenseTableCard
        sectionTitle="Listado de ventas"
        recordCount={filteredCount}
        loading={isLoading}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Buscar por cliente, número..."
      >
        <ExpenseTableScroll>
          <table className="w-full text-left border-collapse">
            <ExpenseTableHead table={table} centerColumns={["actions"]} />
            <ExpenseTableBody
              table={table}
              isLoading={isLoading}
              loadingRow={
                <ExpenseTableLoading colSpan={columns.length} message="Cargando ventas..." />
              }
              emptyRow={
                <ExpenseTableEmpty
                  colSpan={columns.length}
                  icon={<FaMoneyBillWave className="text-4xl text-gray-300" />}
                  title={
                    globalFilter
                      ? "No se encontraron ventas con ese criterio."
                      : "No hay ventas registradas."
                  }
                  hint={
                    !globalFilter
                      ? 'Usa el botón "Nueva Venta" para registrar la primera.'
                      : undefined
                  }
                />
              }
            />
          </table>
        </ExpenseTableScroll>
      </ExpenseTableCard>
    </ExpensePageLayout>
  );
}
