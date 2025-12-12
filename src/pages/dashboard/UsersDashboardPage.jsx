// src/pages/dashboard/UsersDashboardPage.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { getMonthlySalesNow, getDaySales, countSalesMonthRequest } from '../../api/sale.js';
import { calculateTotalAvailableByPaymentMethod } from '../../utils/financeUtils.js';
import { useAuth } from '../../context/authContext.jsx';

import KpiComponent from '../../components/KpiComponent.jsx';

// 🎨 ICONOS A COLOR (flat icons)
import {
    FcSalesPerformance,
    FcLineChart,
    FcDebt,
    FcMoneyTransfer,
    FcTimeline,
    FcRatings,
    FcPlus,
    FcCalendar,
    FcCurrencyExchange,
    FcBearish,
    FcSupport,
    FcKey
} from "react-icons/fc";

export default function UsersDashboardPage() {

    const { isSuperAdmin } = useAuth();

    const [monthlySales, setMonthlySales] = useState(null);
    const [salePendingAmount, setSalePendingAmount] = useState(null);
    const [daySales, setDaySales] = useState(null);
    const [cashAvailable, setCashAvailable] = useState(null);
    const [countSalesMonth, setCountSalesMonth] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const day = new Date().getDate();
            try {
                const resMonth = await getMonthlySalesNow();
                setMonthlySales(resMonth.data.saleTotal);
                setSalePendingAmount(resMonth.data.salePendingAmount);
            } catch (error) {
                console.error("Error al obtener las ventas mensuales:", error);
            }
            try {
                const resDay = await getDaySales(day, month, year);
                setDaySales(resDay.data);
            } catch (error) {
                console.error("Error al obtener las ventas del dia:", error);
            }
            try {
                const totalCash = await calculateTotalAvailableByPaymentMethod(2);
                setCashAvailable(totalCash);
            } catch (error) {
                console.error("Error al obtener el total de efectivo disponible:", error);
            }
            try {
                const countSalesMonth = await countSalesMonthRequest(month, year);
                setCountSalesMonth(countSalesMonth.data);
            } catch (error) {
                console.error("Error al obtener el conteo de ventas mensuales:", error);
            }
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-3font-montserrat"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h2 variants={itemVariants} className="mb-8 text-2xl font-bold text-gray-800 border-l-4 border-green-600 pl-4">
                Dashboard Administrador
            </motion.h2>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-10">
                {/* VENTAS DEL DÍA */}
                <KpiComponent
                    title="Ventas del Día"
                    icon={<FcSalesPerformance />}
                    value={daySales}
                    footer="Ventas realizadas hoy"
                    loading={loading}
                />

                <KpiComponent
                    title="Ingresos del Día"
                    icon={<FcTimeline size={38} />}
                    value={daySales}
                    footer="Ventas realizadas hoy"
                    loading={loading}
                />

                {/* VENTAS DEL MES */}
                <KpiComponent
                    title="Ventas del Mes"
                    icon={<FcLineChart />}
                    value={monthlySales}
                    footer="Acumulado mensual"
                    loading={loading}
                />

                {/* POR COBRAR */}
                <KpiComponent
                    title="Por Cobrar"
                    icon={<FcDebt />}
                    value={salePendingAmount}
                    footer="Pendientes de pago"
                    loading={loading}
                />

                {/* EFECTIVO DISPONIBLE */}
                <KpiComponent
                    title="Efectivo Disponible"
                    icon={<FcMoneyTransfer />}
                    value={cashAvailable}
                    footer="Caja disponible"
                    loading={loading}
                />

                {/* CANTIDAD DE VENTAS  */}
                <KpiComponent
                    title="Nº de Ventas"
                    icon={<FcRatings />}
                    value={countSalesMonth}
                    footer="0 % mas que el mes pasado"
                    loading={loading}
                    isCurrency={false}
                />
            </motion.div>

            <motion.hr variants={itemVariants} className="my-8 border-gray-200" />

            <motion.h5 variants={itemVariants} className="mb-6 text-xl font-semibold text-gray-700 flex items-center gap-2">
                ⚡ Accesos Rápidos
            </motion.h5>

            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <QuickAccessLink to="/sales/register" label="Nueva Venta" colorClass="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" icon={<FcPlus />} />
                <QuickAccessLink to="/sales/dailySales" label="Cierre Diario" colorClass="bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200" icon={<FcCalendar />} />
                <QuickAccessLink to="/transactions" label="Transacciones" colorClass="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" icon={<FcCurrencyExchange />} />
                <QuickAccessLink to="/expenses" label="Gastos" colorClass="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" icon={<FcBearish />} />
                <QuickAccessLink to="/support" label="Soporte Técnico" colorClass="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200" icon={<FcSupport />} />
            </motion.div>

            {isSuperAdmin && (
                <>
                    <motion.hr variants={itemVariants} className="my-8 border-gray-200" />
                    <motion.h5 variants={itemVariants} className="mb-6 text-xl font-semibold text-gray-700 flex items-center gap-2">
                        👑 Accesos Super Admin
                    </motion.h5>
                    <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <QuickAccessLink to="/admin/dashboard" label="Administración" colorClass="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200" icon={<FcKey />} />
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}

function QuickAccessLink({ to, label, colorClass, icon }) {
    return (
        <Link to={to} className="no-underline">
            <motion.div
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center h-full shadow-sm hover:shadow-md ${colorClass}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="text-3xl filter drop-shadow-sm">
                    {icon}
                </div>
                <span className="font-semibold text-sm">{label}</span>
            </motion.div>
        </Link>
    );
}
