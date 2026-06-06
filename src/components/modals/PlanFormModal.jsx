import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import SelectFloatingComponent from "../inputs/SelectFloatingComponent.jsx";
import TextareaFloatingComponent from "../inputs/TextareaFloatingComponent.jsx";
import { createPlanRequest, updatePlanRequest } from "../../api/plans.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";
import {
    featuresToTextarea,
    billingValueToDuration,
    durationToBillingValue,
    normalizePlan,
} from "../../utils/planUtils.js";

const CURRENCY_OPTIONS = [
    { value: "CLP", label: "CLP — Peso chileno" },
    { value: "USD", label: "USD — Dólar" },
];

const BILLING_OPTIONS = [
    { value: "1", label: "Mensual" },
    { value: "12", label: "Anual" },
];

const EMPTY_FORM = {
    planName: "",
    planPrice: "",
    planCurrency: "CLP",
    planDuration: "1",
    planDescription: "",
    planFeatures: "",
};

function planToForm(plan) {
    if (!plan) return { ...EMPTY_FORM };
    return {
        planName: plan.planName ?? "",
        planPrice: String(plan.planPrice ?? ""),
        planCurrency: plan.planCurrency ?? "CLP",
        planDuration: durationToBillingValue(plan.planDuration),
        planDescription: plan.planDescription ?? "",
        planFeatures: featuresToTextarea(plan.planFeatures),
    };
}

/** Botón disparador para crear plan */
export function AddPlanTrigger({ onClick }) {
    return (
        <button type="button" onClick={onClick} className={PRIMARY_BTN}>
            <FaPlus />
            Agregar Plan
        </button>
    );
}

/**
 * Modal unificado crear / editar plan comercial.
 * @param {{ open: boolean, plan?: object|null, onClose: Function, onSaved: Function }} props
 */
export default function PlanFormModal({ open, plan = null, onClose, onSaved }) {
    const toast = useToast();
    const isEdit = Boolean(plan?.planId);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (open) {
            setForm(planToForm(plan));
        }
    }, [open, plan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        if (!loading) onClose();
    };

    const buildPayload = () => {
        const features = form.planFeatures
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        return {
            planName: form.planName.trim(),
            planPrice: parseFloat(form.planPrice) || 0,
            planCurrency: form.planCurrency,
            planDuration: billingValueToDuration(form.planDuration),
            planDescription: form.planDescription.trim() || null,
            planFeatures: features,
        };
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!form.planName.trim()) {
            toast.error("Validación", "El nombre del plan es obligatorio.");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                const res = await updatePlanRequest(plan.planId, buildPayload());
                toast.success("Plan actualizado", "Los cambios se guardaron correctamente.");
                onSaved?.(normalizePlan(res.data));
            } else {
                const res = await createPlanRequest({ ...buildPayload(), planActive: true });
                toast.success("Plan creado", "El plan comercial se registró correctamente.");
                onSaved?.(normalizePlan(res.data));
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(
                "Error",
                error.response?.data?.message ??
                    (isEdit ? "No se pudo actualizar el plan." : "No se pudo crear el plan."),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="absolute inset-0 bg-dark/50 backdrop-blur-sm"
                    />
                    <Motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/80 shrink-0">
                            <h3 className="font-display text-lg font-bold text-dark flex items-center gap-2">
                                {isEdit ? (
                                    <>
                                        <FaEdit className="text-secondary text-base" />
                                        Editar plan
                                    </>
                                ) : (
                                    "Nuevo plan comercial"
                                )}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-4 overflow-y-auto custom-scrollbar"
                        >
                            {isEdit && (
                                <p className="text-xs text-slate-500 font-mono bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                    ID: {plan.planId}
                                </p>
                            )}

                            <InputFloatingComponent
                                label="Nombre del plan"
                                name="planName"
                                value={form.planName}
                                onChange={handleChange}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputFloatingComponent
                                    label="Precio"
                                    name="planPrice"
                                    type="number"
                                    value={form.planPrice}
                                    onChange={handleChange}
                                />
                                <SelectFloatingComponent
                                    label="Moneda"
                                    name="planCurrency"
                                    value={form.planCurrency}
                                    onChange={handleChange}
                                    options={CURRENCY_OPTIONS}
                                    className="!mb-0"
                                />
                            </div>

                            <SelectFloatingComponent
                                label="Ciclo de facturación"
                                name="planDuration"
                                value={form.planDuration}
                                onChange={handleChange}
                                options={BILLING_OPTIONS}
                                className="!mb-0"
                            />

                            <TextareaFloatingComponent
                                label="Descripción"
                                name="planDescription"
                                value={form.planDescription}
                                onChange={handleChange}
                                required={false}
                                rows={2}
                            />

                            <TextareaFloatingComponent
                                label="Características (una por línea)"
                                name="planFeatures"
                                value={form.planFeatures}
                                onChange={handleChange}
                                required={false}
                                rows={4}
                            />
                        </form>

                        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="btn-ghost"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`${PRIMARY_BTN} disabled:opacity-60`}
                            >
                                {loading
                                    ? "Guardando…"
                                    : isEdit
                                      ? "Guardar cambios"
                                      : "Crear plan"}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
