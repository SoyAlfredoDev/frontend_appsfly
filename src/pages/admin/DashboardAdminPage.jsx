import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProtectedView from "../../components/ProtectedView";
import { getAdminKpis } from "../../api/admin";
import { getBusiness } from '../../api/business.js';
import formatName from '../../utils/formatName.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { FaUsers, FaBuilding, FaTicketAlt, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import { motion } from "framer-motion";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function DashboardAdminPage() {
    const [kpis, setKpis] = useState(null);
    const [business, setBusiness] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [kpiRes, businessRes] = await Promise.all([
                getAdminKpis(),
                getBusiness()
            ]);
            setKpis(kpiRes.data);
            setBusiness(businessRes.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
            setError("Error al cargar los datos del dashboard.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedView>
                <div className="flex justify-center items-center min-h-screen bg-surface">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </ProtectedView>
        );
    }

    if (error) {
        return (
            <ProtectedView>
                <div className="p-6 bg-surface min-h-screen flex justify-center items-start">
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100 max-w-2xl w-full text-center font-medium">
                        {error}
                    </div>
                </div>
            </ProtectedView>
        );
    }

    // Chart Data
    const salesData = {
        labels: kpis?.salesSeries?.map(item => item.date) || [],
        datasets: [
            {
                label: 'Ingresos Mensuales ($)',
                data: kpis?.salesSeries?.map(item => item.amount) || [],
                borderColor: '#01c676', // Primary from config
                backgroundColor: 'rgba(1, 198, 118, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#01c676',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
            },
        ],
    };

    const ticketData = {
        labels: ['Pendientes', 'Resueltos'],
        datasets: [
            {
                data: [kpis?.pendingTickets || 0, kpis?.resolvedTickets || 0],
                backgroundColor: [
                    '#fbbf24', // Amber-400 equivalent for warning/pending
                    '#01c676', // Primary for success/resolved
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff',
                ],
                borderWidth: 2,
            },
        ],
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <ProtectedView>
            <div className="min-h-screen bg-surface p-6 md:p-8 lg:p-10 font-sans">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-dark mb-2">
                            Dashboard Admin
                        </h1>
                        <p className="text-gray-500 font-medium">Bienvenido al panel de control de AppsFly</p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            to="/admin/tickets" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-secondary border border-secondary/20 rounded-xl hover:bg-secondary hover:text-white transition-all duration-300 shadow-sm font-medium group"
                        >
                            <FaTicketAlt className="text-lg group-hover:scale-110 transition-transform" />
                            <span>Tickets</span>
                        </Link>
                        <Link 
                            to="/dashboard" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-dark text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg shadow-dark/20 font-medium"
                        >
                            <span>Volver a Appsfly</span>
                            <FaArrowRight className="text-sm" />
                        </Link>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <motion.div 
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <FaUsers className="text-primary text-xl" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm text-transform uppercase tracking-wider">Usuarios</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-dark">{kpis?.totalUsers}</h2>
                                <p className="text-sm text-primary font-medium mt-1 flex items-center gap-1">
                                    <span className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-bold">+{kpis?.newUsers}</span>
                                    <span className="text-gray-400 text-xs font-normal">este mes</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-secondary/10 rounded-xl">
                                <FaMoneyBillWave className="text-secondary text-xl" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm text-transform uppercase tracking-wider">Ingresos</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-dark">${kpis?.monthlyRevenue?.toLocaleString()}</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Mensual Recurrente</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-dark/5 rounded-xl">
                                <FaBuilding className="text-dark text-xl" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm text-transform uppercase tracking-wider">Negocios</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-dark">{kpis?.totalBusinesses}</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Activos en plataforma</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <FaTicketAlt className="text-yellow-600 text-xl" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm text-transform uppercase tracking-wider">Soporte</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-dark">{kpis?.pendingTickets}</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1 flex items-center gap-1">
                                    <span>Pendientes de</span>
                                    <span className="font-bold text-dark">{kpis?.totalTickets}</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-display font-bold text-dark mb-6">Tendencia de Ingresos</h3>
                        <div className="h-80 w-full">
                            <Line 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: '#f3f4f6' },
                                            ticks: { font: { family: 'Inter' } }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { font: { family: 'Inter' } }
                                        }
                                    },
                                    plugins: {
                                        legend: { 
                                            position: 'top', 
                                            align: 'end',
                                            labels: { font: { family: 'Inter' }, usePointStyle: true, boxWidth: 8 }
                                        }
                                    }
                                }} 
                                data={salesData} 
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-display font-bold text-dark mb-6">Estado de Tickets</h3>
                        <div className="h-64 flex justify-center items-center relative">
                            <Doughnut 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    cutout: '70%',
                                    plugins: {
                                        legend: { 
                                            position: 'bottom',
                                            labels: { font: { family: 'Inter' }, padding: 20, usePointStyle: true }
                                        }
                                    }
                                }} 
                                data={ticketData} 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-display font-bold text-dark">{kpis?.totalTickets || 0}</span>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Business Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-display font-bold text-dark">Negocios Recientes</h3>
                        <button className="text-secondary text-sm font-medium hover:text-secondary/80 transition-colors">Ver todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-medium">
                                    <th className="px-6 py-4 rounded-tl-lg">Nombre</th>
                                    <th className="px-6 py-4">País</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 rounded-tr-lg text-center">Configuración</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {business.map((biz, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-dark">{biz?.businessName}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatName(biz?.businessCountry)}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {biz?.businessType === 'optics' && "Óptica"}
                                            {biz?.businessType === 'cafe' && "Cafetería"}
                                            {biz?.businessType === 'veterinary' && "Veterinaria"}
                                            {biz?.businessType === 'hair_salon' && "Peluquería"}
                                            {biz?.businessType === 'clothing_store' && "Tienda"}
                                            {biz?.businessType === 'minimarket' && "Minimarket"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {biz?.businessStatus === 'ACTIVE' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    Activo
                                                </span>
                                            )}
                                            {biz?.businessStatus === 'INACTIVE' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                    Inactivo
                                                </span>
                                            )}
                                            {biz?.businessStatus === 'PENDING' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(biz?.businessProcess?.createdBusiness &&
                                                biz?.businessProcess?.createdDBneon &&
                                                biz?.businessProcess?.stringConnectionDB &&
                                                biz?.businessProcess?.createdUserBusiness) ? (
                                                <div className="flex justify-center group relative">
                                                    <FaCheckCircle size={18} className="text-secondary cursor-help" />
                                                    <span className="absolute bottom-full mb-2 bg-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        Configuración Completa
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center group relative">
                                                    <FaExclamationCircle size={18} className="text-red-400 cursor-help" />
                                                    <span className="absolute bottom-full mb-2 bg-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        Pendiente Configuración
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </ProtectedView>
    );
}