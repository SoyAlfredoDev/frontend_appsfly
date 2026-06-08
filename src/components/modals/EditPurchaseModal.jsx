import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import { updatePurchase } from "../../api/purchase.js";
import { getProviders } from "../../api/providers.js";
import { FaTimes, FaSave } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../context/ToastContext.jsx";
import { formatProviderLabel } from "../../utils/providerContact.js";

export default function EditPurchaseModal({ purchase, isOpen, onClose, onUpdated }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [form, setForm] = useState({
        purchaseRealNumber: "",
        purchaseProviderId: "",
        purchaseComment: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        getProviders()
            .then((res) => setProviders(Array.isArray(res.data) ? res.data : []))
            .catch(() => setProviders([]));

        if (purchase) {
            setForm({
                purchaseRealNumber: purchase.purchaseRealNumber || "",
                purchaseProviderId: purchase.purchaseProviderId || purchase.provider?.providerId || "",
                purchaseComment: purchase.purchaseComment || "",
            });
        }
    }, [isOpen, purchase]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!purchase?.purchaseId) return;

        if (!form.purchaseRealNumber.trim()) {
            toast.info("Campo requerido", "Ingresa el número de documento.");
            return;
        }
        if (!form.purchaseProviderId) {
            toast.info("Campo requerido", "Selecciona un proveedor.");
            return;
        }

        setLoading(true);
        try {
            await updatePurchase(purchase.purchaseId, {
                purchaseRealNumber: form.purchaseRealNumber.trim(),
                purchaseProviderId: form.purchaseProviderId,
                purchaseComment: form.purchaseComment.trim() || null,
            });
            toast.success("Compra actualizada", "Los datos se guardaron correctamente.");
            onUpdated?.();
            onClose?.();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo actualizar la compra.",
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <Motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 16 }}
                    className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 font-display">
                            Editar compra
                        </h3>
                        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="relative">
                            <select
                                id="purchaseProviderId"
                                name="purchaseProviderId"
                                value={form.purchaseProviderId}
                                onChange={handleChange}
                                required
                                className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:border-primary peer"
                            >
                                <option value="">Selecciona proveedor</option>
                                {providers.map((p) => (
                                    <option key={p.providerId} value={p.providerId}>
                                        {formatProviderLabel(p.providerName)}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="purchaseProviderId" className="absolute text-sm text-slate-500 -translate-y-3 scale-75 top-3.5 start-3">
                                Proveedor
                            </label>
                        </div>

                        <InputFloatingComponent
                            label="Nro. documento / factura"
                            name="purchaseRealNumber"
                            value={form.purchaseRealNumber}
                            onChange={handleChange}
                        />

                        <InputFloatingComponent
                            label="Notas"
                            name="purchaseComment"
                            value={form.purchaseComment}
                            onChange={handleChange}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaSave />
                                {loading ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                </Motion.div>
            </div>
        </AnimatePresence>,
        document.body,
    );
}
