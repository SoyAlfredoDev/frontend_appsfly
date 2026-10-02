import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaTruck, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { getLabDispatchById, receiveLabDispatch } from "../../api/labDispatches.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import DataErrorPanel from "../../components/ui/DataErrorPanel.tsx";
import { DetailFieldsSkeleton, TableRowsSkeleton } from "../../components/ui/DataSkeleton.tsx";
import LabDispatchStatusBadge from "../../components/optics/LabDispatchStatusBadge.jsx";
import WorkOrderStatusBadge from "../../components/optics/WorkOrderStatusBadge.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function LabDispatchViewPage() {
    const { id } = useParams();
    const toast = useToast();
    const confirm = useConfirm();

    const [dispatch, setDispatch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [isReceiving, setIsReceiving] = useState(false);

    const workOrders = dispatch?.WorkOrder || [];
    const pendingOrders = useMemo(
        () => workOrders.filter((wo) => wo.workOrderStatus === "SENT_TO_LAB"),
        [workOrders],
    );

    const fetchDispatch = async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const { data } = await getLabDispatchById(id);
            setDispatch(data);
            setSelectedIds([]);
        } catch (error) {
            console.log(error);
            setDispatch(null);
            setLoadError(error.response?.data?.message || "No se pudo cargar el despacho.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDispatch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const formatCustomerName = (customer) =>
        [customer?.customerFirstName, customer?.customerLastName].filter(Boolean).join(" ") || "—";

    const toggleSelected = (workOrderId) => {
        setSelectedIds((prev) =>
            prev.includes(workOrderId) ? prev.filter((wid) => wid !== workOrderId) : [...prev, workOrderId],
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pendingOrders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingOrders.map((wo) => wo.workOrderId));
        }
    };

    const handleReceive = async (workOrderIds) => {
        const isConfirmed = await confirm({
            title: "Recibir órdenes de trabajo",
            message: `Se marcarán ${workOrderIds.length} orden(es) de trabajo como recibidas.`,
            variant: "success",
            confirmText: "Recibir",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setIsReceiving(true);
        try {
            await receiveLabDispatch(id, { workOrderIds });
            toast.success("Recepción registrada", "Las órdenes de trabajo fueron marcadas como recibidas.");
            fetchDispatch();
        } catch (error) {
            toast.error(
                "No se pudo registrar",
                error.response?.data?.message ?? "Ocurrió un error al recibir las órdenes.",
            );
        } finally {
            setIsReceiving(false);
        }
    };

    const backLink = (
        <Link
            to="/lab-dispatches"
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
        >
            <FaArrowLeft /> Volver
        </Link>
    );

    if (isLoading || !dispatch) {
        return (
            <ExpensePageLayout
                title="Despacho a Laboratorio"
                subtitle={isLoading ? "El detalle aparece en cuanto responde el servidor" : "No se pudo mostrar el despacho"}
                actions={backLink}
            >
                {isLoading ? (
                    <div className="space-y-4">
                        <DetailFieldsSkeleton label="Cargando despacho" />
                        <TableRowsSkeleton label="Cargando órdenes del despacho" />
                    </div>
                ) : (
                    <DataErrorPanel
                        message={loadError || "No se encontró el despacho."}
                        onRetry={fetchDispatch}
                    />
                )}
            </ExpensePageLayout>
        );
    }

    return (
        <ExpensePageLayout
            title={
                <span className="flex items-center gap-2 flex-wrap">
                    Despacho a Laboratorio
                    <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {dispatch.labDispatchNumber}
                    </span>
                    <LabDispatchStatusBadge status={dispatch.labDispatchStatus} />
                </span>
            }
            subtitle={`Laboratorio: ${dispatch.laboratory?.laboratoryName || "—"}`}
            actions={
                <Link
                    to="/lab-dispatches"
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
                        <FaTruck /> Información General
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Laboratorio</span>
                            <span className="text-base font-bold text-gray-900">{dispatch.laboratory?.laboratoryName || "—"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Enviado</span>
                            <span className="text-base font-bold text-gray-900">
                                {dispatch.sentAt ? new Date(dispatch.sentAt).toLocaleString("es-CL") : "—"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Enviado por</span>
                            <span className="text-base font-bold text-gray-900">
                                {[dispatch.sentBy?.userFirstName, dispatch.sentBy?.userLastName].filter(Boolean).join(" ") || "—"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado</span>
                            <div className="mt-1"><LabDispatchStatusBadge status={dispatch.labDispatchStatus} /></div>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Notas</span>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                                <p className="text-sm text-gray-700 italic">{dispatch.labDispatchNotes || "Sin notas."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recepción */}
                {dispatch.labDispatchStatus !== "CANCELLED" && pendingOrders.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <p className="text-sm text-gray-600">
                            {pendingOrders.length} orden(es) de trabajo aún pendientes de recepción.
                        </p>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleReceive(selectedIds)}
                                    disabled={isReceiving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-60"
                                >
                                    <FaCheckCircle /> Recibir seleccionadas ({selectedIds.length})
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleReceive(pendingOrders.map((wo) => wo.workOrderId))}
                                disabled={isReceiving}
                                className={`${PRIMARY_BTN} disabled:opacity-60`}
                            >
                                <FaCheckCircle /> Recibir todas
                            </button>
                        </div>
                    </div>
                )}

                {/* Listado de OT */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <h5 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                            <FaClipboardList /> Órdenes de Trabajo ({workOrders.length})
                        </h5>
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-2 font-semibold w-10"></th>
                                    <th className="px-4 py-2 font-semibold">N° OT</th>
                                    <th className="px-4 py-2 font-semibold">Venta</th>
                                    <th className="px-4 py-2 font-semibold">Cliente</th>
                                    <th className="px-4 py-2 font-semibold">Producto</th>
                                    <th className="px-4 py-2 font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {workOrders.map((wo) => (
                                    <tr key={wo.workOrderId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            {wo.workOrderStatus === "SENT_TO_LAB" && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(wo.workOrderId)}
                                                    onChange={() => toggleSelected(wo.workOrderId)}
                                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                                            <Link to={`/work-orders/${wo.workOrderId}`} className="text-primary hover:underline">
                                                {wo.workOrderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {wo.sale ? (
                                                <Link to={`/sales/view/${wo.sale.saleId}`} className="text-primary hover:underline">
                                                    #{wo.sale.saleNumber}
                                                </Link>
                                            ) : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {formatCustomerName(wo.customer)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {wo.saleDetail?.product?.productName || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <WorkOrderStatusBadge status={wo.workOrderStatus} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ExpensePageLayout>
    );
}
