import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import IsRequiredComponent from '../IsRequiredComponent.jsx';
import { createCustomer, updateCustomer } from '../../api/customers.js';
import { createPrescription } from '../../api/prescriptions.js';
import { useAuth } from '../../context/authContext.jsx';
import { FaPlus, FaTimes, FaSave, FaFileMedical, FaEdit } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.jsx';
import {
    uploadImageToCloudinary,
    CLOUDINARY_FOLDERS,
    buildPrescriptionImagePublicId,
} from '../../utils/cloudinaryUpload.js';
import { isOpticsBusiness, toDateInputValue } from '../../utils/businessModality.js';
import { getTodayBusinessDate } from '../../utils/businessTime.js';
import PrescriptionFormModal from '../prescriptions/PrescriptionFormModal.jsx';
import {
    EMPTY_PRESCRIPTION_FORM,
    hasPrescriptionMeasurements,
    resolvePrescriptionEntryMode,
    summarizePrescriptionEyes,
} from '../prescriptions/prescriptionFormDefaults.js';

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
    const { user, business } = useAuth();
    const toast = useToast();
    const showOpticsFields = isOpticsBusiness(business);

    const isControlled = externalIsOpen !== undefined;
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = isControlled ? externalIsOpen : internalIsOpen;
    const [isLoading, setIsLoading] = useState(false);

    /** Receta opcional → tabla Prescription (independiente del Customer) */
    const [includePrescription, setIncludePrescription] = useState(false);
    const [rxForm, setRxForm] = useState(EMPTY_PRESCRIPTION_FORM);
    const [rxImageFile, setRxImageFile] = useState(null);
    const [rxModalOpen, setRxModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        customerFirstName: "",
        customerLastName: "",
        customerEmail: "",
        customerDocumentType: "rut",
        customerDocumentNumber: "",
        customerCodePhoneNumber: "+56",
        customerPhoneNumber: "",
        customerComment: "",
        customerBirthDate: "",
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

    const resetPrescriptionState = () => {
        setIncludePrescription(false);
        setRxForm({
            ...EMPTY_PRESCRIPTION_FORM,
            prescriptionDate: getTodayBusinessDate(business),
        });
        setRxImageFile(null);
        setRxModalOpen(false);
    };

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
                    customerBirthDate: toDateInputValue(customerToEdit.customerBirthDate),
                    createdByUserId: customerToEdit.createdByUserId || user?.userId
                });
                resetPrescriptionState();
            } else {
                handleResetForm();
            }
        }
    }, [customerToEdit, isOpen, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const saveOptionalPrescription = async (customerId) => {
        if (!showOpticsFields || !includePrescription) return false;

        const hasManual = hasPrescriptionMeasurements(rxForm);
        const hasNotes = String(rxForm.prescriptionNotes || "").trim() !== "";
        if (!rxImageFile && !hasManual && !hasNotes) {
            toast.info(
                "Receta incompleta",
                "Abre el formulario de receta e ingresa la graduación, una foto o una nota.",
            );
            throw new Error("PRESCRIPTION_INCOMPLETE");
        }

        let prescriptionImageUrl = null;
        if (rxImageFile) {
            prescriptionImageUrl = await uploadImageToCloudinary(rxImageFile, {
                folder: CLOUDINARY_FOLDERS.PRESCRIPTION_IMAGES,
                publicId: buildPrescriptionImagePublicId(customerId),
            });
        }

        await createPrescription(customerId, {
            ...rxForm,
            prescriptionDate: rxForm.prescriptionDate || null,
            prescriptionExpiresAt: rxForm.prescriptionExpiresAt || null,
            prescriptionImageUrl,
            entryMode: resolvePrescriptionEntryMode({
                hasImage: Boolean(prescriptionImageUrl),
                hasManual,
            }),
            createdByUserId: user?.userId,
        });
        return true;
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerFirstName?.trim()) {
            toast.info('Campo incompleto', 'El nombre es obligatorio.');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            let resultId;

            if (customerToEdit) {
                const payload = {
                    ...formData,
                    customerBirthDate: showOpticsFields
                        ? (formData.customerBirthDate || null)
                        : (customerToEdit.customerBirthDate ?? null),
                };

                await updateCustomer(customerToEdit.customerId, payload);
                resultId = customerToEdit.customerId;
                toast.success('¡Cliente Actualizado!', 'El cliente se ha actualizado correctamente.');
            } else {
                const createPayload = {
                    ...formData,
                    customerBirthDate: showOpticsFields ? (formData.customerBirthDate || null) : null,
                    customerImageUrl: null,
                };
                const customerCreated = await createCustomer(createPayload);
                resultId = customerCreated.data.customer.customerId;

                toast.success('¡Cliente Creado!', 'El cliente se ha registrado correctamente.');
            }

            try {
                const rxSaved = await saveOptionalPrescription(resultId);
                if (rxSaved) {
                    toast.success(
                        'Receta registrada',
                        'La fórmula médica se guardó en el historial del paciente.',
                    );
                }
            } catch (rxError) {
                if (rxError?.message === "PRESCRIPTION_INCOMPLETE") {
                    return;
                }
                console.error(rxError);
                toast.error(
                    'Cliente guardado',
                    'El cliente quedó registrado, pero no se pudo guardar la receta. Puedes agregarla desde la ficha del paciente.',
                );
            }

            if (onCreated) onCreated(resultId);
            closeModal();
            handleResetForm();
        } catch (error) {
            console.error(error);
            const serverMessage = error.response?.data?.message || error.response?.data?.error;
            const msg = error.message?.includes("Cloudinary")
                ? error.message
                : serverMessage || (error.response?.status >= 500
                    ? 'El servidor no pudo guardar el cliente. Tus datos siguen en el formulario; intenta nuevamente.'
                    : 'No se pudo procesar la solicitud. Revisa los campos indicados.');
            toast.error('Error', msg);
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
                customerBirthDate: "",
                createdByUserId: user?.userId || "",
            });
        }
        resetPrescriptionState();
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
        ? (rxImageFile ? 'Subiendo imágenes...' : 'Guardando...')
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
                                            label="Apellido"
                                            name="customerLastName"
                                            value={formData.customerLastName}
                                            onChange={handleInputChange}
                                            required={false}
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
                                                label="Número de Documento"
                                                type="text"
                                                name="customerDocumentNumber"
                                                value={formData.customerDocumentNumber}
                                                onChange={handleInputChange}
                                                required={false}
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
                                                required={false}
                                            />
                                        </div>
                                    </div>

                                    {showOpticsFields ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                            <InputFloatingComponent
                                                label="Correo electrónico"
                                                type="email"
                                                name="customerEmail"
                                                value={formData.customerEmail}
                                                onChange={handleInputChange}
                                                required={false}
                                            />
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Fecha de nacimiento
                                                </label>
                                                <input
                                                    type="date"
                                                    name="customerBirthDate"
                                                    value={formData.customerBirthDate}
                                                    onChange={handleInputChange}
                                                    disabled={isLoading}
                                                    className="block w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <InputFloatingComponent
                                            label="Correo electrónico"
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            required={false}
                                        />
                                    )}

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

                                    {showOpticsFields && (
                                        <div className="space-y-3">
                                            {!includePrescription ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRxForm((prev) => ({
                                                            ...EMPTY_PRESCRIPTION_FORM,
                                                            ...prev,
                                                            prescriptionDate:
                                                                prev.prescriptionDate ||
                                                                getTodayBusinessDate(business),
                                                        }));
                                                        setRxModalOpen(true);
                                                    }}
                                                    disabled={isLoading}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                                                >
                                                    <FaFileMedical className="text-teal-600" />
                                                    Agregar receta
                                                </button>
                                            ) : (
                                                (() => {
                                                    const summary = summarizePrescriptionEyes(rxForm);
                                                    return (
                                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                                    <FaFileMedical className="text-teal-600" />
                                                                    Receta agregada
                                                                </h4>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setIncludePrescription(false);
                                                                        setRxImageFile(null);
                                                                        setRxForm(EMPTY_PRESCRIPTION_FORM);
                                                                        setRxModalOpen(false);
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                                >
                                                                    Quitar
                                                                </button>
                                                            </div>

                                                            {summary.hasData || rxImageFile || rxForm.prescriptionNotes ? (
                                                                <div className="text-xs text-slate-700 space-y-1.5">
                                                                    {summary.typeLabel && (
                                                                        <p>
                                                                            <span className="font-semibold text-slate-500">Tipo:</span>{" "}
                                                                            {summary.typeLabel}
                                                                        </p>
                                                                    )}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[12px]">
                                                                        <p>
                                                                            <span className="font-sans font-semibold text-slate-500">OD:</span>{" "}
                                                                            {summary.od}
                                                                        </p>
                                                                        <p>
                                                                            <span className="font-sans font-semibold text-slate-500">OI:</span>{" "}
                                                                            {summary.oi}
                                                                        </p>
                                                                    </div>
                                                                    {rxImageFile && (
                                                                        <p className="text-teal-700 font-medium">Foto de receta adjunta</p>
                                                                    )}
                                                                    {rxForm.prescriptionNotes?.trim() && (
                                                                        <p className="text-slate-600 italic line-clamp-2">
                                                                            {rxForm.prescriptionNotes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                                                                    Aún no hay datos de receta. Ábrela para cargar la fórmula.
                                                                </p>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => setRxModalOpen(true)}
                                                                disabled={isLoading}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                            >
                                                                <FaEdit className="text-[11px]" />
                                                                {summary.hasData || rxImageFile
                                                                    ? "Editar receta"
                                                                    : "Abrir formulario de receta"}
                                                            </button>
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    )}

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

            <PrescriptionFormModal
                isOpen={rxModalOpen}
                onClose={() => setRxModalOpen(false)}
                initialForm={rxForm}
                initialImageFile={rxImageFile}
                title="Completar receta del paciente"
                confirmLabel="Usar esta receta"
                onConfirm={({ form, imageFile }) => {
                    setRxForm(form);
                    setRxImageFile(imageFile);
                    setIncludePrescription(true);
                }}
            />
        </>
    );
}
