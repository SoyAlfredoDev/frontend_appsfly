import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaCheck, FaCamera, FaKeyboard } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import ImageUploadField from "../inputs/ImageUploadField.jsx";
import PrescriptionRxTable from "./PrescriptionRxTable.jsx";
import {
    EMPTY_PRESCRIPTION_FORM,
    hasPrescriptionMeasurements,
} from "./prescriptionFormDefaults.js";

const CANCEL_BTN =
    "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";
const CONFIRM_BTN =
    "px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

/**
 * Modal de receta (tabla OD/OI).
 * mode="draft": no llama API; onConfirm({ form, imageFile }).
 * Usado al crear cliente o como base visual reutilizable.
 */
export default function PrescriptionFormModal({
    isOpen,
    onClose,
    onConfirm,
    initialForm = null,
    initialImageFile = null,
    title = "Receta / Fórmula médica",
    confirmLabel = "Usar esta receta",
    zIndexClass = "z-[10050]",
}) {
    const [formData, setFormData] = useState(EMPTY_PRESCRIPTION_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [activeTab, setActiveTab] = useState("manual");

    useEffect(() => {
        if (!isOpen) return;
        setFormData({
            ...EMPTY_PRESCRIPTION_FORM,
            ...(initialForm || {}),
        });
        setImageFile(initialImageFile || null);
        const hasManual = hasPrescriptionMeasurements(initialForm || {});
        setActiveTab(initialImageFile && !hasManual ? "photo" : "manual");
    }, [isOpen, initialForm, initialImageFile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        const hasManual = hasPrescriptionMeasurements(formData);
        const hasImage = Boolean(imageFile);
        const hasNotes = String(formData.prescriptionNotes || "").trim() !== "";

        if (!hasManual && !hasImage && !hasNotes) {
            return;
        }

        onConfirm?.({
            form: { ...formData },
            imageFile,
        });
        onClose?.();
    };

    const canConfirm =
        hasPrescriptionMeasurements(formData) ||
        Boolean(imageFile) ||
        String(formData.prescriptionNotes || "").trim() !== "";

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}>
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                />

                <Motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-700 text-white shrink-0">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300 font-semibold">
                                Óptica · Receta
                            </p>
                            <h3 className="text-lg font-bold leading-tight text-white">{title}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="px-5 pt-3 flex gap-2 border-b border-gray-100 shrink-0 bg-white">
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
                            <FaCamera /> Foto
                        </button>
                    </div>

                    <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
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
                                required={false}
                            />
                            <div className="relative">
                                <select
                                    id="rxDraftType"
                                    name="prescriptionType"
                                    value={formData.prescriptionType}
                                    onChange={handleInputChange}
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
                                    htmlFor="rxDraftType"
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
                            />
                        )}

                        {activeTab === "photo" && (
                            <ImageUploadField
                                file={imageFile}
                                onFileChange={setImageFile}
                                onRemove={() => setImageFile(null)}
                                existingImageUrl={null}
                                label="Fotografía de la receta escrita"
                                hint="PNG, JPG — puedes combinar foto + graduación"
                            />
                        )}

                        <div>
                            <label
                                htmlFor="rxDraftNotes"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Notas clínicas
                            </label>
                            <textarea
                                id="rxDraftNotes"
                                name="prescriptionNotes"
                                value={formData.prescriptionNotes}
                                onChange={handleInputChange}
                                rows={2}
                                className="block px-3 py-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 resize-none"
                                placeholder="Observaciones del oftalmólogo, uso recomendado, etc."
                            />
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} className={CANCEL_BTN}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={CONFIRM_BTN}
                            title={
                                !canConfirm
                                    ? "Ingresa graduación, foto o una nota"
                                    : undefined
                            }
                        >
                            <FaCheck className="text-xs" />
                            {confirmLabel}
                        </button>
                    </div>
                </Motion.div>
            </div>
        </AnimatePresence>,
        document.body,
    );
}
