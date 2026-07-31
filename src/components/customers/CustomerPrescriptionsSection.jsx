import { useState } from "react";
import { FaEye, FaPlus, FaEdit, FaTrash, FaCamera, FaKeyboard } from "react-icons/fa";
import formatDate from "../../utils/formatDate.js";
import formatName from "../../utils/formatName.js";
import { deletePrescription } from "../../api/prescriptions.js";
import { useToast } from "../../context/ToastContext.jsx";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import AddPrescriptionModal from "../modals/AddPrescriptionModal.jsx";
import ImagePreviewModal from "../modals/ImagePreviewModal.jsx";

const TYPE_LABELS = {
    lejos: "Lejos",
    cerca: "Cerca",
    multifocal: "Multifocal",
    progresivo: "Progresivo",
    otro: "Otro",
};

function formatRxEye(sphere, cylinder, axis) {
    const parts = [sphere, cylinder, axis].filter((v) => v != null && String(v).trim() !== "");
    if (parts.length === 0) return "—";
    return parts.join(" / ");
}

export default function CustomerPrescriptionsSection({
    customerId,
    prescriptions = [],
    loading = false,
    onRefresh,
}) {
    const toast = useToast();
    const { can } = useTenantPermissions();
    const canWrite = can("customers:write");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const openCreate = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const openEdit = (prescription) => {
        setEditing(prescription);
        setIsModalOpen(true);
    };

    const handleDelete = async (prescription) => {
        if (!canWrite || deletingId) return;
        const ok = window.confirm("¿Eliminar esta receta del historial del cliente?");
        if (!ok) return;

        setDeletingId(prescription.prescriptionId);
        try {
            await deletePrescription(prescription.prescriptionId);
            toast.success("Receta eliminada", "Se quitó del historial del cliente.");
            onRefresh?.();
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo eliminar la receta.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FaEye className="text-teal-600" /> Historial de Recetas
                        </h3>
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
                            {prescriptions.length}
                        </span>
                    </div>
                    {canWrite && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            <FaPlus className="text-xs" /> Nueva receta
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">OD</th>
                                <th className="px-4 py-3">OI</th>
                                <th className="px-4 py-3">Registro</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                        Cargando recetas...
                                    </td>
                                </tr>
                            ) : prescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                        No hay recetas registradas
                                    </td>
                                </tr>
                            ) : (
                                prescriptions.map((rx) => (
                                    <tr key={rx.prescriptionId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600">
                                            {rx.prescriptionDate
                                                ? formatDate(rx.prescriptionDate)
                                                : formatDate(rx.createdAt)}
                                            {rx.prescribedBy && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {rx.prescribedBy}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {TYPE_LABELS[rx.prescriptionType] || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-800">
                                            {formatRxEye(rx.odSphere, rx.odCylinder, rx.odAxis)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-800">
                                            {formatRxEye(rx.oiSphere, rx.oiCylinder, rx.oiAxis)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                {(rx.entryMode === "PHOTO" || rx.entryMode === "MIXED") && (
                                                    <span title="Con foto" className="inline-flex items-center gap-1 text-xs">
                                                        <FaCamera className="text-teal-500" />
                                                    </span>
                                                )}
                                                {(rx.entryMode === "MANUAL" || rx.entryMode === "MIXED") && (
                                                    <span title="Datos manuales" className="inline-flex items-center gap-1 text-xs">
                                                        <FaKeyboard className="text-slate-500" />
                                                    </span>
                                                )}
                                            </div>
                                            {rx.createdBy && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {[rx.createdBy.userFirstName, rx.createdBy.userLastName]
                                                        .map(formatName)
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {rx.prescriptionImageUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewUrl(rx.prescriptionImageUrl)}
                                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded"
                                                        title="Ver foto"
                                                    >
                                                        <FaCamera className="text-xs" />
                                                    </button>
                                                )}
                                                {canWrite && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(rx)}
                                                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                                                            title="Editar"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(rx)}
                                                            disabled={deletingId === rx.prescriptionId}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddPrescriptionModal
                customerId={customerId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                }}
                onSaved={onRefresh}
                prescriptionToEdit={editing}
            />

            <ImagePreviewModal
                isOpen={Boolean(previewUrl)}
                onClose={() => setPreviewUrl(null)}
                imageUrl={previewUrl}
                title="Receta médica"
                alt="Fotografía de la receta"
                downloadFilename={`receta-${customerId ?? "imagen"}`}
            />
        </>
    );
}
