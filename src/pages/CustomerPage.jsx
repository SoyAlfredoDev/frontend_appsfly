import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { getCustomers, deleteCustomerById } from "../api/customers.js";
import { useEffect, useState } from "react";
import AddCustomerModal from "../components/modals/AddCustomerModal.jsx";
import validateRut from '../libs/validateRut.js';
import { FaEye, FaEdit, FaTrash, FaPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { useConfirm } from "../context/ConfirmationContext.jsx";
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

export default function CustomerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const result = await getCustomers();
            setCustomers(result.data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

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
                    fetchCustomers();
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

    const formatName = (name) =>
        name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

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
                <div className="flex items-center justify-center gap-1">
                    <button type="button" className={ACTION_VIEW} onClick={() => handleViewCustomer(row.original.customerId)} title="Ver detalle">
                        <FaEye />
                    </button>
                    <button type="button" className={ACTION_EDIT} onClick={() => handleEditCustomer(row.original.customerId)} title="Editar">
                        <FaEdit />
                    </button>
                    <button type="button" className={ACTION_DELETE} onClick={() => handleDeleteCustomer(row.original.customerId, row.original.customerFirstName, row.original.customerLastName)} title="Eliminar">
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: customers,
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
                    recordCount={filteredCount}
                    loading={isLoading}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
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
                                        title={globalFilter ? "No se encontraron clientes con ese criterio." : "No hay clientes registrados."}
                                        hint={!globalFilter ? 'Usa el botón "Nuevo Cliente" para registrar el primero.' : undefined}
                                    />
                                }
                            />
                        </table>
                    </ExpenseTableScroll>
                </ExpenseTableCard>
            </ExpensePageLayout>

            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                }}
                customerToEdit={editingCustomer}
                onCreated={fetchCustomers}
            />
        </>
    );
}
