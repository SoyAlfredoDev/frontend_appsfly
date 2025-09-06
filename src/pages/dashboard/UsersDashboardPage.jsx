import { Link } from 'react-router-dom';
import { getMonthlySales, getDaySales } from '../../api/sale.js'
import { useEffect, useState } from 'react';

export default function UsersDashboardPage() {
    const [monthlySales, setMonthlySales] = useState(null); // null para saber si aún no se cargó
    const [salePendingAmount, setSalePendingAmount] = useState(null);
    const [daySales, setDaySales] = useState(null);
    const [loading, setLoading] = useState(true); // estado de carga

    useEffect(() => {
        searchMonthlySales();
    }, []);

    const searchMonthlySales = async () => {
        setLoading(true);
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const res = await getMonthlySales(month, year);

        setMonthlySales(res.data.saleTotal);
        setSalePendingAmount(res.data.salePendingAmount);

        const day = new Date().getDate();
        const resDay = await getDaySales(day, month, year);
        setDaySales(resDay.data);

        setLoading(false);
    }

    // Función para mostrar datos o loader
    const renderValue = (value, color = 'success') => {
        if (loading || value === null) {
            return <span className={`text-${color}`}>⏳ Cargando...</span>;
        }
        return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
    }

    return (
        <div>
            <div className="row align-items-center mb-2">
                <div className="col-md-8">
                    <h1 className="mb-4 fw-bold text-dark">📊 Dashboard Administrador</h1>
                </div>
            </div>

            {/* Tarjetas resumen */}
            <div className="row g-3 mt-3 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ventas del Día</h6>
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
            </div>

            <hr />

            {/* Accesos rápidos */}
            <h5 className="mb-3">⚡ Accesos Rápidos</h5>
            <div className="d-flex gap-2 flex-wrap">
                <Link className="btn btn-success" to="/sales/register">➕ Nueva Venta</Link>
            </div>
        </div>
    );
}
