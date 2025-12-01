import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function AddTicketModal() {
    const [formData, setFormData] = useState({
        ticketDetailsContent: "",
        ticketType: 'support',
        ticketDetailsImage: []
    })
    const handleOnChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "ticketDetailsImage") {
            setFormData((prevData) => ({
                ...prevData,
                [name]: files
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    }
    const handleOnSubmit = (e) => {
        e.preventDefault();
        // Lógica para manejar el envío del formulario
    }
    return (
        <>
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
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
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

                                {/* Tipo de ticket */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Tipo de ticket
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <select
                                            className="form-select"
                                            defaultValue={formData.ticketType}
                                            name="ticketType"
                                            onChange={handleOnChange}
                                        >
                                            <option value="support">Soporte</option>
                                            <option value="suggestion">Sugerencia</option>
                                            <option value="request">Solicitud</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Descripción
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Describe tu problema o sugerencia..."
                                            name="ticketDetailContent"
                                            value={formData.ticketDetailContent}
                                            onChange={handleOnChange}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Imagen */}
                                <div className="row mb-3">
                                    <label className="col-12 col-md-4 col-form-label">
                                        Imagen
                                    </label>
                                    <div className="col-12 col-md-8">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            name="ticketDetailsImage"
                                            onChange={handleOnChange}
                                            multiple
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cancelar
                                </button>

                                <button type="submit" className="btn btn-success">
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}