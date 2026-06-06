import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    FaLayerGroup,
    FaCheck,
    FaPause,
    FaPlay,
    FaTrash,
    FaExclamationTriangle,
    FaEdit,
    FaSyncAlt,
} from "react-icons/fa";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import PlanFormModal, { AddPlanTrigger } from "../../components/modals/PlanFormModal.jsx";
import {
    getAdminPlansRequest,
    updatePlanStatusRequest,
    deletePlanRequest,
} from "../../api/plans.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import { parsePlanFeatures, normalizePlan } from "../../utils/planUtils.js";
import {
    containerVariants,
    itemVariants,
    KPI_CARD,
    KPI_ICON_PRIMARY,
    KPI_ICON_SECONDARY,
    KPI_LABEL,
    KPI_VALUE,
    PRIMARY_BTN,
} from "../../utils/expenseUiPatterns.js";

function billingLabel(months) {
    const n = Number(months);
    if (n === 1) return "Mensual";
    if (n === 12) return "Anual";
    return `${n} meses`;
}

function PlanStatusBadge({ active }) {
    if (active) {
        return (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Disponible
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Suspendido
        </span>
    );
}

function PlanCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="space-y-2 flex-1">
                    <div className="h-2 w-12 bg-slate-200 rounded" />
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded mb-4" />
            <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
                <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
            </div>
        </div>
    );
}

function PlanCard({ plan, onEdit, onPlanPatched, onPlanRemoved }) {
    const toast = useToast();
    const confirm = useConfirm();
    const [busy, setBusy] = useState(false);

    const features = parsePlanFeatures(plan.planFeatures);
    const isActive = plan.planActive !== false;
    const priceLabel =
        plan.planCurrency && plan.planCurrency !== "CLP"
            ? `${plan.planCurrency} ${Number(plan.planPrice).toLocaleString("es-CL")}`
            : formatCurrency(plan.planPrice);

    const handleToggleStatus = async () => {
        const nextActive = !isActive;
        const ok = await confirm({
            title: nextActive ? "Reactivar plan" : "Suspender plan",
            message: nextActive
                ? `¿Habilitar nuevamente "${plan.planName}" para nuevas contrataciones?`
                : `¿Suspender "${plan.planName}"? Los clientes actuales mantienen su suscripción; no habrá nuevas altas.`,
            variant: nextActive ? "success" : "danger",
            confirmText: nextActive ? "Reactivar" : "Suspender",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        setBusy(true);
        const previousActive = isActive;
        onPlanPatched(plan.planId, { planActive: nextActive });

        try {
            const res = await updatePlanStatusRequest(plan.planId, nextActive);
            onPlanPatched(plan.planId, normalizePlan(res.data));
            toast.success(
                nextActive ? "Plan reactivado" : "Plan suspendido",
                nextActive
                    ? "El plan ya puede contratarse."
                    : "No se permitirán nuevas contrataciones.",
            );
        } catch (error) {
            onPlanPatched(plan.planId, { planActive: previousActive });
            toast.error("Error", error.response?.data?.message ?? "No se pudo actualizar el plan.");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: "Eliminar plan",
            message: `¿Eliminar permanentemente "${plan.planName}"? Esta acción no se puede deshacer.`,
            variant: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!ok) return;

        setBusy(true);
        try {
            await deletePlanRequest(plan.planId);
            onPlanRemoved(plan.planId);
            toast.success("Plan eliminado", "El plan fue removido del catálogo.");
        } catch (error) {
            toast.error("Error", error.response?.data?.message ?? "No se pudo eliminar el plan.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                            {plan.planId}
                        </p>
                        <h3 className="font-display text-lg font-bold text-dark truncate">
                            {plan.planName}
                        </h3>
                    </div>
                    <PlanStatusBadge active={isActive} />
                </div>

                <div>
                    <p className="text-2xl font-bold text-primary">{priceLabel}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Facturación {billingLabel(plan.planDuration).toLowerCase()}
                    </p>
                </div>

                {plan.planDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {plan.planDescription}
                    </p>
                )}

                {features.length > 0 && (
                    <ul className="space-y-1.5 flex-1">
                        {features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                <FaCheck className="text-primary shrink-0 mt-0.5 text-[10px]" />
                                <span>{feature}</span>
                            </li>
                        ))}
                        {features.length > 5 && (
                            <li className="text-[10px] text-slate-400 pl-4">
                                +{features.length - 5} más
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-slate-50/60 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(plan)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-secondary/20 bg-white text-secondary hover:bg-secondary/5 transition-colors disabled:opacity-50"
                >
                    <FaEdit />
                    Editar
                </button>
                <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    {isActive ? (
                        <>
                            <FaPause className="text-amber-500" />
                            Suspender
                        </>
                    ) : (
                        <>
                            <FaPlay className="text-primary" />
                            Reactivar
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                    <FaTrash />
                    Eliminar
                </button>
            </div>
        </article>
    );
}

export default function PlansAdminPage() {
    const toast = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const loadPlans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminPlansRequest();
            const list = Array.isArray(res.data) ? res.data : [];
            setPlans(list.map(normalizePlan));
        } catch (err) {
            console.error(err);
            const apiMsg = err.response?.data?.message;
            setError(apiMsg ?? "No se pudieron cargar los planes comerciales.");
            toast.error("Error de carga", apiMsg ?? "Verifica la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const handlePlanPatched = useCallback((planId, patch) => {
        setPlans((prev) =>
            prev.map((p) => (p.planId === planId ? normalizePlan({ ...p, ...patch }) : p)),
        );
    }, []);

    const handlePlanRemoved = useCallback((planId) => {
        setPlans((prev) => prev.filter((p) => p.planId !== planId));
    }, []);

    const handlePlanSaved = useCallback(
        (savedPlan) => {
            if (!savedPlan?.planId) {
                loadPlans();
                return;
            }
            setPlans((prev) => {
                const idx = prev.findIndex((p) => p.planId === savedPlan.planId);
                if (idx === -1) return [savedPlan, ...prev];
                const next = [...prev];
                next[idx] = savedPlan;
                return next;
            });
        },
        [loadPlans],
    );

    const metrics = useMemo(() => {
        const total = plans.length;
        const active = plans.filter((p) => p.planActive !== false).length;
        return { total, active, suspended: total - active };
    }, [plans]);

    return (
        <PageContainer>
            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <PageHeader
                        title="Gestión de Planes"
                        subtitle="Controla la oferta comercial, precios y disponibilidad para nuevas contrataciones"
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={loadPlans}
                                    disabled={loading}
                                    className="btn-ghost inline-flex items-center gap-2"
                                >
                                    <FaSyncAlt className={loading ? "animate-spin" : ""} />
                                    Actualizar
                                </button>
                                <AddPlanTrigger onClick={() => setCreateOpen(true)} />
                            </div>
                        }
                    />
                </motion.div>

                {error && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <p className="text-red-700 text-sm flex items-start gap-2">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            {error}
                        </p>
                        <button type="button" onClick={loadPlans} className={PRIMARY_BTN}>
                            Reintentar
                        </button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div variants={itemVariants} className={KPI_CARD}>
                        <div className={KPI_ICON_PRIMARY}>
                            <FaLayerGroup className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Total planes</p>
                            <p className={KPI_VALUE}>{loading ? "—" : metrics.total}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className={KPI_CARD}>
                        <div className={KPI_ICON_PRIMARY}>
                            <FaCheck className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Disponibles</p>
                            <p className={KPI_VALUE}>{loading ? "—" : metrics.active}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className={KPI_CARD}>
                        <div className={KPI_ICON_SECONDARY}>
                            <FaPause className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Suspendidos</p>
                            <p className={KPI_VALUE}>{loading ? "—" : metrics.suspended}</p>
                        </div>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <PlanCardSkeleton key={i} />
                        ))}
                    </div>
                ) : !error && plans.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <FaLayerGroup className="text-4xl text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-600">
                            No hay planes comerciales registrados.
                        </p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                            Usa &quot;Agregar Plan&quot; para publicar tu primera oferta.
                        </p>
                        <AddPlanTrigger onClick={() => setCreateOpen(true)} />
                    </div>
                ) : (
                    !error && (
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            data-testid="plans-grid"
                        >
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.planId}
                                    plan={plan}
                                    onEdit={setEditingPlan}
                                    onPlanPatched={handlePlanPatched}
                                    onPlanRemoved={handlePlanRemoved}
                                />
                            ))}
                        </div>
                    )
                )}
            </motion.div>

            <PlanFormModal
                open={createOpen}
                plan={null}
                onClose={() => setCreateOpen(false)}
                onSaved={handlePlanSaved}
            />

            <PlanFormModal
                open={Boolean(editingPlan)}
                plan={editingPlan}
                onClose={() => setEditingPlan(null)}
                onSaved={handlePlanSaved}
            />
        </PageContainer>
    );
}
