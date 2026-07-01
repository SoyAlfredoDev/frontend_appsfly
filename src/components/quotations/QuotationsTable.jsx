import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { FaEye, FaFileAlt } from "react-icons/fa";
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
import QuotationStatusBadge from "./QuotationStatusBadge.jsx";

function buildQuotationsColumns(navigate) {
  const columns = [
    {
      header: "Fecha",
      accessorFn: (row) => row.quotationDate ?? "",
      cell: (info) => (
        <span className="text-gray-600">{info.getValue()}</span>
      ),
    },
    {
      header: "Nro",
      accessorFn: (row) => row.quotationNumber ?? "",
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
      accessorFn: (row) => row.quotationTotal ?? 0,
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
      header: "Estado",
      accessorFn: (row) => row.quotationStatus ?? "",
      cell: ({ getValue }) => {
        const status = getValue();
        return <QuotationStatusBadge status={status} />;
      },
    },
    {
      header: "Creado por",
      accessorFn: (row) =>
        `${row.user?.userFirstName ?? ""} ${row.user?.userLastName ?? ""}`,
      cell: (info) => (
        <span className="text-gray-600">{info.getValue()}</span>
      ),
    },
    {
      header: "Comentario",
      accessorFn: (row) => row.quotationComment ?? "",
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
            onClick={() => navigate(`/quotations/view/${row.original.quotationId}`)}
            title="Ver detalle"
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  return columns;
}

const STATUS_FILTER_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: "DRAFT", label: "Borradores" },
  { id: "SENT", label: "Enviados" },
  { id: "ACCEPTED", label: "Aceptados" },
  { id: "EXPIRED", label: "Expirados" },
];

export default function QuotationsTable({
  data = [],
  isLoading = false,
  sectionTitle = "Listado de cotizaciones",
  searchPlaceholder = "Buscar por cliente, número...",
  emptyTitle = "No hay cotizaciones registradas.",
  emptyHint,
  showSearch = true,
  statusFilter = "all",
  onStatusFilterChange,
  className = "",
}) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columns = useMemo(
    () => buildQuotationsColumns(navigate),
    [navigate],
  );

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

  const statusFilterToolbar = onStatusFilterChange ? (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_FILTER_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onStatusFilterChange(option.id)}
          className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
            statusFilter === option.id
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <ExpenseTableCard
      sectionTitle={sectionTitle}
      recordCount={filteredCount}
      loading={isLoading}
      searchValue={globalFilter}
      onSearchChange={showSearch ? setGlobalFilter : undefined}
      searchPlaceholder={searchPlaceholder}
      showSearch={showSearch}
      toolbarExtra={statusFilterToolbar}
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
                message="Cargando cotizaciones..."
              />
            }
            emptyRow={
              <ExpenseTableEmpty
                colSpan={columns.length}
                icon={<FaFileAlt className="text-4xl text-gray-300" />}
                title={
                  globalFilter || statusFilter !== "all"
                    ? "No se encontraron cotizaciones con ese criterio."
                    : emptyTitle
                }
                hint={!globalFilter && statusFilter === "all" ? emptyHint : undefined}
              />
            }
          />
        </table>
      </ExpenseTableScroll>
    </ExpenseTableCard>
  );
}
