import { useEffect, useState } from 'react';
import { getTickets } from '../../api/ticket.js';
import ProtectedView from "../../components/ProtectedView";
import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate.js';
import { FaEye, FaTrash, FaTicketAlt } from 'react-icons/fa';

export default function TicketsAdminPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchTickets = async () => {
        try {
            const response = await getTickets();
            setTickets(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        searchTickets();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RESOLVED': return <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">Resuelto</span>;
            case 'PENDING': return <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">Pendiente</span>;
            case 'IN_PROGRESS': return <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">En Progreso</span>;
            default: return <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">{status}</span>;
        }
    };

    return (
        <ProtectedView>
            <div className="p-4 bg-light min-vh-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold text-dark">🎫 Gestión de Tickets</h1>
                    <Link className="btn btn-outline-secondary" to="/admin/dashboard">
                        ⬅ Volver al Dashboard
                    </Link>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Ticket ID</th>
                                        <th>Usuario</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Cargando...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                No hay tickets registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map(ticket => (
                                            <tr key={ticket?.ticketId}>
                                                <td className="ps-4 fw-medium">
                                                    <span className="text-primary">#{ticket?.ticketNumber || ticket?.ticketId.slice(0, 8)}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2 text-primary">
                                                            <FaTicketAlt />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{ticket?.createdBy?.userFirstName} {ticket?.createdBy?.userLastName}</div>
                                                            <div className="small text-muted">{ticket?.createdBy?.userEmail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{formatDate(ticket?.createdAt)}</td>
                                                <td>{getStatusBadge(ticket?.ticketStatus)}</td>
                                                <td className="text-end pe-4">
                                                    <Link to={`/admin/tickets/${ticket?.ticketId}`} className="btn btn-sm btn-outline-primary me-2" title="Ver Detalles">
                                                        <FaEye /> Ver
                                                    </Link>
                                                    {/* <button className="btn btn-sm btn-outline-danger" title="Eliminar">
                                                        <FaTrash />
                                                    </button> */}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedView>
    );
}