import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaSlidersH } from "react-icons/fa";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { createInventoryAdjustment } from "../../api/inventory.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

const ADJUSTMENT_TYPES = [
    { value: "AJUSTE_MANUAL", label: "Ajuste manual" },
    { value: "MERMA", label: "Merma / pérdida" },
    { value: "DEVOLUCION", label: "Devolución / entrada" },
];

export default function InventoryAdjustmentModal({ stockList = [], onAdjusted, triggerClassName }) {
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        productId: "",
        movementType: "AJUSTE_MANUAL",
        adjustmentMode: "delta",
        quantityDelta: "",
        targetStock: "",
        reason: "",
    });

    const selectedProduct = useMemo(
        () => stockList.find((item) => item.productId === form.productId),
        [stockList, form.productId],
    );

    const previewStock = useMemo(() => {
        const current = Number(selectedProduct?.quantityOnHand ?? 0);
        if (!selectedProduct) return null;

        if (form.adjustmentMode === "count") {
            const target = Number(form.targetStock);
            if (!Number.isFinite(target)) return { current, next: null };
            return { current, next: target };
        }

        const qty = Number(form.quantityDelta);
        if (!Number.isFinite(qty) || qty === 0) return { current, next: null };

        let delta = qty;
        if (form.movementType === "MERMA") delta = -Math.abs(qty);
        if (form.movementType === "DEVOLUCION") delta = Math.abs(qty);

        return { current, next: current + delta };
    }, [selectedProduct, form]);

    const resetForm = () => {
        setForm({
            productId: "",
            movementType: "AJUSTE_MANUAL",
            adjustmentMode: "delta",
            quantityDelta: "",
            targetStock: "",
            reason: "",
        });
        setError(null);
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        if (loading) return;
        setIsOpen(false);
        resetForm();
    };

    useEffect(() => {
        if (!isOpen) return;
        if (stockList.length === 1 && !form.productId) {
            setForm((prev) => ({ ...prev, productId: stockList[0].productId }));
        }
    }, [isOpen, stockList, form.productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.productId) {
            setError("Selecciona un producto.");
            return;
        }
        if (!form.reason.trim()) {
            setError("El motivo es obligatorio.");
            return;
        }

        setLoading(true);
        try {
            await createInventoryAdjustment({
                productId: form.productId,
                movementType: form.movementType,
                adjustmentMode: form.adjustmentMode,
                quantityDelta: form.adjustmentMode === "delta" ? Number(form.quantityDelta) : undefined,
                targetStock: form.adjustmentMode === "count" ? Number(form.targetStock) : undefined,
                reason: form.reason.trim(),
            });

            toast.success("Ajuste registrado", "El stock se actualizó correctamente.");
            closeModal();
            if (onAdjusted) onAdjusted();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "No se pudo registrar el ajuste.";
            setError(msg);
            toast.error("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className={triggerClassName ?? PRIMARY_BTN}
            >
                <FaSlidersH />
                <span className="hidden md:inline">Ajuste manual</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 16 }}
                            className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 font-display">
                                        Ajuste de inventario
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Corrige stock por conteo, merma o devolución
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form
                                id="inventoryAdjustmentForm"
                                onSubmit={handleSubmit}
                                className="p-6 overflow-y-auto space-y-4"
                            >
                                <div className="relative">
                                    <select
                                        id="productId"
                                        name="productId"
                                        value={form.productId}
                                        onChange={handleChange}
                                        required
                                        className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors"
                                    >
                                        <option value="">Selecciona un producto</option>
                                        {stockList.map((item) => (
                                            <option key={item.productId} value={item.productId}>
                                                {item.productName} — Stock: {item.quantityOnHand}
                                            </option>
                                        ))}
                                    </select>
                                    <label
                                        htmlFor="productId"
                                        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                    >
                                        Producto
                                    </label>
                                </div>

                                <div className="relative">
                                    <select
                                        id="movementType"
                                        name="movementType"
                                        value={form.movementType}
                                        onChange={handleChange}
                                        className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors"
                                    >
                                        {ADJUSTMENT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <label
                                        htmlFor="movementType"
                                        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                    >
                                        Tipo de movimiento
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-lg border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, adjustmentMode: "delta" }))}
                                        className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                                            form.adjustmentMode === "delta"
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        Por cantidad
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, adjustmentMode: "count" }))}
                                        className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                                            form.adjustmentMode === "count"
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        Conteo físico
                                    </button>
                                </div>

                                {form.adjustmentMode === "delta" ? (
                                    <InputFloatingComponent
                                        label={
                                            form.movementType === "AJUSTE_MANUAL"
                                                ? "Cantidad (+/-)"
                                                : "Cantidad"
                                        }
                                        type="number"
                                        name="quantityDelta"
                                        value={form.quantityDelta}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <InputFloatingComponent
                                        label="Stock real contado"
                                        type="number"
                                        name="targetStock"
                                        value={form.targetStock}
                                        onChange={handleChange}
                                    />
                                )}

                                <InputFloatingComponent
                                    label="Motivo"
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                />

                                {previewStock && (
                                    <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
                                        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                                            Vista previa
                                        </p>
                                        <p className="text-gray-700">
                                            Stock actual:{" "}
                                            <span className="font-bold tabular-nums">{previewStock.current}</span>
                                            {previewStock.next !== null && (
                                                <>
                                                    {" "}
                                                    → Nuevo:{" "}
                                                    <span
                                                        className={`font-bold tabular-nums ${
                                                            previewStock.next < 0
                                                                ? "text-red-600"
                                                                : "text-primary"
                                                        }`}
                                                    >
                                                        {previewStock.next}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}
                            </form>

                            <div className="flex justify-end gap-3 p-6 border-t border-gray-50 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    form="inventoryAdjustmentForm"
                                    disabled={loading}
                                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    <FaPlus size={12} />
                                    {loading ? "Guardando..." : "Confirmar ajuste"}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
