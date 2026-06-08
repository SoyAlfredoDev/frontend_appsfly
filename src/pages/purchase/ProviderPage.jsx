import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { getProviders, deleteProviderById } from "../../api/providers.js";
import { useEffect, useState } from "react";
import AddProviderModal from "../../components/modals/AddProviderModal.jsx";
import validateRut from '../../libs/validateRut.js';
import { FcOk } from "react-icons/fc";
import { FaEdit, FaTrash, FaWhatsapp, FaEnvelope, FaPlus, FaTruck } from "react-icons/fa";
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
    getProviderPurchaseCount,
} from "../../utils/providerContact.js";

export default function ProviderPage() {
    const [providers, setProviders] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingProvider, setEditingProvider] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const confirm = useConfirm();
    const toast = useToast();

    const fetchProviders = async () => {
        setIsLoading(true);
        try {
            const result = await getProviders();
            setProviders(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.log(error);
            toast.error("Error", "No se pudieron cargar los proveedores.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleEditProvider = (provider) => setEditingProvider(provider);
    const handleCloseEditModal = () => setEditingProvider(null);

    const handleDeleteProvider = async (provider) => {
        const purchaseCount = getProviderPurchaseCount(provider);
        if (purchaseCount > 0) {
            toast.warning(
                "Eliminación bloqueada",
                `Este proveedor tiene ${purchaseCount} compra${purchaseCount !== 1 ? "s" : ""} registrada${purchaseCount !== 1 ? "s" : ""} y no puede eliminarse.`,
            );
            return;
        }

        const isConfirmed = await confirm({
            title: 'Eliminar Proveedor',
            message: `¿Estás seguro de que deseas eliminar a "${formatProviderLabel(provider.providerName)}"? Esta acción no se puede deshacer.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        });

        if (!isConfirmed) return;

        try {
            await deleteProviderById(provider.providerId);
            toast.success("Eliminado", "Proveedor eliminado con éxito.");
            fetchProviders();
        } catch (error) {
            if (error.response?.status === 400) {
                toast.warning(
                    "No se pudo eliminar",
                    error.response?.data?.message || "El proveedor tiene compras asociadas.",
                );
            } else {
                toast.error("Error", "Error del servidor al intentar eliminar.");
            }
        }
    };

    const columns = [
        {
            header: "Nombre / Razón Social",
            accessorFn: row => row.providerName ?? "",
            cell: info => (
                <span className="font-medium text-gray-900">
                    {formatProviderLabel(info.getValue())}
                </span>
            ),
        },
        {
            header: "Documento",
            accessorFn: row => {
                const type = row?.providerDocumentType?.toUpperCase() ?? "";
                const number = row?.providerDocumentNumber ?? "";
                return `${type} ${number}`;
            },
            cell: ({ getValue }) => {
                const value = getValue();
                const [type, number] = value.split(" ");
                const isValidRut = type === "RUT" && validateRut(number);
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700">{type}: {number}</span>
                        {isValidRut && <span title="RUT válido"><FcOk /></span>}
                    </div>
                );
            }
        },
        {
            header: "Teléfono",
            accessorFn: row => formatProviderPhone(row?.providerCodePhoneNumber, row?.providerPhoneNumber),
            cell: ({ row }) => {
                const phoneLabel = formatProviderPhone(
                    row.original.providerCodePhoneNumber,
                    row.original.providerPhoneNumber,
                );
                const whatsappUrl = buildWhatsAppUrl(
                    row.original.providerCodePhoneNumber,
                    row.original.providerPhoneNumber,
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
            accessorKey: "providerEmail",
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
            header: "Compras",
            accessorFn: row => getProviderPurchaseCount(row),
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
                const purchaseCount = getProviderPurchaseCount(row.original);
                const canDelete = purchaseCount === 0;
                return (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            className={ACTION_EDIT}
                            onClick={() => handleEditProvider(row.original)}
                            title="Editar proveedor"
                        >
                            <FaEdit />
                        </button>
                        <button
                            type="button"
                            className={canDelete ? ACTION_DELETE : `${ACTION_DELETE} opacity-30 cursor-not-allowed hover:bg-transparent`}
                            onClick={() => canDelete && handleDeleteProvider(row.original)}
                            disabled={!canDelete}
                            title={canDelete ? "Eliminar proveedor" : "No se puede eliminar: tiene compras registradas"}
                        >
                            <FaTrash />
                        </button>
                    </div>
                );
            },
        }
    ];

    const table = useReactTable({
        data: providers,
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
                title="Proveedores"
                subtitle="Gestione su base de proveedores y contactos"
                actions={
                    <button type="button" onClick={() => setIsCreateOpen(true)} className={PRIMARY_BTN}>
                        <FaPlus /> Nuevo Proveedor
                    </button>
                }
            >
                <ExpenseTableCard
                    sectionTitle="Listado de proveedores"
                    recordCount={filteredCount}
                    loading={isLoading}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Buscar proveedor..."
                >
                    <ExpenseTableScroll>
                        <table className="w-full text-left border-collapse">
                            <ExpenseTableHead table={table} centerColumns={['actions']} />
                            <ExpenseTableBody
                                table={table}
                                isLoading={isLoading}
                                loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando proveedores..." />}
                                emptyRow={
                                    <ExpenseTableEmpty
                                        colSpan={columns.length}
                                        icon={<FaTruck className="text-4xl text-gray-300" />}
                                        title={globalFilter ? "No se encontraron proveedores con ese criterio." : "No hay proveedores registrados."}
                                        hint={!globalFilter ? 'Usa el botón "Nuevo Proveedor" para registrar el primero.' : undefined}
                                    />
                                }
                            />
                        </table>
                    </ExpenseTableScroll>
                </ExpenseTableCard>
            </ExpensePageLayout>

            <AddProviderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Nuevo proveedor"
                onCreated={() => {
                    fetchProviders();
                    setIsCreateOpen(false);
                }}
            />

            <AddProviderModal
                isOpen={Boolean(editingProvider)}
                onClose={handleCloseEditModal}
                providerToEdit={editingProvider}
                title="Editar proveedor"
                onCreated={() => {
                    fetchProviders();
                    handleCloseEditModal();
                }}
            />
        </>
    );
}
