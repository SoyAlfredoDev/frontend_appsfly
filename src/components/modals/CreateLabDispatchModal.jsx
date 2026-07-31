import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaTimes } from "react-icons/fa";
import { getLaboratories } from "../../api/laboratories.js";
import { getWorkOrders } from "../../api/workOrders.js";
import { createLabDispatch } from "../../api/labDispatches.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function CreateLabDispatchModal({ isOpen, onClose, onCreated }) {
    const toast = useToast();
    const [laboratories, setLaboratories] = useState([]);
    const [laboratoryId, setLaboratoryId] = useState("");
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notes, setNotes] = useState("");
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setLaboratoryId("");
        setPendingOrders([]);
        setSelectedIds([]);
        setNotes("");
        getLaboratories({ activeOnly: true })
            .then(({ data }) => setLaboratories(Array.isArray(data) ? data : []))
            .catch(() => setLaboratories([]));
    }, [isOpen]);

    useEffect(() => {
        if (!laboratoryId) {
            setPendingOrders([]);
            setSelectedIds([]);
            return;
        }
        setIsLoadingOrders(true);
        getWorkOrders({ status: "PENDING_SHIPMENT", laboratoryId })
            .then(({ data }) => {
                setPendingOrders(Array.isArray(data) ? data : []);
                setSelectedIds([]);
            })
            .catch(() => setPendingOrders([]))
            .finally(() => setIsLoadingOrders(false));
    }, [laboratoryId]);

    const toggleSelected = (workOrderId) => {
        setSelectedIds((prev) =>
            prev.includes(workOrderId) ? prev.filter((id) => id !== workOrderId) : [...prev, workOrderId],
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pendingOrders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingOrders.map((o) => o.workOrderId));
        }
    };

    const formatCustomerName = (customer) =>
        [customer?.customerFirstName, customer?.customerLastName].filter(Boolean).join(" ") || "—";

    const handleClose = () => {
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!laboratoryId) {
            toast.error("Campos incompletos", "Selecciona un laboratorio.");
            return;
        }
        if (selectedIds.length === 0) {
            toast.error("Campos incompletos", "Selecciona al menos una orden de trabajo.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createLabDispatch({ laboratoryId, workOrderIds: selectedIds, labDispatchNotes: notes });
            toast.success("Despacho registrado", "El despacho a laboratorio se creó correctamente.");
            onCreated?.();
        } catch (error) {
            toast.error(
                "No se pudo crear el despacho",
                error.response?.data?.message ?? "Ocurrió un error al registrar el despacho.",
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
                                    <FaTruck size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">Nuevo despacho a laboratorio</h3>
                                    <p className="text-xs text-gray-500">Agrupa OT pendientes de envío del mismo laboratorio</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="createLabDispatchForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Laboratorio *</label>
                                    <select
                                        value={laboratoryId}
                                        onChange={(e) => setLaboratoryId(e.target.value)}
                                        className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="">Selecciona un laboratorio</option>
                                        {laboratories.map((lab) => (
                                            <option key={lab.laboratoryId} value={lab.laboratoryId}>
                                                {lab.laboratoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {laboratoryId && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase">
                                                Órdenes de trabajo pendientes de envío
                                            </label>
                                            {pendingOrders.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={toggleSelectAll}
                                                    className="text-xs font-semibold text-primary hover:underline"
                                                >
                                                    {selectedIds.length === pendingOrders.length ? "Deseleccionar todo" : "Seleccionar todo"}
                                                </button>
                                            )}
                                        </div>
                                        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
                                            {isLoadingOrders ? (
                                                <div className="p-4 text-center text-sm text-gray-500">Cargando órdenes...</div>
                                            ) : pendingOrders.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    No hay OT pendientes de envío para este laboratorio.
                                                </div>
                                            ) : (
                                                pendingOrders.map((order) => (
                                                    <label
                                                        key={order.workOrderId}
                                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(order.workOrderId)}
                                                            onChange={() => toggleSelected(order.workOrderId)}
                                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-800 font-mono text-xs">{order.workOrderNumber}</p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {formatCustomerName(order.customer)} · {order.saleDetail?.product?.productName || "—"}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notas del despacho</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                                        placeholder="Notas opcionales para el despacho..."
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
                                form="createLabDispatchForm"
                                className={`${PRIMARY_BTN} disabled:opacity-70`}
                                disabled={isSubmitting}
                            >
                                <FaTruck className="text-xs" />
                                {isSubmitting ? "Creando..." : "Crear despacho"}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
