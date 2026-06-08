import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
    FaArrowLeft,
    FaEdit,
    FaHashtag,
    FaTruck,
    FaBan,
    FaBoxOpen,
    FaUser,
    FaPrint,
    FaExclamationTriangle,
} from "react-icons/fa";
import { getPurchaseById, cancelPurchaseRequest } from "../../api/purchase.js";
import EditPurchaseModal from "../../components/modals/EditPurchaseModal.jsx";
import PurchaseReceiptPDF from "../../components/Printables/PurchaseReceiptPDF.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { formatProviderLabel } from "../../utils/providerContact.js";
import {
    unwrapPurchaseResponse,
    getPurchaseDetails,
} from "../../utils/normalizePurchase.js";
import {
    TABLE_WRAPPER,
    THEAD,
    TH,
    TD,
    TD_MUTED,
    TBODY,
    TR_ROW,
    PRIMARY_BTN,
} from "../../utils/expenseUiPatterns.js";

function StatusBadge({ status }) {
    const map = {
        COMPLETED: { label: "Completada", className: "bg-emerald-100 text-emerald-700" },
        PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
        CANCELLED: { label: "Anulada", className: "bg-red-100 text-red-700" },
    };
    const cfg = map[status] || { label: status, className: "bg-slate-100 text-slate-700" };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

function formatUserName(user) {
    if (!user) return "—";
    return `${user.userFirstName ?? ""} ${user.userLastName ?? ""}`.trim() || "—";
}

export default function ViewPurchasePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();

    const [loading, setLoading] = useState(true);
    const [purchase, setPurchase] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchPurchase = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPurchaseById(id);
            setPurchase(unwrapPurchaseResponse(res));
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo cargar la compra.");
            navigate("/purchase");
        } finally {
            setLoading(false);
        }
    }, [id, navigate, toast]);

    useEffect(() => {
        fetchPurchase();
    }, [fetchPurchase]);

    const handleCancel = async () => {
        const isConfirmed = await confirm({
            title: "¿Anular compra?",
            message:
                "La compra quedará registrada como anulada (no se eliminará). Se revertirá el stock ingresado por esta compra.",
            variant: "danger",
            confirmText: "Anular compra",
            cancelText: "Cancelar",
        });

        if (!isConfirmed) return;

        setCancelling(true);
        try {
            const res = await cancelPurchaseRequest(id);
            setPurchase(unwrapPurchaseResponse(res));
            toast.success("Compra anulada", "El registro se conserva y el inventario fue ajustado.");
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo anular la compra.",
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <ExpensePageLayout title="Detalle de compra" subtitle="Cargando...">
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            </ExpensePageLayout>
        );
    }

    if (!purchase) return null;

    const details = getPurchaseDetails(purchase);
    const canEdit = purchase.purchaseStatus !== "CANCELLED";
    const canCancel = purchase.purchaseStatus === "COMPLETED";
    const isCancelled = purchase.purchaseStatus === "CANCELLED";

    return (
        <ExpensePageLayout
            title={`Compra #${purchase.purchaseNumber ?? "—"}`}
            subtitle={`Documento ${purchase.purchaseRealNumber ?? "—"}`}
            actions={
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/purchase"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <FaArrowLeft /> Volver
                    </Link>

                    <PDFDownloadLink
                        document={<PurchaseReceiptPDF purchase={purchase} />}
                        fileName={`compra-${purchase.purchaseNumber || purchase.purchaseId}.pdf`}
                    >
                        {({ loading: pdfLoading }) => (
                            <button
                                type="button"
                                disabled={pdfLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium disabled:opacity-50"
                            >
                                <FaPrint />
                                {pdfLoading ? "Generando..." : "Imprimir"}
                            </button>
                        )}
                    </PDFDownloadLink>

                    {canEdit && (
                        <button type="button" onClick={() => setEditOpen(true)} className={PRIMARY_BTN}>
                            <FaEdit /> Editar
                        </button>
                    )}

                    {canCancel && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                        >
                            <FaBan /> {cancelling ? "Anulando..." : "Anular"}
                        </button>
                    )}
                </div>
            }
        >
            {isCancelled && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-500" />
                    <div>
                        <p className="font-semibold">Compra anulada — registro conservado</p>
                        <p className="mt-1 text-red-700/90">
                            Anulada por{" "}
                            <span className="font-medium">{formatUserName(purchase.cancelledBy)}</span>
                            {purchase.cancelledAt
                                ? ` el ${formatDate(purchase.cancelledAt)}`
                                : ""}
                            . El stock fue revertido; este comprobante permanece como historial.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-2">
                        <FaTruck className="text-primary" /> Proveedor
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                        {formatProviderLabel(purchase.provider?.providerName) || "—"}
                    </p>
                    <StatusBadge status={purchase.purchaseStatus} />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-2">
                        <FaHashtag className="text-primary" /> Totales
                    </p>
                    <p className="text-2xl font-bold text-primary font-display">
                        {formatCurrency(purchase.purchaseTotal)}
                    </p>
                    <p className="text-sm text-gray-500">
                        {details.length} ítem{details.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        Registrada por:{" "}
                        <span className="font-medium text-gray-800">
                            {formatUserName(purchase.user)}
                        </span>
                    </p>
                    <p>Fecha: {purchase.purchaseDate || formatDate(purchase.createdAt)}</p>
                    {purchase.purchaseComment && (
                        <p className="pt-2 border-t border-gray-100 text-gray-500 italic">
                            {purchase.purchaseComment}
                        </p>
                    )}
                </div>
            </div>

            <div className={TABLE_WRAPPER}>
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FaBoxOpen className="text-primary" /> Detalle de productos
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className={THEAD}>
                            <tr>
                                <th className={TH}>Producto</th>
                                <th className={TH}>SKU</th>
                                <th className={TH}>Cantidad</th>
                                <th className={TH}>Costo unit.</th>
                                <th className={TH}>Total</th>
                            </tr>
                        </thead>
                        <tbody className={TBODY}>
                            {details.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Sin detalle de productos.
                                    </td>
                                </tr>
                            ) : (
                                details.map((detail) => (
                                    <tr key={detail.purchaseDetailId} className={TR_ROW}>
                                        <td className={TD}>
                                            {detail.product?.productName ||
                                                detail.service?.serviceName ||
                                                "—"}
                                        </td>
                                        <td className={TD_MUTED}>
                                            {detail.product?.productSKU ||
                                                detail.service?.serviceSKU ||
                                                "—"}
                                        </td>
                                        <td className={TD_MUTED}>{detail.purchaseDetailQuantity}</td>
                                        <td className={TD_MUTED}>
                                            {formatCurrency(detail.purchaseDetailPrice)}
                                        </td>
                                        <td className={TD_MUTED}>
                                            {formatCurrency(detail.purchaseDetailTotal)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditPurchaseModal
                purchase={purchase}
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onUpdated={fetchPurchase}
            />
        </ExpensePageLayout>
    );
}
