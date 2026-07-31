import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { getPurchaseCertificateById } from "../../api/purchaseCertificates.js";
import { useToast } from "../../context/ToastContext.jsx";
import useReceiptBusiness from "../../hooks/useReceiptBusiness.js";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import EditPurchaseCertificateModal from "../../components/modals/EditPurchaseCertificateModal.jsx";
import PurchaseCertificatePDF from "../../components/Printables/PurchaseCertificatePDF.jsx";
import {
    PURCHASE_CERTIFICATE_STATUS_LABELS,
    formatCertificateMoney,
} from "../../utils/purchaseCertificate.js";
import formatDate from "../../utils/formatDate.js";
import formatName from "../../utils/formatName.js";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

export default function PurchaseCertificateViewPage() {
    const { id } = useParams();
    const toast = useToast();
    const receiptBusiness = useReceiptBusiness();
    const [certificate, setCertificate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const { data } = await getPurchaseCertificateById(id);
            setCertificate(data);
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo cargar el certificado.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const lines = (certificate?.details || []).filter((d) => d.lineIncluded !== false);

    return (
        <ExpensePageLayout
            title={certificate?.certificateNumber || "Certificado de Compra"}
            subtitle="Documento independiente vinculado a la venta (no modifica la boleta)"
            actions={
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/purchase-certificates"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        <FaArrowLeft /> Volver
                    </Link>
                    {certificate?.saleId && (
                        <Link
                            to={`/sales/view/${certificate.saleId}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Ver venta
                        </Link>
                    )}
                    {certificate && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className={PRIMARY_BTN}
                            >
                                {certificate.certificateStatus === "DRAFT" ? "Editar / Emitir" : "Ver / Reimprimir"}
                            </button>
                            {(certificate.certificateStatus === "ISSUED" ||
                                certificate.certificateStatus === "DRAFT") && (
                                <PDFDownloadLink
                                    document={
                                        <PurchaseCertificatePDF
                                            certificate={certificate}
                                            business={receiptBusiness}
                                        />
                                    }
                                    fileName={`certificado-compra-${certificate.certificateNumber}.pdf`}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800"
                                >
                                    {({ loading }) =>
                                        loading ? "Generando..." : (<><FaPrint /> PDF</>)
                                    }
                                </PDFDownloadLink>
                            )}
                        </>
                    )}
                </div>
            }
        >
            {isLoading || !certificate ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                    Cargando...
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Estado</p>
                            <p className="font-medium text-gray-900">
                                {PURCHASE_CERTIFICATE_STATUS_LABELS[certificate.certificateStatus]}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Cliente</p>
                            <p className="font-medium text-gray-900">{certificate.customerNameSnapshot || "—"}</p>
                            <p className="text-gray-500 text-xs">{certificate.customerDocumentSnapshot}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Fecha emisión</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(certificate.certificateIssuedDate || certificate.issuedAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Creado por</p>
                            <p className="text-gray-800">
                                {certificate.createdBy
                                    ? [certificate.createdBy.userFirstName, certificate.createdBy.userLastName]
                                        .map(formatName)
                                        .filter(Boolean)
                                        .join(" ")
                                    : "—"}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(certificate.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Emitido por</p>
                            <p className="text-gray-800">
                                {certificate.issuedBy
                                    ? [certificate.issuedBy.userFirstName, certificate.issuedBy.userLastName]
                                        .map(formatName)
                                        .filter(Boolean)
                                        .join(" ")
                                    : "—"}
                            </p>
                            {certificate.issuedAt && (
                                <p className="text-xs text-gray-400">{formatDate(certificate.issuedAt)}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">Total informado</p>
                            <p className="font-bold text-teal-700 text-lg">
                                {formatCertificateMoney(certificate.certificateTotal)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-sm text-gray-800">
                            Detalle
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-gray-500 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-center">Cant.</th>
                                    <th className="px-4 py-2 text-right">Valor</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lines.map((line) => (
                                    <tr key={line.purchaseCertificateDetailId}>
                                        <td className="px-4 py-2">{line.lineDescription}</td>
                                        <td className="px-4 py-2 text-center">{line.lineQuantity}</td>
                                        <td className="px-4 py-2 text-right">
                                            {formatCertificateMoney(line.lineUnitPrice)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {formatCertificateMoney(line.lineTotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {certificate.certificateComment && (
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Observaciones</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {certificate.certificateComment}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <EditPurchaseCertificateModal
                isOpen={isModalOpen}
                certificate={certificate}
                onClose={() => setIsModalOpen(false)}
                onSaved={(updated) => {
                    setCertificate(updated);
                    setIsModalOpen(false);
                }}
            />
        </ExpensePageLayout>
    );
}
