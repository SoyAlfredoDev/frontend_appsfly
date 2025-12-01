// src/pages/dashboard/UsersDashboardPage.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { getMonthlySalesNow, getDaySales } from '../../api/sale.js';
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
    FcRatings
} from "react-icons/fc";

export default function UsersDashboardPage() {

    const { isSuperAdmin } = useAuth();

    const [monthlySales, setMonthlySales] = useState(null);
    const [salePendingAmount, setSalePendingAmount] = useState(null);
    const [daySales, setDaySales] = useState(null);
    const [cashAvailable, setCashAvailable] = useState(null);

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

            const resMonth = await getMonthlySalesNow();
            setMonthlySales(resMonth.data.saleTotal);
            setSalePendingAmount(resMonth.data.salePendingAmount);

            const resDay = await getDaySales(day, month, year);
            setDaySales(resDay.data);

            const totalCash = await calculateTotalAvailableByPaymentMethod(2);
            setCashAvailable(totalCash);

        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 fw-bold text-dark">Dashboard Administrador</h2>
            <div className="row g-3 mt-1 mb-4 center">
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
                    value={'-'}
                    footer="0 % mas que el mes pasado"
                    loading={loading}
                />
            </div>
            <hr className='mt-5' />
            <h5 className="mb-3">⚡ Accesos Rápidos</h5>
            <div className="d-flex gap-2 flex-wrap pb-5">
                <Link className="btn btn-sm btn-success" style={{ width: "200px" }} to="/sales/register">➕ Venta</Link>
                <Link className="btn btn-sm btn-info" style={{ width: "200px" }} to="/sales/dailySales">📅 Cierre Diario</Link>
                <Link className="btn btn-sm btn-primary" style={{ width: "200px" }} to="/transactions">💳 Transacciones</Link>
                <Link className="btn btn-sm btn-warning" style={{ width: "200px" }} to="/expenses">🧾 Gastos</Link>
                <Link className="btn btn-sm btn-dark" style={{ width: "200px" }} to="/support"> Soporte Técnico</Link>
            </div>

            {
                isSuperAdmin && (
                    <>
                        <hr className='mt-5' />
                        <h5 className="mb-3">👑 Accesos Super Admin</h5>
                        <Link className="btn btn-sm btn-success" style={{ width: "200px" }} to="/admin">Administración</Link>
                    </>
                )
            }
        </div>
    );
}
