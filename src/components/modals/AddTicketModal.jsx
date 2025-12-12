import { useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { Modal } from "bootstrap"; 
import { useAuth } from "../../context/AuthContext.jsx";
import { createTicket} from '../../api/ticket.js'
import {createTicketDetail}from '../../api/ticketDetail.js'

export default function AddTicketModal() {
    const { business, user } = useAuth();
    const [fileToUpload, setFileToUpload] = useState(null);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

    const initialFormData = {
        ticketDetailContent: "",
        ticketAssociatedTo: [], // 🎯 CAMBIO CLAVE: Inicializado como un array
        ticketType: 'SUPPORT',
    };
    const [formData, setFormData] = useState(initialFormData);

    // --- Configuración de Cloudinary (se mantiene igual) ---
    const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const temp_folder = 'tickets_support';
    const upload_url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    const resetForm = () => {
        setFormData(initialFormData);
        setFileToUpload(null);
    };

    // Manejo del archivo (se mantiene igual)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileToUpload(file);
    };

    // --- Manejo de Cambios para Inputs/Checkboxs CORREGIDO ---
    const handleOnChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name === 'ticketAssociatedTo') {
            // Lógica para añadir o quitar un ID del array
            setFormData((prevData) => {
                const currentArray = prevData.ticketAssociatedTo;
                let newArray;

                if (checked) {
                    // Si está marcado, añadir el valor si no está ya
                    newArray = [...currentArray, value];
                } else {
                    // Si está desmarcado, filtrar (quitar) el valor
                    newArray = currentArray.filter(id => id !== value);
                }

                return {
                    ...prevData,
                    [name]: newArray,
                };
            });
        } else {
            // Manejo normal para inputs de texto/select
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    }
    
    // --- Lógica de Subida a Cloudinary (se mantiene igual, usando el ticketId) ---
    const cloudinaryUpload = async (ticketId) => {
        // ... (Tu lógica de subida a Cloudinary aquí, devolviendo la URL)
        if (!fileToUpload || !ticketId) return null;

        const dataImgCloudinary = new FormData();
        dataImgCloudinary.append('file', fileToUpload);
        dataImgCloudinary.append('upload_preset', upload_preset);
        dataImgCloudinary.append('folder', temp_folder);

        const uniquePublicId = `ticket-${ticketId}`;
        dataImgCloudinary.append('public_id', uniquePublicId);

        try {
            const response = await fetch(upload_url, {
                method: 'POST',
                body: dataImgCloudinary,
            });

            if (!response.ok) { 
                const errorBody = await response.json();
                console.error('Error de Cloudinary:', errorBody);
                throw new Error('Error al subir la imagen a Cloudinary: ' + response.status);
            }

            const res = await response.json();
            return res.secure_url; 
        } catch (error) {
            console.error('Error durante la subida:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
            return null;
        }
    };
    
    // --- Manejo del Submit (Ajustado para Array) ---
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        console.log('formData',formData)
        setLoading(true);

        // --- 1. Validaciones AJUSTADA: Verificar que el array no esté vacío ---
        if (formData.ticketAssociatedTo.length === 0) {
            alert('Debe seleccionar al menos un asociado (usuario o negocio)');
            setLoading(false);
            return;
        }
        if (formData.ticketDetailContent.trim() === '') {
            alert('Debe agregar un detalle');
            setLoading(false);
            return;
        }

        let imageUrl = null;
        let createdTicketId;

        try {
            // --- 2. Crear el Ticket (Obtener ID) ---
            const ticketRes = await createTicket({
                // Envía el array al backend
                ticketAssociatedTo: formData.ticketAssociatedTo, 
                ticketType: formData.ticketType,
            });

            if (ticketRes.status !== 201 || !ticketRes.data || !ticketRes.data.ticketId) {
                throw new Error('Error al crear el ticket principal');
            }
            
            createdTicketId = ticketRes.data.ticketId;

            // --- 3. Subir la Imagen (SI existe) ---
            if (fileToUpload) {
                const uploadResultUrl = await cloudinaryUpload(createdTicketId);
                if (!uploadResultUrl) {
                    throw new Error("La subida de la imagen falló.");
                }
                imageUrl = uploadResultUrl;
            }

            // --- 4. Crear el Detalle del Ticket ---
            // Aquí debes decidir qué ID enviar en ticketAssociatedTo para el detalle, 
            // generalmente es el ID del CREADOR (asumiendo que es el user.userId).
            // Si tu API acepta un solo string en 'ticketAssociatedTo' para el detalle,
            // usa el ID del usuario actual: user.userId
            // Si la API acepta el array, pasa el array.
            
            // Asumiendo que el detalle solo necesita el ID del ticket y el contenido.
            const detailRes = await createTicketDetail({
                ticketId: createdTicketId,
                // **Nota:** Si tu API de 'createTicketDetail' necesita un ID de asociado único,
                // usa el ID del usuario que crea el ticket, no el array completo.
                // Usaré user.userId como ID del creador/asociado del detalle.
                ticketAssociatedTo: formData.ticketAssociatedTo, 
                ticketDetailContent: formData.ticketDetailContent,
                ticketDetailImage:[imageUrl], 
                ticketDetailOrigin: 'CUSTOMER'
            });

            if (detailRes.status === 201) {
                alert('Ticket y detalle creados correctamente');
            } else {
                throw new Error('Error al crear el detalle del ticket');
            }

            // --- 5. Finalizar y cerrar modal ---
            resetForm();
            const modalEl = document.getElementById(`addTicketModal`);
            if (modalEl) {
                const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
                modalInstance.hide();
            }

        } catch (error) {
            console.error('Flujo de creación de ticket fallido:', error);
            alert(`Error al crear el ticket: ${error.message || 'Intente de nuevo.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ... Tu botón de apertura aquí ... */}
            <button
                type="button"
                className={`btn btn-success`}
                data-bs-toggle="modal"
                data-bs-target={`#addTicketModal`}
            >
                <FaPlus /><span className='ms-2 d-none d-md-inline'>Agregar</span>
            </button>
            <div
                className="modal fade"
                id={`addTicketModal`}
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby={`addTicketModalLabel`}
                aria-hidden="true"
                ref={modalRef} 
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
                        {/* ... Modal Header ... */}
                        <div className="modal-header">
                            <h5 className="modal-title" id="addTicketModalLabel">Agregar Ticket</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>

                        <form onSubmit={handleOnSubmit}>
                            <div className="modal-body">

                                {/* Tipo de ticket (se mantiene igual) */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Tipo de ticket
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <select
                                            className="form-select"
                                            value={formData.ticketType} 
                                            name="ticketType"
                                            onChange={handleOnChange}
                                            required
                                        >
                                            <option value="SUPPORT">Soporte</option>
                                            <option value="SUGGESTION">Sugerencia</option>
                                            <option value="REQUEST">Solicitud</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Asociado a - CON CHECKBOX PARA ARRAY */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Asociado a (mínimo uno)
                                    </label>
                                    <div className="col-12 col-md-8">
                                        
                                        {/* Checkbox para Usuario */}
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="ticketAssociatedTo"
                                                value={user.userId}
                                                // 🎯 CAMBIO CLAVE: Verificar si el ID está en el array
                                                checked={formData.ticketAssociatedTo.includes(user.userId)} 
                                                onChange={handleOnChange}
                                                id="cb-user"
                                            />
                                            <label className="form-check-label" htmlFor="cb-user">
                                                {user.userFirstName} {user.userLastName} - (tu usuario)
                                            </label>
                                        </div>

                                        {/* Checkbox para Negocio */}
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="ticketAssociatedTo"
                                                value={business.businessId}
                                                // 🎯 CAMBIO CLAVE: Verificar si el ID está en el array
                                                checked={formData.ticketAssociatedTo.includes(business.businessId)} 
                                                onChange={handleOnChange}
                                                id="cb-business"
                                            />
                                            <label className="form-check-label" htmlFor="cb-business">
                                                {business.businessName} - (negocio)
                                            </label>
                                        </div>
                                    </div>
                                </div>


                                {/* Descripción (se mantiene igual) */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Descripción
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder={`Describe tu ${formData.ticketType === 'support' ? 'problema' : formData.ticketType === 'suggestion' ? 'sugerencia' : 'solicitud'}...`}
                                            name="ticketDetailContent"
                                            value={formData.ticketDetailContent}
                                            onChange={handleOnChange}
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Imagen (se mantiene igual, usando handleFileChange) */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Imagen (Opcional)
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            name="ticketDetailsImage"
                                            onChange={handleFileChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* ... Modal Footer ... */}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                    disabled={loading}
                                >
                                    Volver
                                </button>

                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}