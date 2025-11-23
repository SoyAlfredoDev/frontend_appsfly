import { Link } from "react-router-dom";
import { getBusiness } from '../../api/business.js'
import { useState, useEffect } from "react";
import formatName from '../../utils/formatName.js'
import ProtectedView from "../../components/ProtectedView";


export default function DashboardAdminPage() {
    const [business, setBusiness] = useState([]);
    useEffect(() => {
        foundBusiness();
    }, []);
    const foundBusiness = async () => {
        try {
            const response = await getBusiness();
            console.log('Business data:', response.data);
            setBusiness(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching business data:', error);
        }
    }
    return (
        <ProtectedView>
            <div className="p-4 bg-light min-vh-100">
                <h1 className="mb-4 fw-bold text-dark">📊 Dashboard Administrador</h1>

                {/* Tarjetas resumen */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 p-3 text-center">
                            <h6 className="text-muted">Usuarios Activos</h6>
                            <span className="h4 text-success fw-bold">321</span>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 p-3 text-center">
                            <h6 className="text-muted">Business</h6>
                            <span className="h4 text-success fw-bold">120</span>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 p-3 text-center">
                            <h6 className="text-muted">Por Cobrar</h6>
                            <span className="h4 text-warning fw-bold">$2.300.000</span>
                        </div>
                    </div>
                </div>
                <hr />

                <h3>Tabla de Negocios</h3>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre del Negocio</th>
                                <th>Pais</th>
                                <th>tipo</th>
                                <th>Status</th>
                                <th>process</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                business.map((biz, index) => (
                                    <tr key={index}>
                                        <td>{biz?.businessName}</td>
                                        <td>
                                            {formatName(biz?.businessCountry)}
                                        </td>
                                        <td>

                                            {biz?.businessType === 'optics' && "Óptica"}
                                            {biz?.businessType === 'cafe' && "Cafetería / restaurante"}
                                            {biz?.businessType === 'veterinary' && "Veterinaria"}
                                            {biz?.businessType === 'hair_salon' && "Peluquería / barbería"}
                                            {biz?.businessType === 'clothing_store' && "Tienda"}
                                            {biz?.businessType === 'minimarket' && "Minimarket"}
                                        </td>
                                        <td>
                                            {biz?.businessStatus === 'ACTIVE' && <span className="badge bg-success">Activo</span>}
                                            {biz?.businessStatus === 'INACTIVE' && <span className="badge bg-secondary">Inactivo</span>}
                                            {biz?.businessStatus === 'PENDING' && <span className="badge bg-warning text-dark">Pendiente</span>}

                                        </td>
                                        <td>
                                            <div>
                                                {(
                                                    biz?.businessProcess?.createdBusiness ||
                                                    biz?.businessProcess?.createdDBneon ||
                                                    biz?.businessProcess?.stringConnectionDB ||
                                                    biz?.businessProcess?.createdUserBusiness
                                                ) ? (
                                                    <span className="badge text-success"><i className="bi bi-check-circle-fill"></i></span>
                                                ) : (
                                                    <span className="badge text-danger"><i className="bi bi-x-circle-fill"></i></span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <hr />
                {/* Accesos rápidos */}
                <h5 className="mb-3">⚡ Accesos Rápidos</h5>
                <div className="d-flex gap-2 flex-wrap">
                    <Link className="btn btn-primary" to="/admin/dashboard">🏠 Dashboard</Link>
                    <Link className="btn btn-dark" to="/admin/users">👤 Usuarios</Link>
                    <Link className="btn btn-secondary" to="/dashboard">⚙️ Volver</Link>
                </div>
            </div>
        </ProtectedView>
    );
}