import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import { useEffect, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { getSales } from "../../api/sale.js";

import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaEye, FaPlus, FaSearch, FaReceipt, FaSort, FaSortUp, FaSortDown, FaMoneyBillWave } from 'react-icons/fa';

export default function SalesPage() {
    const [salesData, setSalesData] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const handleAddSale = () => {
        navigate("/sales/register");
    };

    const handleEditSale = (saleId) => {
        navigate(`/sales/view/${saleId}`);
    }

    const columns = [
        { 
            header: "Fecha", 
            accessorFn: row => row.saleDate ?? "",
            cell: info => <span className="text-gray-600 font-medium">{info.getValue()}</span>
        },
        { 
            header: "Nro", 
            accessorFn: row => row.saleNumber ?? "",
            cell: info => <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{info.getValue()}</span>
        },
        { 
            header: "Cliente", 
            accessorFn: row => `${row.customer?.customerFirstName ?? ""} ${row.customer?.customerLastName ?? ""}`,
            cell: info => <span className="font-medium text-gray-800">{info.getValue()}</span>
        },
        {
            header: "Total", 
            accessorFn: row => row.saleTotal ?? "", 
            cell: ({ getValue }) => {
                const value = getValue();
                const formatted = typeof value === 'number' ? value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : value;
                return <span className="font-bold text-emerald-600">{formatted}</span>;
            },
        },
        {
            header: "Pendiente", 
            accessorFn: row => row.salePendingAmount ?? "", 
            cell: ({ getValue }) => {
                const value = getValue();
                const formatted = typeof value === 'number' ? value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : value;
                return value > 0 ? (
                    <span className="font-semibold text-red-500">{formatted}</span>
                ) : (
                    <span className="text-gray-400 text-xs">Pagado</span>
                );
            },
        },
        {
            header: "Vendedor", 
            accessorFn: row => `${row.user?.userFirstName ?? ""} ${row.user?.userLastName ?? ""}`,
            cell: info => <span className="text-xs text-gray-500">{info.getValue()}</span>
        },
        { 
            header: "Comentario", 
            accessorFn: row => row.saleComment ?? "",
            cell: info => <span className="text-xs text-gray-400 italic truncate max-w-[150px] inline-block" title={info.getValue()}>{info.getValue()}</span>
        },
        {
            header: "Acciones", 
            id: "actions", 
            cell: ({ row }) => (
                <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => handleEditSale(row.original.saleId)}
                    title="Ver Detalle"
                >
                    <FaEye />
                </button>
            )
        }
    ];

    const table = useReactTable({
        data: salesData,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await getSales();
            setSalesData(response.data || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                <Motion.div 
                    className="max-w-7xl mx-auto space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaReceipt className="text-emerald-600" />
                                Ventas
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Historial y gestión de ventas realizadas</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={globalFilter ?? ""}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    placeholder="Buscar venta..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64 shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={handleAddSale} 
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 font-medium"
                            >
                                <FaPlus className="text-sm" />
                                <span>Nueva Venta</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        <span className="text-gray-400">
                                                            {{
                                                                asc: <FaSortUp />,
                                                                desc: <FaSortDown />,
                                                            }[header.column.getIsSorted()] ?? <FaSort className="opacity-0 group-hover:opacity-50" />}
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
                                            <tr>
                                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                                                        <p className="text-gray-500 text-sm">Cargando ventas...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : table.getRowModel().rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <FaMoneyBillWave className="text-4xl text-gray-300" />
                                                        <p>No se encontraron ventas.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            table.getRowModel().rows.map(row => (
                                                <Motion.tr
                                                    key={row.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    layout
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id} className="px-6 py-4">
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
                    </div>
                </Motion.div>
            </div>
        </ProtectedView>
    );
}