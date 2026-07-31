import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaTimes, FaSave, FaCamera, FaKeyboard } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import ImageUploadField from "../inputs/ImageUploadField.jsx";
import PrescriptionRxTable from "../prescriptions/PrescriptionRxTable.jsx";
import {
    EMPTY_PRESCRIPTION_FORM,
    hasPrescriptionMeasurements,
    resolvePrescriptionEntryMode,
} from "../prescriptions/prescriptionFormDefaults.js";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
    createPrescription,
    updatePrescription,
} from "../../api/prescriptions.js";
import {
    uploadImageToCloudinary,
    CLOUDINARY_FOLDERS,
    buildPrescriptionImagePublicId,
} from "../../utils/cloudinaryUpload.js";
import { toDateInputValue } from "../../utils/businessModality.js";

const CANCEL_BTN =
    "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";
const MODAL_SAVE_BTN =
    "px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

export default function AddPrescriptionModal({
    customerId,
    isOpen,
    onClose,
    onSaved,
    prescriptionToEdit = null,
}) {
    const { user } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");
    const [formData, setFormData] = useState(EMPTY_PRESCRIPTION_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [imageCleared, setImageCleared] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (prescriptionToEdit) {
            setFormData({
                ...EMPTY_PRESCRIPTION_FORM,
                prescriptionDate: toDateInputValue(prescriptionToEdit.prescriptionDate),
                prescriptionExpiresAt: toDateInputValue(prescriptionToEdit.prescriptionExpiresAt),
                prescribedBy: prescriptionToEdit.prescribedBy || "",
                prescriptionType: prescriptionToEdit.prescriptionType || "",
                odSphere: prescriptionToEdit.odSphere || "",
                odCylinder: prescriptionToEdit.odCylinder || "",
                odAxis: prescriptionToEdit.odAxis || "",
                odAddition: prescriptionToEdit.odAddition || "",
                odPrism: prescriptionToEdit.odPrism || "",
                odBase: prescriptionToEdit.odBase || "",
                oiSphere: prescriptionToEdit.oiSphere || "",
                oiCylinder: prescriptionToEdit.oiCylinder || "",
                oiAxis: prescriptionToEdit.oiAxis || "",
                oiAddition: prescriptionToEdit.oiAddition || "",
                oiPrism: prescriptionToEdit.oiPrism || "",
                oiBase: prescriptionToEdit.oiBase || "",
                pdBinocular: prescriptionToEdit.pdBinocular || "",
                pdOd: prescriptionToEdit.pdOd || "",
                pdOi: prescriptionToEdit.pdOi || "",
                pdNear: prescriptionToEdit.pdNear || "",
                prescriptionNotes: prescriptionToEdit.prescriptionNotes || "",
            });
            setExistingImageUrl(prescriptionToEdit.prescriptionImageUrl || null);
            setImageCleared(false);
            setImageFile(null);
            setActiveTab(
                prescriptionToEdit.entryMode === "PHOTO" ? "photo" : "manual",
            );
        } else {
            setFormData({
                ...EMPTY_PRESCRIPTION_FORM,
                prescriptionDate: toDateInputValue(new Date()),
            });
            setExistingImageUrl(null);
            setImageCleared(false);
            setImageFile(null);
            setActiveTab("manual");
        }
    }, [isOpen, prescriptionToEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading || !customerId) return;

        const willHaveImage = Boolean(imageFile || (!imageCleared && existingImageUrl));
        const willHaveManual = hasPrescriptionMeasurements(formData);

        if (!willHaveImage && !willHaveManual) {
            toast.info(
                "Datos incompletos",
                "Adjunta una foto de la receta o ingresa al menos un valor de graduación.",
            );
            return;
        }

        setIsLoading(true);
        try {
            let prescriptionImageUrl = null;
            if (imageFile) {
                prescriptionImageUrl = await uploadImageToCloudinary(imageFile, {
                    folder: CLOUDINARY_FOLDERS.PRESCRIPTION_IMAGES,
                    publicId: buildPrescriptionImagePublicId(customerId),
                });
            } else if (!imageCleared && existingImageUrl) {
                prescriptionImageUrl = existingImageUrl;
            }

            const payload = {
                ...formData,
                prescriptionDate: formData.prescriptionDate || null,
                prescriptionExpiresAt: formData.prescriptionExpiresAt || null,
                prescriptionImageUrl,
                entryMode: resolvePrescriptionEntryMode({
                    hasImage: Boolean(prescriptionImageUrl),
                    hasManual: willHaveManual,
                }),
                createdByUserId: user?.userId,
            };

            if (prescriptionToEdit) {
                await updatePrescription(prescriptionToEdit.prescriptionId, payload);
                toast.success("Receta actualizada", "Los cambios se guardaron correctamente.");
            } else {
                await createPrescription(customerId, payload);
                toast.success("Receta registrada", "La receta se agregó al historial del cliente.");
            }

            onSaved?.();
            onClose?.();
        } catch (error) {
            console.error(error);
            const msg = error.message?.includes("Cloudinary")
                ? error.message
                : error.response?.data?.message || "No se pudo guardar la receta.";
            toast.error("Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                <Motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300 font-semibold">
                                Óptica · Receta
                            </p>
                            <h3 className="text-lg font-bold leading-tight text-white">
                                {prescriptionToEdit ? "Editar Receta" : "Nueva Receta"}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="px-6 pt-4 flex gap-2 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setActiveTab("manual")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === "manual"
                                    ? "border-teal-600 text-teal-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <FaKeyboard /> Graduación
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("photo")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === "photo"
                                    ? "border-teal-600 text-teal-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <FaCamera /> Foto de la receta
                        </button>
                    </div>

                    <form
                        id="addPrescriptionForm"
                        onSubmit={handleSubmit}
                        className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Fecha de la receta
                                </label>
                                <input
                                    type="date"
                                    name="prescriptionDate"
                                    value={formData.prescriptionDate}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Válida hasta
                                </label>
                                <input
                                    type="date"
                                    name="prescriptionExpiresAt"
                                    value={formData.prescriptionExpiresAt}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputFloatingComponent
                                label="Prescrito por"
                                name="prescribedBy"
                                value={formData.prescribedBy}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required={false}
                            />
                            <div className="relative">
                                <select
                                    id="prescriptionType"
                                    name="prescriptionType"
                                    value={formData.prescriptionType}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 peer"
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="lejos">Lejos</option>
                                    <option value="cerca">Cerca</option>
                                    <option value="multifocal">Multifocal</option>
                                    <option value="progresivo">Progresivo</option>
                                    <option value="otro">Otro</option>
                                </select>
                                <label
                                    htmlFor="prescriptionType"
                                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-teal-700 pointer-events-none"
                                >
                                    Tipo de uso
                                </label>
                            </div>
                        </div>

                        {activeTab === "manual" && (
                            <PrescriptionRxTable
                                formData={formData}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        )}

                        {activeTab === "photo" && (
                            <ImageUploadField
                                file={imageFile}
                                onFileChange={(file) => {
                                    setImageFile(file);
                                    if (file) setImageCleared(false);
                                }}
                                onRemove={() => {
                                    setImageFile(null);
                                    setImageCleared(true);
                                    setExistingImageUrl(null);
                                }}
                                existingImageUrl={!imageCleared && !imageFile ? existingImageUrl : null}
                                disabled={isLoading}
                                label="Fotografía de la receta"
                                hint="PNG, JPG — puedes combinar foto + datos en ambas pestañas"
                            />
                        )}

                        <div>
                            <label
                                htmlFor="prescriptionNotes"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Notas
                            </label>
                            <textarea
                                id="prescriptionNotes"
                                name="prescriptionNotes"
                                value={formData.prescriptionNotes}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                rows={2}
                                className="block px-3 py-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 resize-none"
                            />
                        </div>

                        <p className="text-xs text-gray-400">
                            Puedes registrar solo foto, solo graduación, o ambas. Los datos de la otra pestaña se conservan al guardar.
                        </p>
                    </form>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className={CANCEL_BTN}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="addPrescriptionForm"
                            disabled={isLoading}
                            className={MODAL_SAVE_BTN}
                        >
                            {isLoading && (
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                            )}
                            {!isLoading && prescriptionToEdit && <FaSave className="text-xs" />}
                            {!isLoading && !prescriptionToEdit && <FaPlus className="text-xs" />}
                            {isLoading
                                ? imageFile
                                    ? "Subiendo imagen..."
                                    : "Guardando..."
                                : prescriptionToEdit
                                    ? "Actualizar"
                                    : "Guardar receta"}
                        </button>
                    </div>
                </Motion.div>
            </div>
        </AnimatePresence>,
        document.body,
    );
}
