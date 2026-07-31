import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFileMedical, FaPlus, FaPrint, FaEdit } from "react-icons/fa";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
    getPurchaseCertificatesBySaleId,
    createPurchaseCertificate,
} from "../../api/purchaseCertificates.js";
import { useToast } from "../../context/ToastContext.jsx";
import useReceiptBusiness from "../../hooks/useReceiptBusiness.js";
import EditPurchaseCertificateModal from "../modals/EditPurchaseCertificateModal.jsx";
import PurchaseCertificatePDF from "../Printables/PurchaseCertificatePDF.jsx";
import {
    PURCHASE_CERTIFICATE_STATUS_LABELS,
} from "../../utils/purchaseCertificate.js";
import formatDate from "../../utils/formatDate.js";
import formatName from "../../utils/formatName.js";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";

const STATUS_STYLES = {
    DRAFT: "bg-amber-100 text-amber-800 border-amber-200",
    ISSUED: "bg-teal-100 text-teal-800 border-teal-200",
    VOID: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function SalePurchaseCertificatesSection({ saleId, onChanged }) {
    const toast = useToast();
    const receiptBusiness = useReceiptBusiness();
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchCertificates = async () => {
        if (!saleId) return;
        setIsLoading(true);
        try {
            const { data } = await getPurchaseCertificatesBySaleId(saleId);
            setCertificates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setCertificates([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saleId]);

    const handleCreate = async () => {
        if (!saleId || isCreating) return;
        setIsCreating(true);
        try {
            const { data } = await createPurchaseCertificate({ saleId });
            toast.success(
                "Certificado creado",
                "Se precargó la información de la venta. Revisa y emite el documento.",
            );
            setEditing(data.certificate);
            await fetchCertificates();
            onChanged?.();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo crear el certificado.",
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <h5 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                        <FaFileMedical className="text-teal-600" /> Certificados de Compra
                    </h5>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={isCreating}
                        className={PRIMARY_BTN}
                    >
                        <FaPlus /> {isCreating ? "Creando..." : "Nuevo certificado"}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-2 font-semibold">N°</th>
                                <th className="px-4 py-2 font-semibold">Fecha</th>
                                <th className="px-4 py-2 font-semibold">Estado</th>
                                <th className="px-4 py-2 font-semibold">Total</th>
                                <th className="px-4 py-2 font-semibold">Emitido por</th>
                                <th className="px-4 py-2 font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-xs text-gray-400 italic">
                                        Cargando certificados...
                                    </td>
                                </tr>
                            ) : certificates.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-xs text-gray-400">
                                        No hay certificados para esta venta. Genera uno para reembolsos ISAPRE / seguros.
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((cert) => (
                                    <tr key={cert.purchaseCertificateId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            <Link
                                                to={`/purchase-certificates/${cert.purchaseCertificateId}`}
                                                className="text-teal-700 hover:underline"
                                            >
                                                {cert.certificateNumber}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(cert.certificateIssuedDate || cert.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                    STATUS_STYLES[cert.certificateStatus] || STATUS_STYLES.DRAFT
                                                }`}
                                            >
                                                {PURCHASE_CERTIFICATE_STATUS_LABELS[cert.certificateStatus]
                                                    || cert.certificateStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-emerald-700 font-medium">
                                            ${Number(cert.certificateTotal || 0).toLocaleString("es-CL")}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {cert.issuedBy
                                                ? [cert.issuedBy.userFirstName, cert.issuedBy.userLastName]
                                                    .map(formatName)
                                                    .filter(Boolean)
                                                    .join(" ")
                                                : cert.createdBy
                                                    ? [cert.createdBy.userFirstName, cert.createdBy.userLastName]
                                                        .map(formatName)
                                                        .filter(Boolean)
                                                        .join(" ")
                                                    : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(cert)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                                                    title={cert.certificateStatus === "DRAFT" ? "Editar" : "Ver / reimprimir"}
                                                >
                                                    <FaEdit className="text-xs" />
                                                </button>
                                                {(cert.certificateStatus === "ISSUED" || cert.certificateStatus === "DRAFT") && (
                                                    <PDFDownloadLink
                                                        document={
                                                            <PurchaseCertificatePDF
                                                                certificate={cert}
                                                                business={receiptBusiness}
                                                            />
                                                        }
                                                        fileName={`certificado-compra-${cert.certificateNumber}.pdf`}
                                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded inline-flex"
                                                        title="Descargar PDF"
                                                    >
                                                        {({ loading }) =>
                                                            loading ? (
                                                                <span className="text-[10px]">...</span>
                                                            ) : (
                                                                <FaPrint className="text-xs" />
                                                            )
                                                        }
                                                    </PDFDownloadLink>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditPurchaseCertificateModal
                isOpen={Boolean(editing)}
                certificate={editing}
                onClose={() => setEditing(null)}
                onSaved={(updated) => {
                    setEditing(updated);
                    fetchCertificates();
                    onChanged?.();
                }}
            />
        </>
    );
}
