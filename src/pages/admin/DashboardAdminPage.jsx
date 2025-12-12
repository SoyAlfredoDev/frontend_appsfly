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
import { FaUsers, FaBuilding, FaTicketAlt, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

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
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </ProtectedView>
        );
    }

    if (error) {
        return (
            <ProtectedView>
                <div className="alert alert-danger m-4" role="alert">
                    {error}
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
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const ticketData = {
        labels: ['Pendientes', 'Resueltos'],
        datasets: [
            {
                data: [kpis?.pendingTickets || 0, kpis?.resolvedTickets || 0],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <ProtectedView>
            <div className="p-4 bg-light min-vh-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold text-dark">📊 Dashboard Administrador</h1>
                    <div className="d-flex gap-2">
                        <Link className="btn btn-outline-primary" to="/admin/tickets">
                            <FaTicketAlt className="me-2" /> Tickets
                        </Link>
                        <Link className="btn btn-outline-secondary" to="/dashboard">
                            ⚙️ Volver Appsfly
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaUsers className="text-primary fs-3" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Total Usuarios</h6>
                                    <h3 className="fw-bold mb-0">{kpis?.totalUsers}</h3>
                                    <small className="text-success">+{kpis?.newUsers} este mes</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaMoneyBillWave className="text-success fs-3" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Ingresos Mes</h6>
                                    <h3 className="fw-bold mb-0">${kpis?.monthlyRevenue?.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaBuilding className="text-info fs-3" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Negocios</h6>
                                    <h3 className="fw-bold mb-0">{kpis?.totalBusinesses}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaTicketAlt className="text-warning fs-3" />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Tickets Pendientes</h6>
                                    <h3 className="fw-bold mb-0">{kpis?.pendingTickets}</h3>
                                    <small className="text-muted">de {kpis?.totalTickets} totales</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="row g-4 mb-5">
                    <div className="col-md-8">
                        <div className="card shadow-sm border-0 h-100 p-3">
                            <h5 className="card-title mb-4">Tendencia de Ingresos</h5>
                            <div style={{ height: '300px' }}>
                                <Line options={{ responsive: true, maintainAspectRatio: false }} data={salesData} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100 p-3">
                            <h5 className="card-title mb-4">Estado de Tickets</h5>
                            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                                <Doughnut options={{ responsive: true, maintainAspectRatio: false }} data={ticketData} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Table */}
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0">Negocios Recientes</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nombre</th>
                                    <th>País</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Proceso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {business.map((biz, index) => (
                                    <tr key={index}>
                                        <td className="fw-medium">{biz?.businessName}</td>
                                        <td>{formatName(biz?.businessCountry)}</td>
                                        <td>
                                            {biz?.businessType === 'optics' && "Óptica"}
                                            {biz?.businessType === 'cafe' && "Cafetería"}
                                            {biz?.businessType === 'veterinary' && "Veterinaria"}
                                            {biz?.businessType === 'hair_salon' && "Peluquería"}
                                            {biz?.businessType === 'clothing_store' && "Tienda"}
                                            {biz?.businessType === 'minimarket' && "Minimarket"}
                                        </td>
                                        <td>
                                            {biz?.businessStatus === 'ACTIVE' && <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">Activo</span>}
                                            {biz?.businessStatus === 'INACTIVE' && <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">Inactivo</span>}
                                            {biz?.businessStatus === 'PENDING' && <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">Pendiente</span>}
                                        </td>
                                        <td>
                                            {(biz?.businessProcess?.createdBusiness &&
                                                biz?.businessProcess?.createdDBneon &&
                                                biz?.businessProcess?.stringConnectionDB &&
                                                biz?.businessProcess?.createdUserBusiness) ? (
                                                <span className="text-success" title="Completado">
                                                    <FaCheckCircle size={20} />
                                                </span>
                                            ) : (
                                                <span className="text-danger" title="Incompleto">
                                                    <FaExclamationCircle size={20} />
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedView>
    );
}