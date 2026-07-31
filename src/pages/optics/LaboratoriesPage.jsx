import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { getLaboratories, deleteLaboratoryById } from "../../api/laboratories.js";
import { useEffect, useState } from "react";
import AddLaboratoryModal from "../../components/modals/AddLaboratoryModal.jsx";
import { FaEdit, FaTrash, FaWhatsapp, FaEnvelope, FaPlus, FaFlask } from "react-icons/fa";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../../components/ui/ExpenseTableElements.jsx";
import {
    PRIMARY_BTN,
    ACTION_EDIT,
    ACTION_DELETE,
} from "../../utils/expenseUiPatterns.js";
import {
    buildWhatsAppUrl,
    formatProviderPhone,
    formatProviderLabel,
} from "../../utils/providerContact.js";

export default function LaboratoriesPage() {
    const [laboratories, setLaboratories] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingLaboratory, setEditingLaboratory] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const confirm = useConfirm();
    const toast = useToast();

    const fetchLaboratories = async () => {
        setIsLoading(true);
        try {
            const result = await getLaboratories();
            setLaboratories(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.log(error);
            toast.error("Error", "No se pudieron cargar los laboratorios.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLaboratories();
    }, []);

    const handleEditLaboratory = (laboratory) => setEditingLaboratory(laboratory);
    const handleCloseEditModal = () => setEditingLaboratory(null);

    const getUsageCount = (laboratory) =>
        (laboratory?._count?.WorkOrder ?? 0) + (laboratory?._count?.LabDispatch ?? 0);

    const handleDeleteLaboratory = async (laboratory) => {
        const usageCount = getUsageCount(laboratory);
        if (usageCount > 0) {
            toast.error(
                "Eliminación bloqueada",
                `Este laboratorio tiene órdenes de trabajo o despachos asociados y no puede eliminarse.`,
            );
            return;
        }

        const isConfirmed = await confirm({
            title: 'Eliminar Laboratorio',
            message: `¿Estás seguro de que deseas eliminar a "${formatProviderLabel(laboratory.laboratoryName)}"? Esta acción no se puede deshacer.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });

        if (!isConfirmed) return;

        try {
            await deleteLaboratoryById(laboratory.laboratoryId);
            toast.success("Eliminado", "Laboratorio eliminado con éxito.");
            fetchLaboratories();
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error(
                    "No se pudo eliminar",
                    error.response?.data?.message || "El laboratorio tiene registros asociados.",
                );
            } else {
                toast.error("Error", "Error del servidor al intentar eliminar.");
            }
        }
    };

    const columns = [
        {
            header: "Nombre",
            accessorFn: row => row.laboratoryName ?? "",
            cell: info => (
                <span className="font-medium text-gray-900">
                    {formatProviderLabel(info.getValue())}
                </span>
            ),
        },
        {
            header: "Documento",
            accessorFn: row => {
                const type = row?.laboratoryDocumentType?.toUpperCase() ?? "";
                const number = row?.laboratoryDocumentNumber ?? "";
                return type || number ? `${type} ${number}`.trim() : "";
            },
            cell: ({ getValue }) => {
                const value = getValue();
                if (!value) return <span className="text-gray-400">—</span>;
                return <span className="text-gray-700">{value}</span>;
            }
        },
        {
            header: "Teléfono",
            accessorFn: row => formatProviderPhone(row?.laboratoryCodePhoneNumber, row?.laboratoryPhoneNumber),
            cell: ({ row }) => {
                const phoneLabel = formatProviderPhone(
                    row.original.laboratoryCodePhoneNumber,
                    row.original.laboratoryPhoneNumber,
                );
                const whatsappUrl = buildWhatsAppUrl(
                    row.original.laboratoryCodePhoneNumber,
                    row.original.laboratoryPhoneNumber,
                );
                if (!phoneLabel) return <span className="text-gray-400">—</span>;
                if (!whatsappUrl) return <span className="text-gray-600">{phoneLabel}</span>;
                return (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
                        title="Abrir WhatsApp"
                    >
                        <FaWhatsapp />
                        <span>{phoneLabel}</span>
                    </a>
                );
            },
        },
        {
            header: "Email",
            accessorKey: "laboratoryEmail",
            cell: ({ getValue }) => {
                const email = getValue();
                if (!email) return <span className="text-gray-400">—</span>;
                return (
                    <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Enviar correo"
                    >
                        <FaEnvelope className="shrink-0" />
                        <span className="truncate max-w-[180px]">{email}</span>
                    </a>
                );
            },
        },
        {
            header: "Estado",
            accessorFn: row => (row.laboratoryActive ? "Activo" : "Inactivo"),
            cell: ({ getValue }) => {
                const value = getValue();
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        value === "Activo" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                        {value}
                    </span>
                );
            },
        },
        {
            header: "OT / Despachos",
            accessorFn: row => getUsageCount(row),
            cell: ({ getValue }) => {
                const count = getValue();
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        count > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}>
                        {count}
                    </span>
                );
            },
        },
        {
            header: 'Acciones',
            id: "actions",
            cell: ({ row }) => {
                const usageCount = getUsageCount(row.original);
                const canDelete = usageCount === 0;
                return (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            className={ACTION_EDIT}
                            onClick={() => handleEditLaboratory(row.original)}
                            title="Editar laboratorio"
                        >
                            <FaEdit />
                        </button>
                        <button
                            type="button"
                            className={canDelete ? ACTION_DELETE : `${ACTION_DELETE} opacity-30 cursor-not-allowed hover:bg-transparent`}
                            onClick={() => canDelete && handleDeleteLaboratory(row.original)}
                            disabled={!canDelete}
                            title={canDelete ? "Eliminar laboratorio" : "No se puede eliminar: tiene registros asociados"}
                        >
                            <FaTrash />
                        </button>
                    </div>
                );
            },
        }
    ];

    const table = useReactTable({
        data: laboratories,
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
                title="Laboratorios"
                subtitle="Gestione los laboratorios ópticos para el procesamiento de órdenes de trabajo"
                actions={
                    <button type="button" onClick={() => setIsCreateOpen(true)} className={PRIMARY_BTN}>
                        <FaPlus /> Nuevo Laboratorio
                    </button>
                }
            >
                <ExpenseTableCard
                    sectionTitle="Listado de laboratorios"
                    recordCount={filteredCount}
                    loading={isLoading}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Buscar laboratorio..."
                >
                    <ExpenseTableScroll>
                        <table className="w-full text-left border-collapse">
                            <ExpenseTableHead table={table} centerColumns={['actions']} />
                            <ExpenseTableBody
                                table={table}
                                isLoading={isLoading}
                                loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando laboratorios..." />}
                                emptyRow={
                                    <ExpenseTableEmpty
                                        colSpan={columns.length}
                                        icon={<FaFlask className="text-4xl text-gray-300" />}
                                        title={globalFilter ? "No se encontraron laboratorios con ese criterio." : "No hay laboratorios registrados."}
                                        hint={!globalFilter ? 'Usa el botón "Nuevo Laboratorio" para registrar el primero.' : undefined}
                                    />
                                }
                            />
                        </table>
                    </ExpenseTableScroll>
                </ExpenseTableCard>
            </ExpensePageLayout>

            <AddLaboratoryModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Nuevo laboratorio"
                onCreated={() => {
                    fetchLaboratories();
                    setIsCreateOpen(false);
                }}
            />

            <AddLaboratoryModal
                isOpen={Boolean(editingLaboratory)}
                onClose={handleCloseEditModal}
                laboratoryToEdit={editingLaboratory}
                title="Editar laboratorio"
                onCreated={() => {
                    fetchLaboratories();
                    handleCloseEditModal();
                }}
            />
        </>
    );
}
