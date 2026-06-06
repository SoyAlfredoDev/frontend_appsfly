import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createCustomer, updateCustomer } from '../../api/customers.js';
import { useAuth } from '../../context/authContext.jsx';
import { FaPlus, FaTimes, FaSave } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.jsx';

import { PRIMARY_BTN } from '../../utils/expenseUiPatterns.js';

/** Clases del modal — AddExpenseModal Source of Truth */
const CANCEL_BTN =
    "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";
const MODAL_SAVE_BTN =
    "px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
const MODAL_TRIGGER_BTN = PRIMARY_BTN;

export default function AddCustomerModal({
    title,
    onCreated = null,
    trigger = null,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    customerToEdit = null
}) {
    const { user } = useAuth();
    const toast = useToast();

    const isControlled = externalIsOpen !== undefined;
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = isControlled ? externalIsOpen : internalIsOpen;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerFirstName: "",
        customerLastName: "",
        customerEmail: "",
        customerDocumentType: "rut",
        customerDocumentNumber: "",
        customerCodePhoneNumber: "+56",
        customerPhoneNumber: "",
        customerComment: "",
        createdByUserId: user?.userId || ""
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

    useEffect(() => {
        if (isOpen) {
            if (customerToEdit) {
                setFormData({
                    customerFirstName: customerToEdit.customerFirstName || "",
                    customerLastName: customerToEdit.customerLastName || "",
                    customerEmail: customerToEdit.customerEmail || "",
                    customerDocumentType: customerToEdit.customerDocumentType || "rut",
                    customerDocumentNumber: customerToEdit.customerDocumentNumber || "",
                    customerCodePhoneNumber: customerToEdit.customerCodePhoneNumber || "+56",
                    customerPhoneNumber: customerToEdit.customerPhoneNumber || "",
                    customerComment: customerToEdit.customerComment || "",
                    createdByUserId: customerToEdit.createdByUserId || user?.userId
                });
            } else {
                handleResetForm();
            }
        }
    }, [customerToEdit, isOpen, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerFirstName || !formData.customerLastName || !formData.customerDocumentNumber) {
            toast.info('Campos Incompletos', 'Por favor completa los campos obligatorios (Nombre, Apellido, Documento).');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            let resultId;
            if (customerToEdit) {
                await updateCustomer(customerToEdit.customerId, formData);
                resultId = customerToEdit.customerId;
                toast.success('¡Cliente Actualizado!', 'El cliente se ha actualizado correctamente.');
            } else {
                const customerCreated = await createCustomer(formData);
                resultId = customerCreated.data.customer.customerId;
                toast.success('¡Cliente Creado!', 'El cliente se ha registrado correctamente.');
            }

            if (onCreated) onCreated(resultId);
            closeModal();
            handleResetForm();
        } catch (error) {
            console.error(error);
            toast.error('Error', 'No se pudo procesar la solicitud. Verifica los datos e inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetForm = () => {
        if (!customerToEdit) {
            setFormData({
                customerFirstName: "",
                customerLastName: "",
                customerEmail: "",
                customerDocumentType: "rut",
                customerDocumentNumber: "",
                customerCodePhoneNumber: "+56",
                customerPhoneNumber: "",
                customerComment: "",
                createdByUserId: user?.userId || "",
            });
        }
    };

    const setIsOpen = (val) => {
        if (!isControlled) setInternalIsOpen(val);
    };

    const closeModal = () => {
        if (isControlled) {
            if (externalOnClose) externalOnClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    const modalTitle = title || (customerToEdit ? 'Editar Cliente' : 'Nuevo Cliente');
    const submitButtonText = isLoading
        ? 'Guardando...'
        : customerToEdit
            ? 'Actualizar Cliente'
            : 'Crear Cliente';

    const triggerBtnClass = MODAL_TRIGGER_BTN;

    return (
        <>
            {!isControlled && (
                trigger ? (
                    <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                        {trigger}
                    </div>
                ) : (
                    <button type="button" onClick={() => setIsOpen(true)} className={triggerBtnClass}>
                        <FaPlus /> Nuevo Cliente
                    </button>
                )
            )}

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            />

                            <Motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">{modalTitle}</h3>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <form id="addCustomerForm" onSubmit={handleOnSubmit} className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputFloatingComponent
                                            label="Nombre *"
                                            name="customerFirstName"
                                            value={formData.customerFirstName}
                                            onChange={handleInputChange}
                                        />
                                        <InputFloatingComponent
                                            label="Apellido *"
                                            name="customerLastName"
                                            value={formData.customerLastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4 relative">
                                            <select
                                                className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors cursor-pointer"
                                                id="customerDocumentType"
                                                name="customerDocumentType"
                                                value={formData.customerDocumentType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="rut">RUT</option>
                                                <option value="passport">Pasaporte</option>
                                                <option value="other">Otro</option>
                                            </select>
                                            <label
                                                htmlFor="customerDocumentType"
                                                className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                            >
                                                Tipo de Documento
                                            </label>
                                        </div>
                                        <div className="md:col-span-8">
                                            <InputFloatingComponent
                                                label="Número de Documento *"
                                                type="text"
                                                name="customerDocumentNumber"
                                                value={formData.customerDocumentNumber}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4 relative">
                                            <select
                                                className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors cursor-pointer"
                                                id="customerCodePhoneNumber"
                                                name="customerCodePhoneNumber"
                                                value={formData.customerCodePhoneNumber}
                                                onChange={handleInputChange}
                                            >
                                                {sortedCountryCodes.map(country => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.name} ({country.id})
                                                    </option>
                                                ))}
                                            </select>
                                            <label
                                                htmlFor="customerCodePhoneNumber"
                                                className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                            >
                                                Código
                                            </label>
                                        </div>
                                        <div className="md:col-span-8">
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

                                    <div>
                                        <label htmlFor="customerComment" className="block text-sm font-medium text-gray-700 mb-2">
                                            Comentarios o Notas
                                        </label>
                                        <textarea
                                            className="block px-3 py-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            name="customerComment"
                                            id="customerComment"
                                            value={formData.customerComment}
                                            onChange={handleInputChange}
                                            rows={3}
                                        />
                                    </div>

                                    <IsRequiredComponent />
                                </form>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isLoading}
                                        className={CANCEL_BTN}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        form="addCustomerForm"
                                        disabled={isLoading}
                                        className={MODAL_SAVE_BTN}
                                    >
                                        {isLoading && (
                                            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                                        )}
                                        {!isLoading && customerToEdit && <FaSave className="text-xs" />}
                                        {!isLoading && !customerToEdit && <FaPlus className="text-xs" />}
                                        {submitButtonText}
                                    </button>
                                </div>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
