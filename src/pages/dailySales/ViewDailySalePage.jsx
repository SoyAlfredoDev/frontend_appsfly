import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import axios from "../../api/axios.js";
import { motion as Motion } from "framer-motion";
import { FaArrowLeft, FaCalendarDay, FaMoneyBillWave, FaShoppingCart, FaCreditCard, FaReceipt } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ViewDailySalePage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`/dailySales/${id}`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">No se encontró el cierre diario.</p>
                <Link to="/daily-sales" className="text-blue-600 hover:underline">Volver</Link>
            </div>
        );
    }

    // Preparar datos para Gráfico Circular (Métodos de Pago)
    // Asumiendo estructura del backend: data.dailySalesDetailIncome { 0: monto, 1: monto... }
    // 0: Efectivo, 1: Tarjeta Crédito, 2: Débito, 3: Transferencia (Ejemplo, ajustar según IDs reales)
    const detailIncome = typeof data.dailySalesDetailIncome === 'object' ? data.dailySalesDetailIncome : JSON.parse(data.dailySalesDetailIncome || '{}');
    
    const pieData = {
        labels: ['Efectivo', 'Tarjeta Crédito', 'Tarjeta Débito', 'Transferencia/Otro'],
        datasets: [
            {
                data: [
                    detailIncome[0] || 0,
                    detailIncome[1] || 0,
                    detailIncome[2] || 0,
                    detailIncome[3] || 0
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Emerald
                    'rgba(59, 130, 246, 0.7)', // Blue
                    'rgba(249, 115, 22, 0.7)', // Orange
                    'rgba(139, 92, 246, 0.7)', // Violet
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(139, 92, 246, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Datos dummy para gráfico de barras si no hay datos de horas en el modelo actual
    // Si quisieras datos reales, habría que hacer otra query de Sales filtrando por hora
    const barData = {
        labels: ['Mañana', 'Mediodía', 'Tarde', 'Noche'], 
        datasets: [
            {
                label: 'Ventas estimadas por bloque', // Placeholder visual
                data: [data.dailySalesNumberOfSales * 0.2, data.dailySalesNumberOfSales * 0.4, data.dailySalesNumberOfSales * 0.3, data.dailySalesNumberOfSales * 0.1],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
        ],
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 mt-[35px]">
                <Motion.div 
                    className="max-w-7xl mx-auto space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <Link to="/daily-sales" className="hover:text-emerald-600 flex items-center gap-1">
                                    <FaArrowLeft size={12} /> Volver a Cierres
                                </Link>
                                <span>/</span>
                                <span>Detalle</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FaReceipt className="text-emerald-600" />
                                Detalle de Cierre Diario
                            </h1>
                            <p className="text-gray-500 text-sm">Fecha: <span className="font-semibold text-gray-700">{data.dailySalesDay}</span></p>
                        </div>
                        <div className="flex gap-2">
                             <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                Estado: Cerrado
                             </span>
                        </div>
                    </div>

                    {/* KPIs Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Ventas" value={data.dailySalesTotalSales} icon={<FaMoneyBillWave />} color="emerald" prefix="$" />
                        <KPICard title="Total Abonado" value={data.dailySalesTotalIncome} icon={<FaCreditCard />} color="blue" prefix="$" />
                        <KPICard title="Pendiente" value={data.dailySalesTotalSales - data.dailySalesTotalIncome} icon={<FaReceipt />} color="orange" prefix="$" />
                        <KPICard title="N° Transacciones" value={data.dailySalesNumberOfSales} icon={<FaShoppingCart />} color="purple" isCurrency={false} />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4">Métodos de Pago</h3>
                            <div className="h-[300px] flex items-center justify-center">
                                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </Motion.div>
                        <Motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4">Distribución (Estimada)</h3>
                            <div className="h-[300px] flex items-center justify-center">
                                <Bar data={barData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </Motion.div>
                    </div>

                </Motion.div>
            </div>
        </ProtectedView>
    );
}

function KPICard({ title, value, icon, color = "gray", prefix = "", isCurrency = true }) {
    const formattedVal = isCurrency ? Number(value).toLocaleString('es-CL') : value;
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <Motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between"
        >
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900">
                    {prefix}{formattedVal}
                </h4>
            </div>
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                {icon}
            </div>
        </Motion.div>
    );
}
