import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { getCustomers, deleteCustomerById } from "../api/customers.js";
import { useEffect, useState } from "react";
import AddCustomerModal from "../components/modals/AddCustomerModal.jsx";
import validateRut from '../libs/validateRut.js'
import { FcOk } from "react-icons/fc";
import { FaEye, FaEdit, FaTrash, FaSearch, FaSortUp, FaSortDown, FaSort, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext.jsx";
import { useConfirm } from "../context/ConfirmationContext.jsx";

export default function CustomerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // State for Modal
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

    const handleViewCustomer = (customerId) => {
        navigate(`/customers/${customerId}`);
    };

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
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
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
                            <span title="RUT válido">
                                <FcOk />
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
                <div className="flex gap-3">
                    <button
                        className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 rounded-full hover:bg-emerald-50"
                        onClick={() => handleViewCustomer(row.original.customerId)}
                        title="Ver detalle"
                    >
                        <FaEye size={18} />
                    </button>
                    <button
                        className="text-amber-500 hover:text-amber-700 transition-colors p-1 rounded-full hover:bg-amber-50"
                        onClick={() => handleEditCustomer(row.original.customerId)}
                        title="Editar"
                    >
                        <FaEdit size={18} />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                        onClick={() => handleDeleteCustomer(row.original.customerId, row.original.customerFirstName, row.original.customerLastName)}
                        title="Eliminar"
                    >
                        <FaTrash size={18} />
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: customers,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <ProtectedView>
            <NavBarComponent />
            
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                <Motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-7xl mx-auto space-y-6"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                            <p className="text-sm text-gray-500 mt-1">Gestione su base de clientes</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full md:w-auto">
                            <div className="relative group w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                    <FaSearch />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                                    placeholder="Buscar cliente..."
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                />
                            </div>
                            
                            <button
                                onClick={handleCreateCustomer}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-sm bg-emerald-600 hover:bg-emerald-700 text-white justify-center"
                            >
                                <FaPlus className="text-xs" />
                                <span className="inline">Nuevo Cliente</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id} className="bg-gray-50/80 border-b border-gray-200">
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        <span className="text-gray-400">
                                                            {{
                                                                asc: <FaSortUp className="text-emerald-600" />,
                                                                desc: <FaSortDown className="text-emerald-600" />,
                                                            }[header.column.getIsSorted()] ?? <FaSort size={12} />}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <Motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                                                        <p className="text-gray-500 text-sm font-medium">Cargando clientes...</p>
                                                    </div>
                                                </td>
                                            </Motion.tr>
                                        ) : table.getRowModel().rows.length === 0 ? (
                                            <Motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="p-3 bg-gray-50 rounded-full">
                                                            <FaSearch className="text-gray-300 text-xl" />
                                                        </div>
                                                        <p>No se encontraron clientes</p>
                                                    </div>
                                                </td>
                                            </Motion.tr>
                                        ) : (
                                            table.getRowModel().rows.map((row, i) => (
                                                <Motion.tr
                                                    key={row.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05, duration: 0.2 }}
                                                    className="hover:bg-gray-50/80 transition-colors group"
                                                >
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </Motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Footer / Pagination (Optional placeholder) */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                            <span>Mostrando {table.getRowModel().rows.length} registros</span>
                            {/* Pagination controls could go here */}
                        </div>
                    </div>
                </Motion.div>

                {/* Controlled Modal */}
                <AddCustomerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    customerToEdit={editingCustomer}
                    onCreated={fetchCustomers}
                />
            </div>
        </ProtectedView>
    );
}
