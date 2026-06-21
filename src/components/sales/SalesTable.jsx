import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { FaEye, FaMoneyBillWave } from "react-icons/fa";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../ui/ExpenseTableCard.jsx";
import {
  ExpenseTableHead,
  ExpenseTableBody,
} from "../ui/ExpenseTableElements.jsx";
import { ACTION_VIEW } from "../../utils/expenseUiPatterns.js";

function buildSalesColumns(navigate) {
  return [
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
}

export default function SalesTable({
  data = [],
  isLoading = false,
  sectionTitle = "Listado de ventas",
  searchPlaceholder = "Buscar por cliente, número...",
  emptyTitle = "No hay ventas registradas.",
  emptyHint,
  showSearch = true,
  className = "",
}) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columns = useMemo(() => buildSalesColumns(navigate), [navigate]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <ExpenseTableCard
      sectionTitle={sectionTitle}
      recordCount={filteredCount}
      loading={isLoading}
      searchValue={globalFilter}
      onSearchChange={showSearch ? setGlobalFilter : undefined}
      searchPlaceholder={searchPlaceholder}
      showSearch={showSearch}
      className={className}
    >
      <ExpenseTableScroll>
        <table className="w-full text-left border-collapse">
          <ExpenseTableHead table={table} centerColumns={["actions"]} />
          <ExpenseTableBody
            table={table}
            isLoading={isLoading}
            loadingRow={
              <ExpenseTableLoading
                colSpan={columns.length}
                message="Cargando ventas..."
              />
            }
            emptyRow={
              <ExpenseTableEmpty
                colSpan={columns.length}
                icon={<FaMoneyBillWave className="text-4xl text-gray-300" />}
                title={
                  globalFilter
                    ? "No se encontraron ventas con ese criterio."
                    : emptyTitle
                }
                hint={!globalFilter ? emptyHint : undefined}
              />
            }
          />
        </table>
      </ExpenseTableScroll>
    </ExpenseTableCard>
  );
}
