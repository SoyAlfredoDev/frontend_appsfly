import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FaPrint } from "react-icons/fa";
import { getPurchaseById } from "../../api/purchase.js";
import PurchaseReceiptPDF from "../Printables/PurchaseReceiptPDF.jsx";
import { unwrapPurchaseResponse } from "../../utils/normalizePurchase.js";
import { useToast } from "../../context/ToastContext.jsx";

/**
 * Descarga el comprobante PDF de una compra (carga detalle completo al hacer clic).
 */
export default function PurchasePrintButton({
    purchaseId,
    purchaseNumber,
    buttonClassName,
    iconOnly = false,
}) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        setLoading(true);
        try {
            const res = await getPurchaseById(purchaseId);
            const purchase = unwrapPurchaseResponse(res);
            const blob = await pdf(<PurchaseReceiptPDF purchase={purchase} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `compra-${purchaseNumber || purchaseId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo generar el comprobante.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            className={buttonClassName}
            title="Imprimir comprobante"
            disabled={loading}
            onClick={handlePrint}
        >
            <FaPrint />
            {!iconOnly && (
                <span className="hidden md:inline">
                    {loading ? "Generando..." : "Imprimir"}
                </span>
            )}
        </button>
    );
}
