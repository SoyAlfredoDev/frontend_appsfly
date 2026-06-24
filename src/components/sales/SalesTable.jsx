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
import SaleDeliveryBadge from "./SaleDeliveryBadge.jsx";

function buildSalesColumns(navigate, showDeliveryColumn) {
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
  ];

  if (showDeliveryColumn) {
    columns.push({
      header: "Entrega",
      accessorFn: (row) => row.saleDeliveryStatus ?? "",
      cell: ({ getValue }) => {
        const status = getValue();
        if (!status) {
          return <span className="text-gray-300 text-xs">—</span>;
        }
        return <SaleDeliveryBadge status={status} />;
      },
    });
  }

  columns.push(
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
  );

  return columns;
}

const DELIVERY_FILTER_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes de entrega" },
  { id: "delivered", label: "Entregados" },
];

export default function SalesTable({
  data = [],
  isLoading = false,
  sectionTitle = "Listado de ventas",
  searchPlaceholder = "Buscar por cliente, número...",
  emptyTitle = "No hay ventas registradas.",
  emptyHint,
  showSearch = true,
  showDeliveryColumn = false,
  deliveryFilter = "all",
  onDeliveryFilterChange,
  className = "",
}) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columns = useMemo(
    () => buildSalesColumns(navigate, showDeliveryColumn),
    [navigate, showDeliveryColumn],
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

  const deliveryFilterToolbar = showDeliveryColumn && onDeliveryFilterChange ? (
    <div className="flex flex-wrap gap-1.5">
      {DELIVERY_FILTER_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onDeliveryFilterChange(option.id)}
          className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
            deliveryFilter === option.id
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
      toolbarExtra={deliveryFilterToolbar}
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
                  globalFilter || deliveryFilter !== "all"
                    ? "No se encontraron ventas con ese criterio."
                    : emptyTitle
                }
                hint={!globalFilter && deliveryFilter === "all" ? emptyHint : undefined}
              />
            }
          />
        </table>
      </ExpenseTableScroll>
    </ExpenseTableCard>
  );
}
