import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTruck, FaEye, FaPlus } from "react-icons/fa";
import { getLabDispatches } from "../../api/labDispatches.js";
import { useToast } from "../../context/ToastContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../../components/ui/ExpenseTableElements.jsx";
import { PRIMARY_BTN, ACTION_VIEW } from "../../utils/expenseUiPatterns.js";
import LabDispatchStatusBadge from "../../components/optics/LabDispatchStatusBadge.jsx";
import CreateLabDispatchModal from "../../components/modals/CreateLabDispatchModal.jsx";

export default function LabDispatchesPage() {
    const [dispatches, setDispatches] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const toast = useToast();

    const fetchDispatches = async () => {
        setIsLoading(true);
        try {
            const result = await getLabDispatches();
            setDispatches(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.log(error);
            toast.error("Error", "No se pudieron cargar los despachos a laboratorio.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDispatches();
    }, []);

    const columns = [
        {
            header: "N° Despacho",
            accessorKey: "labDispatchNumber",
            cell: ({ getValue }) => (
                <span className="font-mono text-xs font-semibold text-gray-800">{getValue() || "—"}</span>
            ),
        },
        {
            header: "Laboratorio",
            accessorFn: row => row.laboratory?.laboratoryName ?? "",
            cell: ({ getValue }) => <span className="text-gray-700">{getValue() || "—"}</span>,
        },
        {
            header: "OT",
            accessorFn: row => row._count?.WorkOrder ?? row.WorkOrder?.length ?? 0,
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    {getValue()}
                </span>
            ),
        },
        {
            header: "Estado",
            accessorKey: "labDispatchStatus",
            cell: ({ getValue }) => <LabDispatchStatusBadge status={getValue()} />,
        },
        {
            header: "Enviado",
            accessorKey: "sentAt",
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
            header: "Enviado por",
            accessorFn: row => [row.sentBy?.userFirstName, row.sentBy?.userLastName].filter(Boolean).join(" "),
            cell: ({ getValue }) => <span className="text-gray-600 text-sm">{getValue() || "—"}</span>,
        },
        {
            header: "Acciones",
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Link
                        to={`/lab-dispatches/${row.original.labDispatchId}`}
                        className={ACTION_VIEW}
                        title="Ver despacho"
                    >
                        <FaEye />
                    </Link>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: dispatches,
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
        <>
            <ExpensePageLayout
                title="Despachos a Laboratorio"
                subtitle="Agrupa y controla el envío de órdenes de trabajo a laboratorios"
                actions={
                    <button type="button" onClick={() => setIsCreateOpen(true)} className={PRIMARY_BTN}>
                        <FaPlus /> Nuevo Despacho
                    </button>
                }
            >
                <ExpenseTableCard
                    sectionTitle="Listado de despachos"
                    recordCount={filteredCount}
                    loading={isLoading}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Buscar despacho..."
                >
                    <ExpenseTableScroll>
                        <table className="w-full text-left border-collapse">
                            <ExpenseTableHead table={table} centerColumns={['actions']} />
                            <ExpenseTableBody
                                table={table}
                                isLoading={isLoading}
                                loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando despachos..." />}
                                emptyRow={
                                    <ExpenseTableEmpty
                                        colSpan={columns.length}
                                        icon={<FaTruck className="text-4xl text-gray-300" />}
                                        title={globalFilter ? "No se encontraron despachos con ese criterio." : "No hay despachos registrados."}
                                        hint={!globalFilter ? 'Usa el botón "Nuevo Despacho" para registrar el primero.' : undefined}
                                    />
                                }
                            />
                        </table>
                    </ExpenseTableScroll>
                </ExpenseTableCard>
            </ExpensePageLayout>

            <CreateLabDispatchModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => {
                    fetchDispatches();
                    setIsCreateOpen(false);
                }}
            />
        </>
    );
}
