import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { getWorkOrdersBySaleId } from "../../api/workOrders.js";
import GenerateWorkOrdersModal from "../modals/GenerateWorkOrdersModal.jsx";
import WorkOrderStatusBadge from "../optics/WorkOrderStatusBadge.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function SaleWorkOrdersSection({ saleId, customerId, saleDetails = [], onChanged }) {
    const [workOrders, setWorkOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    const hasProductLines = (saleDetails || []).some((line) => line.saleDetailType === "PRODUCT");

    const fetchWorkOrders = async () => {
        setIsLoading(true);
        try {
            const { data } = await getWorkOrdersBySaleId(saleId);
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (saleId) fetchWorkOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saleId]);

    const pendingOrders = workOrders.filter((wo) => wo.workOrderStatus !== "DELIVERED");

    if (!hasProductLines && workOrders.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <h5 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                    <FaClipboardList /> Órdenes de Trabajo (Óptica)
                </h5>
                {hasProductLines && (
                    <button
                        type="button"
                        onClick={() => setIsGenerateOpen(true)}
                        className={PRIMARY_BTN}
                    >
                        <FaPlus /> Generar OT
                    </button>
                )}
            </div>

            {pendingOrders.length > 0 && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-amber-800 text-sm">
                    <FaExclamationTriangle className="shrink-0" />
                    <span>
                        Esta venta tiene {pendingOrders.length} orden(es) de trabajo sin entregar al cliente.
                        La venta no podrá marcarse como entregada hasta que todas las OT estén en estado "Entregada".
                    </span>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-semibold">N° OT</th>
                            <th className="px-4 py-2 font-semibold">Producto</th>
                            <th className="px-4 py-2 font-semibold">Laboratorio</th>
                            <th className="px-4 py-2 font-semibold">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-xs text-gray-500 italic">
                                    Cargando órdenes de trabajo...
                                </td>
                            </tr>
                        ) : workOrders.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-xs text-gray-500 italic">
                                    No hay órdenes de trabajo generadas para esta venta.
                                </td>
                            </tr>
                        ) : (
                            workOrders.map((wo) => (
                                <tr key={wo.workOrderId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                                        <Link to={`/work-orders/${wo.workOrderId}`} className="text-primary hover:underline">
                                            {wo.workOrderNumber}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                        {wo.saleDetail?.product?.productName || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {wo.laboratory?.laboratoryName || "Sin asignar"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <WorkOrderStatusBadge status={wo.workOrderStatus} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <GenerateWorkOrdersModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                saleId={saleId}
                saleDetails={saleDetails}
                customerId={customerId}
                onGenerated={() => {
                    setIsGenerateOpen(false);
                    fetchWorkOrders();
                    onChanged?.();
                }}
            />
        </div>
    );
}
