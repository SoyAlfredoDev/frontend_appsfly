import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createProvider } from '../../api/providers.js';
import { useAuth } from '../../context/authContext.jsx';
import { FaPlus, FaTimes } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AddProviderModal({
    title,
    colorBtn = "success",
    onCreated = null,
    trigger = null
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        providerName: "",
        providerEmail: "",
        providerDocumentType: "rut",
        providerDocumentNumber: "",
        providerCodeNumberPhone: "+56",
        providerPhoneNumber: "",
        providerAddress: "",
        providerComment: "",
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
        
        if (!formData.providerName || !formData.providerDocumentNumber) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campos Incompletos',
                text: 'Por favor completa los campos obligatorios (Nombre, Documento).',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            const providerCreated = await createProvider(formData);
            const providerCreatedId = providerCreated.data.provider.providerId;
            
            MySwal.fire({
                icon: 'success',
                title: '¡Proveedor Creado!',
                text: 'El proveedor se ha registrado correctamente.',
                timer: 1500,
                showConfirmButton: false
            });

            if (onCreated) onCreated(providerCreatedId);
            
            closeModal();
            handleResetForm();

        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el proveedor. Verifica los datos e inténtalo de nuevo.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetForm = () => {
        setFormData({
            providerName: "",
            providerDocumentType: "rut",
            providerDocumentNumber: "",
            providerCodeNumberPhone: "+56",
            providerPhoneNumber: "",
            providerAddress: "",
            providerComment: "",
            createdByUserId: user.userId,
            providerEmail: "",
        });
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        handleResetForm();
    }

    // Map bootstrap color prop to Tailwind classes purely for button
    const btnColorMap = {
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    };
    const btnClass = btnColorMap[colorBtn] || btnColorMap.success;

    return (
        <>
            {trigger ? (
                // If custom trigger is provided, use it and attach onClick
                <div onClick={openModal} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                // Default Button
                <button
                    type="button"
                    onClick={openModal}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-sm ${btnClass}`}
                >
                    <FaPlus className="text-xs" />
                    <span className="hidden md:inline">Nuevo Proveedor</span>
                </button>
            )}

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            
                            {/* Modal Content */}
                            <Motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                    
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                                <FaPlus size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 leading-tight">{title}</h3>
                                                <p className="text-xs text-gray-500">Complete la información para registrar un nuevo proveedor</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={closeModal}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                        <form id="addProviderForm" onSubmit={handleOnSubmit} className="space-y-6">
                                            
                                            {/* Personal Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Información General</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                                                    <InputFloatingComponent
                                                        label="Nombre o Razón Social *"
                                                        name="providerName"
                                                        value={formData.providerName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* ID Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Identificación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                    <div className="md:col-span-4 relative">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full px-3 pb-2.5 pt-5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors cursor-pointer"
                                                                id="providerDocumentType"
                                                                name="providerDocumentType"
                                                                value={formData.providerDocumentType}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="rut">RUT</option>
                                                                <option value="passport">Pasaporte</option>
                                                                <option value="other">Otro</option>
                                                            </select>
                                                            <label 
                                                                htmlFor="providerDocumentType"
                                                                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto pointer-events-none"
                                                            >
                                                                Tipo de Documento
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-8">
                                                        <InputFloatingComponent
                                                            label="Número de Documento *"
                                                            type="text"
                                                            name="providerDocumentNumber"
                                                            value={formData.providerDocumentNumber}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Contacto</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                    <div className="md:col-span-4">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full px-3 pb-2.5 pt-5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors cursor-pointer"
                                                                id="providerCodeNumberPhone"
                                                                name="providerCodeNumberPhone"
                                                                value={formData.providerCodeNumberPhone}
                                                                onChange={handleInputChange}
                                                            >
                                                                {sortedCountryCodes.map(country => (
                                                                    <option key={country.id} value={country.id}>
                                                                        {country.name} ({country.id})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label 
                                                                htmlFor="providerCodeNumberPhone"
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
                                                            name="providerPhoneNumber"
                                                            value={formData.providerPhoneNumber}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <InputFloatingComponent
                                                        label="Correo electrónico"
                                                        type="email"
                                                        name="providerEmail"
                                                        value={formData.providerEmail}
                                                        onChange={handleInputChange}
                                                        required={false}
                                                    />
                                                </div>
                                                <div>
                                                    <InputFloatingComponent
                                                        label="Dirección"
                                                        type="text"
                                                        name="providerAddress"
                                                        value={formData.providerAddress}
                                                        onChange={handleInputChange}
                                                        required={false}
                                                    />
                                                </div>
                                            </div>

                                            {/* Comments */}
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Adicional</h4>
                                                <div className="relative">
                                                    <textarea
                                                        className="block px-3 pb-2 pt-6 w-full text-sm text-gray-900 bg-gray-50/50 rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors resize-none"
                                                        name="providerComment"
                                                        id="providerComment"
                                                        value={formData.providerComment}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        placeholder=" "
                                                    />
                                                    <label 
                                                        htmlFor="providerComment" 
                                                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none"
                                                    >
                                                        Notas / comentarios
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <IsRequiredComponent />
                                            </div>

                                        </form>
                                    </div>

                                    {/* Footer */}
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
                                            form="addProviderForm"
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
                                                   <FaPlus className="text-xs" />
                                                   <span>Crear Proveedor</span>
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
