import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { getPurchaseRequests } from "../../api/purchase.js";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaShoppingBag, FaEdit } from "react-icons/fa";
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
import EditPurchaseModal from "../../components/modals/EditPurchaseModal.jsx";
import PurchasePrintButton from "../../components/purchase/PurchasePrintButton.jsx";
import {
  PRIMARY_BTN,
  ACTION_VIEW,
  ACTION_EDIT,
} from "../../utils/expenseUiPatterns.js";

export default function PurchasePage() {
  const [purchasesData, setPurchasesData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      header: "Fecha",
      accessorFn: (row) => row.purchaseDate ?? "",
      cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
    },
    {
      header: "Nro Interno",
      accessorFn: (row) => row.purchaseNumber ?? "",
      cell: (info) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Nro Factura",
      accessorFn: (row) => row.purchaseRealNumber ?? "—",
      cell: (info) => (
        <span className="font-mono text-xs text-gray-700">{info.getValue()}</span>
      ),
    },
    {
      header: "Proveedor",
      accessorFn: (row) => row.provider?.providerName ?? "Sin proveedor",
      cell: (info) => (
        <span className="text-gray-800 font-medium">{info.getValue()}</span>
      ),
    },
    {
      header: "Total",
      accessorFn: (row) => row.purchaseTotal ?? "",
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
      accessorFn: (row) => row.purchaseStatus ?? "PENDING",
      cell: ({ getValue }) => {
        const value = getValue();
        let colorClass = "bg-slate-100 text-slate-700";
        let label = value;
        if (value === "COMPLETED") {
          colorClass = "bg-emerald-100 text-emerald-700";
          label = "Completada";
        }
        if (value === "PAID") {
          colorClass = "bg-primary/10 text-primary";
          label = "Pagada";
        }
        if (value === "PENDING") {
          colorClass = "bg-amber-100 text-amber-700";
          label = "Pendiente";
        }
        if (value === "CANCELLED") {
          colorClass = "bg-red-100 text-red-700";
          label = "Anulada";
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }) => {
        const purchase = row.original;
        const canEdit = purchase.purchaseStatus !== "CANCELLED";

        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className={ACTION_VIEW}
              onClick={() => navigate(`/purchase/view/${purchase.purchaseId}`)}
              title="Ver detalle"
            >
              <FaEye />
            </button>
            {canEdit && (
              <button
                type="button"
                className={ACTION_EDIT}
                onClick={() => setEditingPurchase(purchase)}
                title="Editar compra"
              >
                <FaEdit />
              </button>
            )}
            <PurchasePrintButton
              purchaseId={purchase.purchaseId}
              purchaseNumber={purchase.purchaseNumber}
              buttonClassName="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              iconOnly
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: purchasesData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await getPurchaseRequests();
      setPurchasesData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <ExpensePageLayout
        title="Compras"
        subtitle="Historial y gestión de compras a proveedores"
        actions={
          <button
            type="button"
            onClick={() => navigate("/purchase/register")}
            className={PRIMARY_BTN}
          >
            <FaPlus /> Nueva Compra
          </button>
        }
      >
        <ExpenseTableCard
          sectionTitle="Listado de compras"
          recordCount={filteredCount}
          loading={isLoading}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder="Buscar por proveedor, número..."
        >
          <ExpenseTableScroll>
            <table className="w-full text-left border-collapse">
              <ExpenseTableHead table={table} centerColumns={["actions"]} />
              <ExpenseTableBody
                table={table}
                isLoading={isLoading}
                loadingRow={
                  <ExpenseTableLoading colSpan={columns.length} message="Cargando compras..." />
                }
                emptyRow={
                  <ExpenseTableEmpty
                    colSpan={columns.length}
                    icon={<FaShoppingBag className="text-4xl text-gray-300" />}
                    title={
                      globalFilter
                        ? "No se encontraron compras con ese criterio."
                        : "No hay compras registradas."
                    }
                    hint={
                      !globalFilter
                        ? 'Usa el botón "Nueva Compra" para registrar la primera.'
                        : undefined
                    }
                  />
                }
              />
            </table>
          </ExpenseTableScroll>
        </ExpenseTableCard>
      </ExpensePageLayout>

      <EditPurchaseModal
        purchase={editingPurchase}
        isOpen={Boolean(editingPurchase)}
        onClose={() => setEditingPurchase(null)}
        onUpdated={() => {
          fetchPurchases();
          setEditingPurchase(null);
        }}
      />
    </>
  );
}
