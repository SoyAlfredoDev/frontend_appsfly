import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaEye } from "react-icons/fa";
import { getWorkOrders } from "../../api/workOrders.js";
import { useToast } from "../../context/ToastContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../../components/ui/ExpenseTableElements.jsx";
import { ACTION_VIEW } from "../../utils/expenseUiPatterns.js";
import WorkOrderStatusBadge from "../../components/optics/WorkOrderStatusBadge.jsx";
import { WORK_ORDER_STATUS_LABELS } from "../../utils/workOrderStatus.js";

const STATUS_FILTERS = [
    { value: "", label: "Todas" },
    ...Object.entries(WORK_ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function WorkOrdersPage() {
    const [workOrders, setWorkOrders] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const toast = useToast();

    const fetchWorkOrders = async (status) => {
        setIsLoading(true);
        try {
            const result = await getWorkOrders({ status: status || undefined });
            setWorkOrders(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.log(error);
            toast.error("Error", "No se pudieron cargar las órdenes de trabajo.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrders(statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const formatCustomerName = (customer) =>
        [customer?.customerFirstName, customer?.customerLastName].filter(Boolean).join(" ") || "—";

    const columns = [
        {
            header: "N° OT",
            accessorKey: "workOrderNumber",
            cell: ({ getValue }) => (
                <span className="font-mono text-xs font-semibold text-gray-800">{getValue() || "—"}</span>
            ),
        },
        {
            header: "Venta",
            accessorFn: row => row.sale?.saleNumber ?? "",
            cell: ({ row }) => {
                const sale = row.original.sale;
                if (!sale) return <span className="text-gray-400">—</span>;
                return (
                    <Link
                        to={`/sales/view/${sale.saleId}`}
                        className="text-primary hover:text-primary-hover font-medium"
                    >
                        #{sale.saleNumber}
                    </Link>
                );
            },
        },
        {
            header: "Cliente",
            accessorFn: row => formatCustomerName(row.customer),
            cell: ({ getValue }) => <span className="text-gray-700">{getValue()}</span>,
        },
        {
            header: "Producto",
            accessorFn: row => row.saleDetail?.product?.productName ?? "",
            cell: ({ getValue }) => <span className="text-gray-700">{getValue() || "—"}</span>,
        },
        {
            header: "Laboratorio",
            accessorFn: row => row.laboratory?.laboratoryName ?? "",
            cell: ({ getValue }) => {
                const value = getValue();
                return value ? (
                    <span className="text-gray-700">{value}</span>
                ) : (
                    <span className="text-gray-400">Sin asignar</span>
                );
            },
        },
        {
            header: "Estado",
            accessorKey: "workOrderStatus",
            cell: ({ getValue }) => <WorkOrderStatusBadge status={getValue()} />,
        },
        {
            header: "Fecha",
            accessorKey: "createdAt",
            cell: ({ getValue }) => {
                const value = getValue();
                return (
                    <span className="text-gray-500 text-xs">
                        {value ? new Date(value).toLocaleDateString("es-CL") : "—"}
                    </span>
                );
            },
        },
        {
            header: "Acciones",
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Link
                        to={`/work-orders/${row.original.workOrderId}`}
                        className={ACTION_VIEW}
                        title="Ver orden de trabajo"
                    >
                        <FaEye />
                    </Link>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: workOrders,
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
        <ExpensePageLayout
            title="Órdenes de Trabajo"
            subtitle="Seguimiento de las OT generadas para ventas ópticas"
        >
            <ExpenseTableCard
                sectionTitle="Listado de órdenes de trabajo"
                recordCount={filteredCount}
                loading={isLoading}
                searchValue={globalFilter}
                onSearchChange={setGlobalFilter}
                searchPlaceholder="Buscar por cliente, producto..."
                toolbarExtra={
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.value || "all"}
                                type="button"
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                                    statusFilter === filter.value
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                }
            >
                <ExpenseTableScroll>
                    <table className="w-full text-left border-collapse">
                        <ExpenseTableHead table={table} centerColumns={['actions']} />
                        <ExpenseTableBody
                            table={table}
                            isLoading={isLoading}
                            loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando órdenes de trabajo..." />}
                            emptyRow={
                                <ExpenseTableEmpty
                                    colSpan={columns.length}
                                    icon={<FaClipboardList className="text-4xl text-gray-300" />}
                                    title={globalFilter || statusFilter ? "No se encontraron órdenes de trabajo con ese criterio." : "No hay órdenes de trabajo registradas."}
                                    hint={!globalFilter && !statusFilter ? 'Genera una OT desde el detalle de una venta.' : undefined}
                                />
                            }
                        />
                    </table>
                </ExpenseTableScroll>
            </ExpenseTableCard>
        </ExpensePageLayout>
    );
}
