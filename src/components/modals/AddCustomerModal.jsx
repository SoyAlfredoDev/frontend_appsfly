import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createCustomer } from '../../api/customers.js';
import { useAuth } from '../../context/authContext.jsx';
import "./StaticModals.css"; // Estilos personalizados
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function AddCustomerModal({
    nameBottom = "Agregar",
    idModal = "staticBackdrop",
    title,
    colorBtn = "success",
    onCreated = null
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        customerFirstName: "",
        customerLastName: "",
        customerEmail: "",
        customerDocumentType: "rut",
        customerDocumentNumber: "",
        customerCodeNumberPhone: "+56",
        customerPhoneNumber: "",
        customerComment: "",
        createdByUserId: user.userId
    });

    const countryCodes = [
        { id: "+56", name: "Chile" },
        { id: "+54", name: "Argentina" },
        { id: "+61", name: "Australia" },
        { id: "+32", name: "Bélgica" },
        { id: "+591", name: "Bolivia" },
        { id: "+55", name: "Brasil" },
        { id: "+57", name: "Colombia" },
        { id: "+506", name: "Costa Rica" },
        { id: "+593", name: "Ecuador" },
        { id: "+34", name: "España" },
        { id: "+33", name: "Francia" },
        { id: "+49", name: "Alemania" },
        { id: "+39", name: "Italia" },
        { id: "+81", name: "Japón" },
        { id: "+52", name: "México" },
        { id: "+51", name: "Perú" },
        { id: "+44", name: "Reino Unido" },
        { id: "+1", name: "Estados Unidos" },
        { id: "+598", name: "Uruguay" },
        { id: "+58", name: "Venezuela" }
    ];

    const sortedCountryCodes = [
        countryCodes[0],
        ...countryCodes.slice(1).sort((a, b) => a.name.localeCompare(b.name))
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        try {
            const customerCreated = await createCustomer(formData);
            const customerCreatedId = customerCreated.data.customer.customerId;
            if (onCreated) onCreated(customerCreatedId);
            // Cerrar modal usando Bootstrap API
            const modalEl = document.getElementById(idModal);
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.hide();
            // Reiniciar el formulario
            setFormData({
                customerFirstName: "",
                customerLastName: "",
                customerDocumentType: "rut",
                customerDocumentNumber: "",
                customerCodeNumberPhone: "+56",
                customerPhoneNumber: "",
                customerComment: "",
                createdByUserId: user.userId,
                customerEmail: "",
            });

            if (location.pathname === '/customers') {
                // Si estamos en la página de clientes, recargar los datos  
                navigate('/customers');
            }


        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {/* Botón que abre el modal */}
            <button
                type="button"
                className={`btn btn-${colorBtn}`}
                data-bs-toggle="modal"
                data-bs-target={`#${idModal}`}
            >
                {nameBottom}
            </button>

            {/* Modal */}
            <div
                className="modal fade"
                id={idModal}
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby={`${idModal}Label`}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleOnSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputFloatingComponent
                                            label="Nombre"
                                            name="customerFirstName"
                                            value={formData.customerFirstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <InputFloatingComponent
                                            label="Apellido"
                                            name="customerLastName"
                                            value={formData.customerLastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-floating m-1">
                                            <select
                                                className="form-select"
                                                id="customerDocumentType"
                                                name="customerDocumentType"
                                                value={formData.customerDocumentType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="rut">RUT</option>
                                                <option value="passport">Pasaporte</option>
                                                <option value="other">Otro</option>
                                            </select>
                                            <label htmlFor="customerDocumentType">Tipo de documento</label>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                        <InputFloatingComponent
                                            label="Número de documento"
                                            type="text"
                                            name="customerDocumentNumber"
                                            value={formData.customerDocumentNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-floating m-1">
                                            <select
                                                className="form-select"
                                                id="customerCodeNumberPhone"
                                                name="customerCodeNumberPhone"
                                                value={formData.customerCodeNumberPhone}
                                                onChange={handleInputChange}
                                            >
                                                {sortedCountryCodes.map(country => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.name} ({country.id})
                                                    </option>
                                                ))}
                                            </select>
                                            <label htmlFor="customerCodeNumberPhone">Código de área</label>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                        <InputFloatingComponent
                                            label="Número de Teléfono"
                                            type="number"
                                            name="customerPhoneNumber"
                                            value={formData.customerPhoneNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <InputFloatingComponent
                                    label="Correo electrónico"
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    required={false}
                                />

                                <div className="form-floating mb-2">
                                    <textarea
                                        className="form-control form-control-sm h-auto"
                                        name="customerComment"
                                        id="customerComment"
                                        value={formData.customerComment}
                                        onChange={handleInputChange}
                                        rows={2}
                                    />
                                    <label htmlFor="customerComment" style={{ fontSize: "0.85rem" }}>
                                        Comentario:
                                    </label>
                                </div>

                                <IsRequiredComponent />
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
    );
}
