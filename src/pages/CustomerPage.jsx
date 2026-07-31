import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
} from "@tanstack/react-table";
import { getCustomers, deleteCustomerById } from "../api/customers.js";
import { useEffect, useState } from "react";
import useDebouncedValue from "../hooks/useDebouncedValue.js";
import { unwrapListPayload } from "../utils/listPayload.js";
import AddCustomerModal from "../components/modals/AddCustomerModal.jsx";
import validateRut from '../libs/validateRut.js';
import { FaEye, FaEdit, FaTrash, FaPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { useConfirm } from "../context/ConfirmationContext.jsx";
import useTenantPermissions from "../hooks/useTenantPermissions.js";
import ExpensePageLayout from "../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../components/ui/ExpenseTableElements.jsx";
import {
    PRIMARY_BTN,
    ACTION_VIEW,
    ACTION_EDIT,
    ACTION_DELETE,
} from "../utils/expenseUiPatterns.js";

const PAGE_LIMIT = 50;

export default function CustomerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();
    const { can } = useTenantPermissions();
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        currentPage: 1,
        limit: PAGE_LIMIT,
    });
    const [sorting, setSorting] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 350);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        let cancelled = false;
        const fetchCustomers = async () => {
            setIsLoading(true);
            try {
                const result = await getCustomers({
                    page,
                    limit: PAGE_LIMIT,
                    q: debouncedSearch.trim() || undefined,
                });
                if (cancelled) return;
                const { rows, pagination: paging } = unwrapListPayload(result.data);
                setCustomers(rows);
                if (paging) setPagination(paging);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        fetchCustomers();
        return () => {
            cancelled = true;
        };
    }, [page, debouncedSearch, reloadToken]);

    const refreshCustomers = () => setReloadToken((n) => n + 1);

    const handleViewCustomer = (customerId) => navigate(`/customers/${customerId}`);

    const handleEditCustomer = (customerId) => {
        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
            setEditingCustomer(customer);
            setIsModalOpen(true);
        }
    };

    const handleCreateCustomer = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const formatName = (name) =>
        name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

    const handleDeleteCustomer = async (customerId, firstName = '', lastName = '') => {
        try {
            const isConfirmed = await confirm({
                title: 'Eliminar Cliente',
                message: `¿Estás seguro de que deseas eliminar a ${formatName(firstName)} ${formatName(lastName)}? Esta acción no se puede deshacer.`,
                variant: 'danger',
                confirmText: 'Eliminar',
                cancelText: 'Cancelar'
            });

            if (isConfirmed) {
                const res = await deleteCustomerById(customerId);
                if (res.status === 200) {
                    refreshCustomers();
                    toast.success('Cliente Eliminado', 'El cliente ha sido eliminado con éxito.');
                }
                if (res.status === 400) {
                    toast.warning('No se puede eliminar', 'El cliente tiene datos asociados y no puede ser eliminado.');
                }
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 400) {
                toast.warning('No se puede eliminar', 'El cliente tiene datos asociados y no puede ser eliminado.');
            } else {
                toast.error('Error', 'Ocurrió un error al eliminar el cliente. Por favor, inténtelo de nuevo más tarde.');
            }
        }
    };

    const columns = [
        {
            header: "Nombre y Apellido",
            accessorFn: row => {
                const firstName = formatName(row?.customerFirstName) ?? "";
                const lastName = formatName(row?.customerLastName) ?? "";
                return `${firstName} ${lastName}`.trim();
            },
            cell: info => <span className="text-gray-800 font-medium">{info.getValue()}</span>
        },
        {
            header: "Número Documento",
            accessorFn: row => {
                const type = row?.customerDocumentType?.toUpperCase() ?? "";
                const number = row?.customerDocumentNumber ?? "";
                return `${type} ${number}`;
            },
            cell: ({ getValue }) => {
                const value = getValue();
                const [type, number] = value.split(" ");
                const isValidRut = type === "RUT" && validateRut(number);
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700">{type}: {number}</span>
                        {isValidRut && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                RUT válido
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Teléfono",
            accessorFn: row => {
                const code = row?.customerCodePhoneNumber ?? "";
                const number = row?.customerPhoneNumber ?? "";
                return `${code} ${number}`.trim();
            },
            cell: info => <span className="text-gray-600">{info.getValue()}</span>
        },
        {
            header: 'Acciones',
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1 justify-center">
                    <button type="button" className={ACTION_VIEW} onClick={() => handleViewCustomer(row.original.customerId)} title="Ver detalle">
                        <FaEye />
                    </button>
                    <button type="button" className={ACTION_EDIT} onClick={() => handleEditCustomer(row.original.customerId)} title="Editar">
                        <FaEdit />
                    </button>
                    {can("customers:delete") && (
                      <button type="button" className={ACTION_DELETE} onClick={() => handleDeleteCustomer(row.original.customerId, row.original.customerFirstName, row.original.customerLastName)} title="Eliminar">
                          <FaTrash />
                      </button>
                    )}
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: customers,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualFiltering: true,
    });

    return (
        <>
            <ExpensePageLayout
                title="Clientes"
                subtitle="Gestione su base de clientes"
                actions={
                    <button type="button" onClick={handleCreateCustomer} className={PRIMARY_BTN}>
                        <FaPlus /> Nuevo Cliente
                    </button>
                }
            >
                <ExpenseTableCard
                    sectionTitle="Listado de clientes"
                    recordCount={pagination.total}
                    loading={isLoading}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Buscar por nombre, documento..."
                >
                    <ExpenseTableScroll>
                        <table className="w-full text-left border-collapse">
                            <ExpenseTableHead table={table} centerColumns={['actions']} />
                            <ExpenseTableBody
                                table={table}
                                isLoading={isLoading}
                                loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando clientes..." />}
                                emptyRow={
                                    <ExpenseTableEmpty
                                        colSpan={columns.length}
                                        icon={<FaUsers className="text-4xl text-gray-300" />}
                                        title={search ? "No se encontraron clientes con ese criterio." : "No hay clientes registrados."}
                                        hint={!search ? 'Usa el botón "Nuevo Cliente" para registrar el primero.' : undefined}
                                    />
                                }
                            />
                        </table>
                    </ExpenseTableScroll>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
                            <span>
                                Página <strong>{pagination.currentPage}</strong> de{" "}
                                <strong>{pagination.pages}</strong>
                                <span className="text-gray-400 ml-2">
                                    ({pagination.total} en total)
                                </span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
                                    disabled={pagination.currentPage <= 1 || isLoading}
                                    onClick={() => setPage(pagination.currentPage - 1)}
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
                                    disabled={pagination.currentPage >= pagination.pages || isLoading}
                                    onClick={() => setPage(pagination.currentPage + 1)}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </ExpenseTableCard>
            </ExpensePageLayout>

            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                }}
                customerToEdit={editingCustomer}
                onCreated={refreshCustomers}
            />
        </>
    );
}
