import { Link } from 'react-router-dom';
import { getMonthlySalesNow, getDaySales } from '../../api/sale.js'
import { calculateTotalAvailableByPaymentMethod } from '../../utils/financeUtils.js';
import { useEffect, useState } from 'react';

export default function UsersDashboardPage() {
    const [monthlySales, setMonthlySales] = useState(null); // null para saber si aún no se cargó
    const [salePendingAmount, setSalePendingAmount] = useState(null);
    const [daySales, setDaySales] = useState(null);
    const [loading, setLoading] = useState(true); // estado de carga
    const [cashAvailable, setCashAvailable] = useState(null);

    useEffect(() => {
        searchMonthlySales();
        fetchTotalAvailable();

    }, []);

    const fetchTotalAvailable = async () => {
        const total = await calculateTotalAvailableByPaymentMethod(2);
        setCashAvailable(total);
    };

    const searchMonthlySales = async () => {
        try {
            setLoading(true);
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const res = await getMonthlySalesNow()
            setMonthlySales(res.data.saleTotal);
            setSalePendingAmount(res.data.salePendingAmount);
            const day = new Date().getDate();
            const resDay = await getDaySales(day, month, year);
            setDaySales(resDay.data);
            setLoading(false);
        } catch (error) {
            console.error("(UsersDashboardPage.jsx): Error fetching sales data:", error);
        }
    };

    // Función para mostrar datos o loader
    const renderValue = (value, color = 'success') => {
        if (loading || value === null) {
            return <span className={`text-${color}`}>⏳ Cargando...</span>;
        }
        return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
    }

    return (
        <div>
            <div className="row align-items-center mb-0">
                <div className="col-md-8">
                    <h2 className="mb-4 fw-bold text-dark">📊 Dashboard Administrador</h2>
                </div>
            </div>

            {/* Tarjetas resumen */}
            <div className="row g-3 mt-1 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ventas del Día</h6>
                        <span className="h4 text-success fw-bold">{renderValue(daySales, 'success')}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ingresos del Día</h6>
                        <span className="h4 text-success fw-bold">{renderValue(daySales, 'success')}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ventas del Mes</h6>
                        <span className="h4 text-success fw-bold">{renderValue(monthlySales, 'success')}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Por Cobrar</h6>
                        <span className="h4 text-warning fw-bold">{renderValue(salePendingAmount, 'warning')}</span>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Gastos Mes </h6>
                        <span className="h4 text-success fw-bold">{renderValue(0, 'success')}</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Efectivo Disponible</h6>
                        <span className="h4 text-warning fw-bold">{renderValue(cashAvailable, 'warning')}</span>
                    </div>
                </div>
            </div>
            <hr />
            {/* Accesos rápidos */}
            <h5 className="mb-3">⚡ Accesos Rápidos</h5>
            <div className="d-flex gap-2 flex-wrap">
                <Link className="btn btn-success mt-2" style={{ 'width': '200px' }} to="/sales/register">➕ Venta</Link>
                <Link className="btn btn-info mt-2" style={{ 'width': '200px' }} to="/sales/dailySales">📅 Cierre Diario</Link>
                <Link className="btn btn-primary mt-2" style={{ 'width': '200px' }} to="/transactions">💳 Transacciones</Link>
                <Link className="btn btn-secondary mt-2" style={{ 'width': '200px' }} to="/finance">💰 Finanzas</Link>
                <Link className="btn btn-warning mt-2" style={{ 'width': '200px' }} to="/expenses">🧾 Gastos</Link>
            </div>
        </div>
    );
}
