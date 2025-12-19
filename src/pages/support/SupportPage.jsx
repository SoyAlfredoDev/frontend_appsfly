import { useState, useEffect } from "react";
import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import { useAuth } from "../../context/authContext.jsx";
import { createTicket, getTickets } from "../../api/ticket.js";
import { createTicketDetail } from "../../api/ticketDetail.js";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaSpinner, FaHistory, FaCheckCircle, FaExclamationCircle, FaPlus, FaCloudUploadAlt, FaTimes } from "react-icons/fa";


export default function SupportPage() {
    const { user, business } = useAuth();
    
    // --- Estado para Listado de Tickets ---
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);

    // --- Estado para Creación de Tickets ---
    const initialFormData = {
        subject: "",
        ticketType: "SUPPORT",
        description: "",
        ticketAssociatedTo: []
    };
    const [formData, setFormData] = useState(initialFormData);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Initial load
    useEffect(() => {
        // Pre-seleccionar asociaciones por defecto
        if (user && business) {
            setFormData(prev => ({
                ...prev,
                ticketAssociatedTo: [user.userId, business.businessId]
            }));
        }
        fetchTickets();
    }, [user, business]);

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const res = await getTickets();
            // Asumiendo que res.data es el array de tickets
            setTickets(res.data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    // --- Manejo de Formulario ---
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFileToUpload(e.target.files[0]);
    };

    const handleRemoveFile = () => {
        setFileToUpload(null);
    };

    const toggleAssociation = (id) => {
        setFormData(prev => {
            const current = prev.ticketAssociatedTo;
            if (current.includes(id)) {
                return { ...prev, ticketAssociatedTo: current.filter(item => item !== id) };
            } else {
                return { ...prev, ticketAssociatedTo: [...current, id] };
            }
        });
    };

    // --- Lógica Cloudinary (Reutilizada y simplificada) ---
    const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    const uploadImage = async (ticketId) => {
        if (!fileToUpload) return null;
        
        const data = new FormData();
        data.append('file', fileToUpload);
        data.append('upload_preset', upload_preset);
        data.append('folder', 'tickets_support');
        data.append('public_id', `ticket-${ticketId}`); // Usar ID del ticket para unicidad relativa

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Error subiendo imagen");
            return json.secure_url;
        } catch (error) {
            console.error("Cloudinary Error:", error);
            throw error;
        }
    };

    // --- Envio del Formulario ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (formData.ticketAssociatedTo.length === 0) {
            setErrorMsg("Debes asociar el ticket al menos a tu usuario o negocio.");
            return;
        }
        if (!formData.description.trim() || !formData.subject.trim()) {
            setErrorMsg("Por favor completa el asunto y la descripción.");
            return;
        }

        setLoadingSubmit(true);

        try {
            // 1. Crear Ticket principal
            // Combinar Asunto en la primera linea de la descripción inicial si el backend no soporta 'subject'
            // Ojo: Si el backend createTicket NO recibe 'subject', lo ignorará. 
            // Lo más seguro es que el primer Mensaje (Detalle) contenga el Asunto + Descripción.
            
            const ticketRes = await createTicket({
                ticketAssociatedTo: formData.ticketAssociatedTo,
                ticketType: formData.ticketType,
                // Si el backend soporta subject en ticket, se envia. Si no, no pasa nada.
                ticketSubject: formData.subject 
            });

            if (ticketRes.status !== 201) throw new Error("Error al iniciar el ticket.");
            const createdTicketId = ticketRes.data.ticketId;

            // 2. Subir imagen si existe
            let imageUrl = null;
            if (fileToUpload) {
                try {
                    imageUrl = await uploadImage(createdTicketId);
                } catch (imgErr) {
                    console.warn("Fallo subida imagen", imgErr);
                    // No bloqueamos, pero avisamos? O seguimos sin imagen.
                    // Decisión: Seguir con el ticket pero avisar en consola.
                }
            }

            // 3. Crear Detalle (El mensaje inicial)
            // Combinamos Subject + Description para que se vea claro en el chat
            const fullContent = `[ASUNTO: ${formData.subject}]\n\n${formData.description}`;

            const detailRes = await createTicketDetail({
                ticketId: createdTicketId,
                ticketAssociatedTo: formData.ticketAssociatedTo, // El creador del mensaje (detalle) es el usuario
                ticketDetailContent: fullContent,
                ticketDetailImage: imageUrl ? [imageUrl] : [],
                ticketDetailOrigin: 'CUSTOMER'
            });

            if (detailRes.status === 201) {
                setSuccessMsg("¡Ticket creado exitosamente! Nuestro equipo te contactará pronto.");
                setFormData(prev => ({ ...initialFormData, ticketAssociatedTo: prev.ticketAssociatedTo })); // Resetear pero mantener asociaciones
                setFileToUpload(null);
                fetchTickets(); // Recargar lista
            } else {
                throw new Error("Error al guardar el detalle del ticket.");
            }

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "Ocurrió un error inesperado.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    // --- Renderizado ---

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50 pt-[100px] pb-12 px-4 sm:px-6 lg:px-8">
                <Motion.div 
                    className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    
                    {/* --- COLUMNA IZQUIERDA: FORMULARIO (lg:col-span-5) --- */}
                    <div className="lg:col-span-5 space-y-6">
                        <Motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaPlus className="text-blue-600" /> Nuevo Ticket
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Describe tu problema o solicitud y te ayudaremos lo antes posible.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* TIPO */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                                    <select
                                        name="ticketType"
                                        value={formData.ticketType}
                                        onChange={handleOnChange}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    >
                                        <option value="SUPPORT">Soporte Técnico</option>
                                        <option value="SUGGESTION">Sugerencia</option>
                                        <option value="REQUEST">Solicitud Comercial / Otro</option>
                                    </select>
                                </div>

                                {/* ASUNTO */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleOnChange}
                                        placeholder="Ej: Problema con la facturación..."
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        required
                                    />
                                </div>

                                {/* DESCRIPCIÓN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleOnChange}
                                        rows={5}
                                        placeholder="Explica detalladamente lo que sucede..."
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                        required
                                    />
                                </div>

                                {/* ADJUNTOS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Imagen (Opcional)</label>
                                    {!fileToUpload ? (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer relative bg-gray-50 hover:bg-white group">
                                            <div className="space-y-1 text-center">
                                                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                        <span>Subir un archivo</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            <span className="text-sm text-blue-700 truncate max-w-[200px]">{fileToUpload.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveFile}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ASOCIACIONES (Checkboxes simplificados) */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">Asociar a:</span>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.ticketAssociatedTo.includes(user?.userId)}
                                                onChange={() => toggleAssociation(user?.userId)}
                                                className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">Mi Usuario ({user?.userFirstName})</span>
                                        </label>
                                        {business && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.ticketAssociatedTo.includes(business?.businessId)}
                                                    onChange={() => toggleAssociation(business?.businessId)}
                                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">Mi Negocio ({business?.businessName})</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* MENSAJES DE ESTADO */}
                                <AnimatePresence>
                                    {errorMsg && (
                                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                                            <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                                            {errorMsg}
                                        </Motion.div>
                                    )}
                                    {successMsg && (
                                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-start gap-2">
                                            <FaCheckCircle className="mt-0.5 flex-shrink-0" />
                                            {successMsg}
                                        </Motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loadingSubmit}
                                    className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingSubmit ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Creando Ticket...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane /> Enviar Ticket
                                        </>
                                    )}
                                </button>
                            </form>
                        </Motion.div>
                    </div>

                    {/* --- COLUMNA DERECHA: LISTADO (lg:col-span-7) --- */}
                    <div className="lg:col-span-7">
                        <Motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[800px]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FaHistory className="text-gray-500" /> Historial de Tickets
                                </h3>
                                <button 
                                    onClick={fetchTickets} 
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Actualizar
                                </button>
                            </div>

                            <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
                                {loadingTickets ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <FaSpinner className="animate-spin text-2xl mb-2" />
                                        <p>Cargando tickets...</p>
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6 text-center">
                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <FaPaperPlane className="text-xl text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-600">No has creado ningún ticket aún.</p>
                                        <p className="text-sm mt-1">Usa el formulario para contactar a soporte.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Ticket #</th>
                                                <th className="px-6 py-4 font-semibold">Estado</th>
                                                <th className="px-6 py-4 font-semibold">Tipo</th>
                                                <th className="px-6 py-4 font-semibold text-right">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {tickets.map((ticket) => (
                                                <tr key={ticket.ticketId || ticket.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-gray-900 font-medium">
                                                            {ticket.ticketNumber || ticket.ticketId?.slice(0, 8)}
                                                        </span>
                                                        {ticket.ticketSubject && (
                                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{ticket.ticketSubject}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                            ${ticket.ticketStatus === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 
                                                              ticket.ticketStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                                              'bg-green-100 text-green-800'}`}>
                                                            {ticket.ticketStatus === 'PENDING' ? 'Pendiente' : 
                                                             ticket.ticketStatus === 'CLOSED' ? 'Cerrado' : 'Abierto'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {ticket.ticketType === 'SUPPORT' ? 'Soporte' : 
                                                         ticket.ticketType === 'SUGGESTION' ? 'Sugerencia' : 'Solicitud'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                        {new Date(ticket.createdAt || Date.now()).toLocaleDateString("es-CL")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </Motion.div>
                    </div>

                </Motion.div>
            </div>
        </ProtectedView>
    );
}