import { useState, useEffect } from "react";
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import SectionHeader from "../components/SetionHeader.jsx";
import axios from "../api/axios.js";
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { motion as Motion } from "framer-motion";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { FaEye, FaLock, FaCalendarCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

const MySwal = withReactContent(Swal);

export default function PageDailySales() {
    const [dailySales, setDailySales] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get('/dailySales');
            setDailySales(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateClose = async () => {
        const today = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
        
        MySwal.fire({
            title: '¿Realizar Cierre Diario?',
            text: `Se generará el cierre para el día: ${today}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar caja',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10B981', // Emerald 500
            cancelButtonColor: '#6B7280'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = {
                        dailySalesId: uuidv4(),
                        dailySalesDay: today
                    };
                    await axios.post('/dailySales', data);
                    
                    MySwal.fire('¡Éxito!', 'Cierre diario realizado correctamente.', 'success');
                    fetchData();
                } catch (error) {
                    if (error.response?.data?.type === "DUPLICATE_DATE") {
                        MySwal.fire('Atención', 'Ya existe un cierre realizado para este día.', 'warning');
                    } else {
                        MySwal.fire('Error', 'No se pudo realizar el cierre. Intente nuevamente.', 'error');
                    }
                }
            }
        });
    };

    const columns = [
        {
            header: "Fecha",
            accessorKey: "dailySalesDay",
            cell: info => <span className="font-semibold text-gray-800">{info.getValue()}</span>
        },
        {
            header: "N° Ventas",
            accessorKey: "dailySalesNumberOfSales",
            cell: info => <span className="text-gray-600 font-mono">{info.getValue()}</span>
        },
        {
            header: "Total Ventas",
            accessorKey: "dailySalesTotalSales",
            cell: info => <span className="text-emerald-600 font-bold">${Number(info.getValue()).toLocaleString('es-CL')}</span>
        },
        {
            header: "Total Abonado",
            accessorKey: "dailySalesTotalIncome",
            cell: info => <span className="text-blue-600 font-bold">${Number(info.getValue()).toLocaleString('es-CL')}</span>
        },
        {
            header: "Acciones",
            accessorKey: "dailySalesId",
            cell: info => (
                <div className="flex gap-2">
                    <Link 
                        to={`/daily-sales/view/${info.getValue()}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Detalle"
                    >
                        <FaEye />
                    </Link>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: dailySales,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 mt-[35px]">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    <SectionHeader
                        title="Cierres Diarios"
                        subtitle="Historial y gestión de cierres de caja"
                        icon={<FaCalendarCheck className="text-emerald-600 text-2xl" />}
                        button={
                            <button
                                onClick={handleCreateClose}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                            >
                                <FaLock /> Realizar Cierre Diario
                            </button>
                        }
                    />

                    <Motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-4">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                                Cargando registros...
                                            </td>
                                        </tr>
                                    ) : dailySales.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                                No hay cierres registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Motion.div>
                </div>
            </div>
        </ProtectedView>
    );
}
