import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaClipboardList, FaTimes } from "react-icons/fa";
import { getLaboratories } from "../../api/laboratories.js";
import { getPrescriptionsByCustomerId } from "../../api/prescriptions.js";
import { generateWorkOrders } from "../../api/workOrders.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function GenerateWorkOrdersModal({
    isOpen,
    onClose,
    saleId,
    saleDetails = [],
    customerId,
    onGenerated,
}) {
    const toast = useToast();
    const [laboratories, setLaboratories] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedDetailIds, setSelectedDetailIds] = useState([]);
    const [prescriptionId, setPrescriptionId] = useState("");
    const [laboratoryId, setLaboratoryId] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productLines = useMemo(
        () => (saleDetails || []).filter((line) => line.saleDetailType === "PRODUCT"),
        [saleDetails],
    );

    useEffect(() => {
        if (!isOpen) return;

        const preSelected = productLines
            .filter((line) => line.product?.productRequiresLabWork)
            .map((line) => line.saleDetailId);
        setSelectedDetailIds(preSelected.length > 0 ? preSelected : productLines.map((l) => l.saleDetailId));
        setPrescriptionId("");
        setLaboratoryId("");
        setNotes("");

        getLaboratories({ activeOnly: true })
            .then(({ data }) => setLaboratories(Array.isArray(data) ? data : []))
            .catch(() => setLaboratories([]));

        if (customerId) {
            getPrescriptionsByCustomerId(customerId)
                .then(({ data }) => setPrescriptions(Array.isArray(data) ? data : []))
                .catch(() => setPrescriptions([]));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, customerId]);

    const toggleDetail = (saleDetailId) => {
        setSelectedDetailIds((prev) =>
            prev.includes(saleDetailId) ? prev.filter((id) => id !== saleDetailId) : [...prev, saleDetailId],
        );
    };

    const handleClose = () => {
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedDetailIds.length === 0) {
            toast.error("Campos incompletos", "Selecciona al menos un producto para generar la OT.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await generateWorkOrders({
                saleId,
                saleDetailIds: selectedDetailIds,
                prescriptionId: prescriptionId || undefined,
                laboratoryId: laboratoryId || undefined,
                notes: notes || undefined,
            });
            const count = data?.workOrders?.length ?? 0;
            toast.success(
                "Órdenes de trabajo generadas",
                `Se generaron ${count} orden(es) de trabajo correctamente.`,
            );
            onGenerated?.(data?.workOrders);
        } catch (error) {
            toast.error(
                "No se pudieron generar",
                error.response?.data?.message ?? "Ocurrió un error al generar las órdenes de trabajo.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />
                    <Motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                    <FaClipboardList size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">Generar Orden(es) de Trabajo</h3>
                                    <p className="text-xs text-gray-500">Selecciona los productos ópticos a procesar</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="generateWorkOrdersForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                        Productos de la venta
                                    </label>
                                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                                        {productLines.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Esta venta no tiene productos elegibles para OT.
                                            </div>
                                        ) : (
                                            productLines.map((line) => (
                                                <label
                                                    key={line.saleDetailId}
                                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDetailIds.includes(line.saleDetailId)}
                                                        onChange={() => toggleDetail(line.saleDetailId)}
                                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-800 truncate">
                                                            {line.product?.productName || "Producto"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            SKU: {line.product?.productSKU || "—"} · Cant: {line.saleDetailQuantity}
                                                        </p>
                                                    </div>
                                                    {line.product?.productRequiresLabWork && (
                                                        <span className="text-[10px] font-semibold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                            Requiere lab.
                                                        </span>
                                                    )}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receta (opcional)</label>
                                        <select
                                            value={prescriptionId}
                                            onChange={(e) => setPrescriptionId(e.target.value)}
                                            className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Sin receta</option>
                                            {prescriptions.map((rx) => (
                                                <option key={rx.prescriptionId} value={rx.prescriptionId}>
                                                    {rx.prescriptionType || "Receta"} · {rx.prescriptionDate ? new Date(rx.prescriptionDate).toLocaleDateString("es-CL") : "s/f"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Laboratorio (opcional)</label>
                                        <select
                                            value={laboratoryId}
                                            onChange={(e) => setLaboratoryId(e.target.value)}
                                            className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">Sin asignar</option>
                                            {laboratories.map((lab) => (
                                                <option key={lab.laboratoryId} value={lab.laboratoryId}>
                                                    {lab.laboratoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notas</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                                        placeholder="Notas opcionales para la OT..."
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="generateWorkOrdersForm"
                                className={`${PRIMARY_BTN} disabled:opacity-70`}
                                disabled={isSubmitting || productLines.length === 0}
                            >
                                <FaClipboardList className="text-xs" />
                                {isSubmitting ? "Generando..." : "Generar OT"}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
