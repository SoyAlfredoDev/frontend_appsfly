import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createLaboratory, updateLaboratory } from '../../api/laboratories.js';
import { FaPlus, FaTimes, FaSave, FaFlask } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.jsx';

const initialFormState = {
    laboratoryName: "",
    laboratoryEmail: "",
    laboratoryDocumentType: "rut",
    laboratoryDocumentNumber: "",
    laboratoryCodePhoneNumber: "+56",
    laboratoryPhoneNumber: "",
    laboratoryAddress: "",
    laboratoryComment: "",
    laboratoryActive: true,
};

export default function AddLaboratoryModal({
    title,
    onCreated = null,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    laboratoryToEdit = null,
}) {
    const toast = useToast();
    const isEditing = Boolean(laboratoryToEdit);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (!externalIsOpen) return;

        if (laboratoryToEdit) {
            setFormData({
                laboratoryName: laboratoryToEdit.laboratoryName || "",
                laboratoryEmail: laboratoryToEdit.laboratoryEmail || "",
                laboratoryDocumentType: laboratoryToEdit.laboratoryDocumentType || "rut",
                laboratoryDocumentNumber: laboratoryToEdit.laboratoryDocumentNumber || "",
                laboratoryCodePhoneNumber: laboratoryToEdit.laboratoryCodePhoneNumber || "+56",
                laboratoryPhoneNumber: laboratoryToEdit.laboratoryPhoneNumber || "",
                laboratoryAddress: laboratoryToEdit.laboratoryAddress || "",
                laboratoryComment: laboratoryToEdit.laboratoryComment || "",
                laboratoryActive: laboratoryToEdit.laboratoryActive ?? true,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [laboratoryToEdit, externalIsOpen]);

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
        if (!formData.laboratoryName?.trim()) {
            toast.error('Campos Incompletos', 'Por favor completa el nombre del laboratorio.');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            if (isEditing) {
                await updateLaboratory(laboratoryToEdit.laboratoryId, formData);
                toast.success('¡Laboratorio Actualizado!', 'Los datos se guardaron correctamente.');
                if (onCreated) onCreated(laboratoryToEdit.laboratoryId);
            } else {
                const laboratoryCreated = await createLaboratory(formData);
                const laboratoryCreatedId = laboratoryCreated.data.laboratoryId;
                toast.success('¡Laboratorio Creado!', 'El laboratorio se ha registrado correctamente.');
                if (onCreated) onCreated(laboratoryCreatedId);
            }

            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(
                'Error',
                isEditing
                    ? 'No se pudo actualizar el laboratorio.'
                    : 'No se pudo crear el laboratorio. Verifica los datos e inténtalo de nuevo.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetForm = () => {
        setFormData(initialFormState);
    };

    const closeModal = () => {
        externalOnClose?.();
        handleResetForm();
    };

    const modalTitle = title || (isEditing ? 'Editar laboratorio' : 'Nuevo laboratorio');

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {externalIsOpen && (
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
                                                {isEditing ? <FaSave size={18} /> : <FaFlask size={18} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 leading-tight">{modalTitle}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {isEditing
                                                        ? 'Actualice la información del laboratorio'
                                                        : 'Complete la información para registrar un nuevo laboratorio'}
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

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                        <form id="addLaboratoryForm" onSubmit={handleOnSubmit} className="space-y-6">

                                            {/* General Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Información General</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                                                    <InputFloatingComponent
                                                        label="Nombre del laboratorio *"
                                                        name="laboratoryName"
                                                        value={formData.laboratoryName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                {isEditing && (
                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.laboratoryActive}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({ ...prev, laboratoryActive: e.target.checked }))
                                                            }
                                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        Laboratorio activo
                                                    </label>
                                                )}
                                            </div>

                                            {/* ID Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 mb-3">Identificación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                    <div className="md:col-span-4 relative">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full px-3 pb-2.5 pt-5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer transition-colors cursor-pointer"
                                                                id="laboratoryDocumentType"
                                                                name="laboratoryDocumentType"
                                                                value={formData.laboratoryDocumentType}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="rut">RUT</option>
                                                                <option value="passport">Pasaporte</option>
                                                                <option value="other">Otro</option>
                                                            </select>
                                                            <label
                                                                htmlFor="laboratoryDocumentType"
                                                                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto pointer-events-none"
                                                            >
                                                                Tipo de Documento
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-8">
                                                        <InputFloatingComponent
                                                            label="Número de Documento"
                                                            type="text"
                                                            name="laboratoryDocumentNumber"
                                                            value={formData.laboratoryDocumentNumber}
                                                            onChange={handleInputChange}
                                                            required={false}
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
                                                                id="laboratoryCodePhoneNumber"
                                                                name="laboratoryCodePhoneNumber"
                                                                value={formData.laboratoryCodePhoneNumber}
                                                                onChange={handleInputChange}
                                                            >
                                                                {sortedCountryCodes.map(country => (
                                                                    <option key={country.id} value={country.id}>
                                                                        {country.name} ({country.id})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label
                                                                htmlFor="laboratoryCodePhoneNumber"
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
                                                            name="laboratoryPhoneNumber"
                                                            value={formData.laboratoryPhoneNumber}
                                                            onChange={handleInputChange}
                                                            required={false}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <InputFloatingComponent
                                                        label="Correo electrónico"
                                                        type="email"
                                                        name="laboratoryEmail"
                                                        value={formData.laboratoryEmail}
                                                        onChange={handleInputChange}
                                                        required={false}
                                                    />
                                                </div>
                                                <div>
                                                    <InputFloatingComponent
                                                        label="Dirección"
                                                        type="text"
                                                        name="laboratoryAddress"
                                                        value={formData.laboratoryAddress}
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
                                                        name="laboratoryComment"
                                                        id="laboratoryComment"
                                                        value={formData.laboratoryComment}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        placeholder=" "
                                                    />
                                                    <label
                                                        htmlFor="laboratoryComment"
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
                                            form="addLaboratoryForm"
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
                                                   {isEditing ? <FaSave className="text-xs" /> : <FaPlus className="text-xs" />}
                                                   <span>{isEditing ? 'Guardar Cambios' : 'Crear Laboratorio'}</span>
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
