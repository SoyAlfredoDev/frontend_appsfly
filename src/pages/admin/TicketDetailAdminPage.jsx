import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketById } from '../../api/ticket.js';
import ProtectedView from "../../components/ProtectedView";
import formatDate from '../../utils/formatDate.js';
import { FaUser, FaHeadset, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function TicketDetailAdminPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await getTicketById(id);
                setTicket(response.data);
            } catch (err) {
                console.error(err);
                setError("Error al cargar el ticket.");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    if (loading) return (
        <ProtectedView>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        </ProtectedView>
    );

    if (error) return (
        <ProtectedView>
            <div className="alert alert-danger m-4">{error}</div>
        </ProtectedView>
    );

    if (!ticket) return (
        <ProtectedView>
            <div className="alert alert-warning m-4">Ticket no encontrado.</div>
        </ProtectedView>
    );

    return (
        <ProtectedView>
            <div className="p-4 bg-light min-vh-100">
                <div className="mb-4">
                    <Link to="/admin/tickets" className="btn btn-link text-decoration-none text-secondary ps-0 mb-2">
                        <FaArrowLeft className="me-2" /> Volver a Tickets
                    </Link>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="fw-bold mb-1">Ticket #{ticket.ticketNumber || ticket.ticketId.slice(0, 8)}</h2>
                            <span className={`badge ${ticket.ticketStatus === 'RESOLVED' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 rounded-pill`}>
                                {ticket.ticketStatus === 'RESOLVED' ? <><FaCheckCircle className="me-1"/> Resuelto</> : <><FaClock className="me-1"/> {ticket.ticketStatus}</>}
                            </span>
                        </div>
                        <div className="text-end text-muted">
                            <small>Creado el {formatDate(ticket.createdAt)}</small>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Sidebar Info */}
                    <div className="col-md-4 order-md-2">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white fw-bold py-3">Información del Cliente</div>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary">
                                        <FaUser size={24} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{ticket.createdBy?.userFirstName} {ticket.createdBy?.userLastName}</h6>
                                        <small className="text-muted">{ticket.createdBy?.userEmail}</small>
                                    </div>
                                </div>
                                <hr />
                                <div className="mb-2">
                                    <strong>Teléfono:</strong> <span className="text-muted">{ticket.createdBy?.userPhoneNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat / Timeline */}
                    <div className="col-md-8 order-md-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white fw-bold py-3">Historial de Conversación</div>
                            <div className="card-body bg-light" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <div className="d-flex flex-column gap-3">
                                    {/* Mensaje inicial del ticket (si existiera como detalle o descripción) */}
                                    {/* Asumimos que los detalles son la conversación */}
                                    {ticket.ticketDetails && ticket.ticketDetails.length > 0 ? (
                                        ticket.ticketDetails.map((detail) => {
                                            const isSupport = detail.ticketDetailOrigin === 'APPSFLY'; // Asumiendo que hay un campo para distinguir o usando el rol del usuario
                                            // Si no hay campo origin, podemos intentar inferirlo o usar el createdByUserId vs ticket.createdByUserId
                                            // Pero el usuario pidió "Indicadores visuales para distinguir".
                                            // Usaremos ticketDetailOrigin que vi en el schema.prisma: CUSTOMER, APPSFLY
                                            
                                            const isAppsFly = detail.ticketDetailOrigin === 'APPSFLY';

                                            return (
                                                <div key={detail.ticketDetailId} className={`d-flex ${isAppsFly ? 'justify-content-end' : 'justify-content-start'}`}>
                                                    <div className={`card border-0 shadow-sm ${isAppsFly ? 'bg-primary text-white' : 'bg-white'}`} style={{ maxWidth: '80%' }}>
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center mb-2">
                                                                {isAppsFly ? (
                                                                    <small className="fw-bold me-2">Soporte AppsFly</small>
                                                                ) : (
                                                                    <small className="fw-bold me-2 text-primary">{ticket.createdBy?.userFirstName}</small>
                                                                )}
                                                                <small className={`ms-auto ${isAppsFly ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                                    {formatDate(detail.createdAt)}
                                                                </small>
                                                            </div>
                                                            <p className="mb-0">{detail.ticketDetailContent}</p>
                                                            {detail.ticketDetailImage && detail.ticketDetailImage.length > 0 && (
                                                                <div className="mt-2">
                                                                    {detail.ticketDetailImage.map((img, idx) => (
                                                                        <img key={idx} src={img} alt="Adjunto" className="img-fluid rounded mt-1" style={{ maxHeight: '200px' }} />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            No hay mensajes en este ticket.
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Input Area (Visual only for now as requested backend update was for reading) */}
                            {/* <div className="card-footer bg-white p-3">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Escribe una respuesta..." />
                                    <button className="btn btn-primary">
                                        <FaPaperPlane /> Enviar
                                    </button>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedView>
    );
}
