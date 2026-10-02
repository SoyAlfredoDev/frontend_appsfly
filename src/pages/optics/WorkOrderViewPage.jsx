import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaClipboardList,
    FaSave,
    FaTrash,
    FaTruckLoading,
    FaCheckCircle,
    FaWhatsapp,
} from "react-icons/fa";
import {
    getWorkOrderById,
    updateWorkOrder,
    updateWorkOrderStatus,
    receiveWorkOrder,
    deleteWorkOrderById,
} from "../../api/workOrders.js";
import { getLaboratories } from "../../api/laboratories.js";
import { getPrescriptionsByCustomerId } from "../../api/prescriptions.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useAuth } from "../../context/authContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import DataErrorPanel from "../../components/ui/DataErrorPanel.tsx";
import { DetailFieldsSkeleton, TableRowsSkeleton } from "../../components/ui/DataSkeleton.tsx";
import WorkOrderStatusBadge from "../../components/optics/WorkOrderStatusBadge.jsx";
import SendDocumentWhatsAppOption from "../../components/sales/SendDocumentWhatsAppOption.jsx";
import { WORK_ORDER_STATUS_LABELS, getNextWorkOrderStatuses } from "../../utils/workOrderStatus.js";
import {
    buildWorkOrderReadyWhatsAppMessage,
    buildWorkOrderReadyWhatsAppShareUrl,
} from "../../utils/workOrderShare.js";
import { getReceiptBranding } from "../../utils/businessReceiptSettings.js";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function WorkOrderViewPage() {
    const { id } = useParams();
    const toast = useToast();
    const confirm = useConfirm();
    const { business } = useAuth();

    const [workOrder, setWorkOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [laboratories, setLaboratories] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
    const [editForm, setEditForm] = useState({ laboratoryId: "", prescriptionId: "", workOrderNotes: "" });

    const canEdit = ["CREATED", "PENDING_SHIPMENT"].includes(workOrder?.workOrderStatus);
    const canDelete = canEdit && !workOrder?.labDispatchId;
    const canReceive = workOrder?.workOrderStatus === "SENT_TO_LAB";
    const isReadyForDelivery = workOrder?.workOrderStatus === "READY_FOR_DELIVERY";
    const nextStatuses = useMemo(
        () => (workOrder ? getNextWorkOrderStatuses(workOrder.workOrderStatus) : []),
        [workOrder],
    );

    const customerPhone = workOrder?.customer?.customerPhoneNumber?.trim() || "";
    const customerPhoneCode = workOrder?.customer?.customerCodePhoneNumber?.trim() || "";
    const businessName = useMemo(
        () => getReceiptBranding(business).displayName,
        [business],
    );

    const openReadyWhatsApp = (order = workOrder) => {
        if (!order) return false;
        const customerName = [order.customer?.customerFirstName, order.customer?.customerLastName]
            .filter(Boolean)
            .join(" ");
        const message = buildWorkOrderReadyWhatsAppMessage({
            customerName,
            businessName,
            workOrderNumber: order.workOrderNumber,
            saleNumber: order.sale?.saleNumber,
            productName: order.saleDetail?.product?.productName,
        });
        const shareUrl = buildWorkOrderReadyWhatsAppShareUrl({
            customerCodePhoneNumber: order.customer?.customerCodePhoneNumber,
            customerPhoneNumber: order.customer?.customerPhoneNumber,
            message,
        });
        if (!shareUrl) {
            toast.info("Sin teléfono", "El paciente no tiene número de WhatsApp registrado.");
            return false;
        }
        window.open(shareUrl, "_blank", "noopener,noreferrer");
        toast.success("WhatsApp", "Se abrió el chat con el aviso de listo para retiro.");
        return true;
    };

    const fetchWorkOrder = async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const { data } = await getWorkOrderById(id);
            setWorkOrder(data);
            setEditForm({
                laboratoryId: data.laboratoryId || "",
                prescriptionId: data.prescriptionId || "",
                workOrderNotes: data.workOrderNotes || "",
            });
        } catch (error) {
            console.log(error);
            setWorkOrder(null);
            setLoadError(error.response?.data?.message || "No se pudo cargar la orden de trabajo.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!workOrder?.customerId) return;
        getLaboratories({ activeOnly: true })
            .then(({ data }) => setLaboratories(Array.isArray(data) ? data : []))
            .catch(() => setLaboratories([]));
        getPrescriptionsByCustomerId(workOrder.customerId)
            .then(({ data }) => setPrescriptions(Array.isArray(data) ? data : []))
            .catch(() => setPrescriptions([]));
    }, [workOrder?.customerId]);

    const formatCustomerName = (customer) =>
        [customer?.customerFirstName, customer?.customerLastName].filter(Boolean).join(" ") || "—";

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const { data } = await updateWorkOrder(id, {
                laboratoryId: editForm.laboratoryId || null,
                prescriptionId: editForm.prescriptionId || null,
                workOrderNotes: editForm.workOrderNotes,
            });
            setWorkOrder(data);
            toast.success("Guardado", "La orden de trabajo se actualizó correctamente.");
        } catch (error) {
            toast.error(
                "No se pudo guardar",
                error.response?.data?.message ?? "Ocurrió un error al actualizar la OT.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdvanceStatus = async (nextStatus) => {
        const isConfirmed = await confirm({
            title: "Cambiar estado de la OT",
            message: `¿Confirmas avanzar la orden de trabajo a "${WORK_ORDER_STATUS_LABELS[nextStatus] ?? nextStatus}"?`,
            variant: "success",
            confirmText: "Confirmar",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setIsAdvancing(true);
        try {
            const { data } = await updateWorkOrderStatus(id, nextStatus);
            setWorkOrder(data);
            toast.success("Estado actualizado", "La orden de trabajo cambió de estado.");
            if (nextStatus === "READY_FOR_DELIVERY" && notifyWhatsApp) {
                openReadyWhatsApp(data);
            }
        } catch (error) {
            toast.error(
                "No se pudo actualizar",
                error.response?.data?.message ?? "Ocurrió un error al cambiar el estado.",
            );
        } finally {
            setIsAdvancing(false);
        }
    };

    const handleReceive = async () => {
        const isConfirmed = await confirm({
            title: "Recibir orden de trabajo",
            message: "Se marcará la OT como recibida desde el laboratorio.",
            variant: "success",
            confirmText: "Recibir",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setIsAdvancing(true);
        try {
            const { data } = await receiveWorkOrder(id);
            setWorkOrder(data);
            toast.success("OT recibida", "La orden de trabajo fue marcada como recibida.");
        } catch (error) {
            toast.error(
                "No se pudo recibir",
                error.response?.data?.message ?? "Ocurrió un error al recibir la OT.",
            );
        } finally {
            setIsAdvancing(false);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: "Eliminar orden de trabajo",
            message: `¿Estás seguro de que deseas eliminar la OT ${workOrder?.workOrderNumber ?? ""}? Esta acción no se puede deshacer.`,
            variant: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        try {
            await deleteWorkOrderById(id);
            toast.success("Eliminada", "La orden de trabajo fue eliminada.");
            window.history.back();
        } catch (error) {
            toast.error(
                "No se pudo eliminar",
                error.response?.data?.message ?? "Ocurrió un error al eliminar la OT.",
            );
        }
    };

    const backLink = (
        <Link
            to="/work-orders"
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
        >
            <FaArrowLeft /> Volver
        </Link>
    );

    if (isLoading || !workOrder) {
        return (
            <ExpensePageLayout
                title="Orden de Trabajo"
                subtitle={isLoading ? "El detalle aparece en cuanto responde el servidor" : "No se pudo mostrar la orden"}
                actions={backLink}
            >
                {isLoading ? (
                    <div className="space-y-4">
                        <DetailFieldsSkeleton label="Cargando orden de trabajo" />
                        <TableRowsSkeleton label="Cargando detalle de la orden" />
                    </div>
                ) : (
                    <DataErrorPanel
                        message={loadError || "No se encontró la orden de trabajo."}
                        onRetry={fetchWorkOrder}
                    />
                )}
            </ExpensePageLayout>
        );
    }

    return (
        <ExpensePageLayout
            title={
                <span className="flex items-center gap-2 flex-wrap">
                    Orden de Trabajo
                    <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {workOrder.workOrderNumber}
                    </span>
                    <WorkOrderStatusBadge status={workOrder.workOrderStatus} />
                </span>
            }
            subtitle={`Cliente: ${formatCustomerName(workOrder.customer)}`}
            actions={
                <Link
                    to="/work-orders"
                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                >
                    <FaArrowLeft /> Volver
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Info general */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-bold text-emerald-600 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <FaClipboardList /> Información General
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Venta</span>
                            {workOrder.sale ? (
                                <Link to={`/sales/view/${workOrder.sale.saleId}`} className="text-base font-bold text-primary hover:underline">
                                    #{workOrder.sale.saleNumber}
                                </Link>
                            ) : (
                                <span className="text-base font-bold text-gray-400">—</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</span>
                            <span className="text-base font-bold text-gray-900">{formatCustomerName(workOrder.customer)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Producto</span>
                            <span className="text-base font-bold text-gray-900">
                                {workOrder.saleDetail?.product?.productName || "—"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cantidad</span>
                            <span className="text-base font-bold text-gray-900">{workOrder.quantity}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Laboratorio</span>
                            <span className="text-base font-bold text-gray-900">
                                {workOrder.laboratory?.laboratoryName || "Sin asignar"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Receta</span>
                            <span className="text-base font-bold text-gray-900">
                                {workOrder.prescription
                                    ? `${workOrder.prescription.prescriptionType || "Receta"} · ${workOrder.prescription.prescriptionDate ? new Date(workOrder.prescription.prescriptionDate).toLocaleDateString("es-CL") : ""}`
                                    : "Sin receta asociada"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Creada</span>
                            <span className="text-base font-bold text-gray-900">
                                {workOrder.createdAt ? new Date(workOrder.createdAt).toLocaleDateString("es-CL") : "—"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado</span>
                            <div className="mt-1"><WorkOrderStatusBadge status={workOrder.workOrderStatus} /></div>
                        </div>
                        <div className="col-span-2 md:col-span-2">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Notas</span>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                                <p className="text-sm text-gray-700 italic">{workOrder.workOrderNotes || "Sin notas."}</p>
                            </div>
                        </div>
                        {workOrder.workOrderLabNotes && (
                            <div className="col-span-2 md:col-span-2">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Notas del laboratorio</span>
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                                    <p className="text-sm text-gray-700 italic">{workOrder.workOrderLabNotes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones de flujo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Acciones</h3>
                    {nextStatuses.includes("READY_FOR_DELIVERY") && (
                        <div className="mb-3">
                            <SendDocumentWhatsAppOption
                                checked={notifyWhatsApp}
                                onChange={setNotifyWhatsApp}
                                customerCodePhoneNumber={customerPhoneCode}
                                customerPhone={customerPhone}
                                disabled={isAdvancing}
                                compact
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Al marcar lista para entrega se abrirá WhatsApp con el aviso de retiro.
                            </p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleAdvanceStatus(status)}
                                disabled={isAdvancing}
                                className={`${PRIMARY_BTN} disabled:opacity-60`}
                            >
                                <FaCheckCircle />
                                {WORK_ORDER_STATUS_LABELS[status] ?? status}
                            </button>
                        ))}
                        {isReadyForDelivery && (
                            <button
                                type="button"
                                onClick={() => openReadyWhatsApp()}
                                disabled={isAdvancing || !customerPhone}
                                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe57] transition-colors shadow-sm text-sm font-medium disabled:opacity-60"
                            >
                                <FaWhatsapp /> Avisar WhatsApp
                            </button>
                        )}
                        {canReceive && (
                            <button
                                type="button"
                                onClick={handleReceive}
                                disabled={isAdvancing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-60"
                            >
                                <FaTruckLoading /> Recibir OT
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-medium"
                            >
                                <FaTrash /> Eliminar OT
                            </button>
                        )}
                        {nextStatuses.length === 0 && !canReceive && !canDelete && !isReadyForDelivery && (
                            <p className="text-sm text-gray-500">No hay acciones disponibles para el estado actual.</p>
                        )}
                    </div>
                </div>

                {/* Edición (solo CREATED / PENDING_SHIPMENT) */}
                {canEdit && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Editar laboratorio, receta y notas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Laboratorio</label>
                                <select
                                    value={editForm.laboratoryId}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, laboratoryId: e.target.value }))}
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receta</label>
                                <select
                                    value={editForm.prescriptionId}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, prescriptionId: e.target.value }))}
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
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notas</label>
                            <textarea
                                value={editForm.workOrderNotes}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, workOrderNotes: e.target.value }))}
                                rows={3}
                                className="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                                placeholder="Notas internas de la OT..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className={`${PRIMARY_BTN} disabled:opacity-60`}
                            >
                                <FaSave /> {isSaving ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ExpensePageLayout>
    );
}
