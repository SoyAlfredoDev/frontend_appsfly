import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createCustomer, updateCustomer } from '../../api/customers.js';
import { useAuth } from '../../context/authContext.jsx';
import { FaPlus, FaTimes, FaSave, FaUserEdit } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.jsx';

export default function AddCustomerModal({
    title,
    colorBtn = "success",
    onCreated = null,
    trigger = null,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    customerToEdit = null
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const openModal = () => setIsOpen(true);
    const setIsOpen = (val) => {
        if (!isControlled) setInternalIsOpen(val);
    }
    const closeModal = () => {
        if (isControlled) {
            if (externalOnClose) externalOnClose();
        } else {
            setInternalIsOpen(false);
        }
    }

    const btnColorMap = {
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    };
    const btnClass = btnColorMap[colorBtn] || btnColorMap.success;

    const modalTitle = title || (customerToEdit ? 'Editar Cliente' : 'Nuevo Cliente');

    return (
        <>
            {!isControlled && (
                trigger ? (
                    <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                        {trigger}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-sm ${btnClass}`}
                    >
                        <FaPlus className="text-xs" />
                        <span className="hidden md:inline">Nuevo Cliente</span>
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
                                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            
                            <Motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${customerToEdit ? 'bg-amber-100/50 text-amber-600' : 'bg-emerald-100/50 text-emerald-600'}`}>
                                                {customerToEdit ? <FaUserEdit size={18} /> : <FaPlus size={18} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 leading-tight">{modalTitle}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {customerToEdit ? 'Modifique los datos del cliente' : 'Complete la información para registrar un nuevo cliente'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={closeModal}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                        <form id="addCustomerForm" onSubmit={handleOnSubmit} className="space-y-6">
                                            
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Información Personal</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Identificación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                    <div className="md:col-span-4 relative">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full px-3 pb-2.5 pt-5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors cursor-pointer"
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
                                                                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none"
                                                            >
                                                                Tipo de Documento
                                                            </label>
                                                        </div>
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
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Contacto</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                    <div className="md:col-span-4">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full px-3 pb-2.5 pt-5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors cursor-pointer"
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
                                                            <label 
                                                                htmlFor="customerCodeNumberPhone"
                                                                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 pointer-events-none"
                                                            >
                                                                Código
                                                            </label>
                                                        </div>
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
                                                <div>
                                                    <InputFloatingComponent
                                                        label="Correo electrónico"
                                                        type="email"
                                                        name="customerEmail"
                                                        value={formData.customerEmail}
                                                        onChange={handleInputChange}
                                                        required={false}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Adicional</h4>
                                                <div className="relative">
                                                    <textarea
                                                        className="block px-3 pb-2 pt-6 w-full text-sm text-gray-900 bg-gray-50/50 rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors resize-none"
                                                        name="customerComment"
                                                        id="customerComment"
                                                        value={formData.customerComment}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        placeholder=" "
                                                    />
                                                    <label 
                                                        htmlFor="customerComment" 
                                                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none"
                                                    >
                                                        Comentarios o Notas
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <IsRequiredComponent />
                                            </div>

                                        </form>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            form="addCustomerForm"
                                            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/20 focus:outline-none transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                                    <span>Guardando...</span>
                                                </>
                                            ) : (
                                                <>
                                                   {customerToEdit ? <FaSave className="text-xs" /> : <FaPlus className="text-xs" />}
                                                   <span>{customerToEdit ? 'Actualizar Cliente' : 'Crear Cliente'}</span>
                                                </>
                                            )}
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
