import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaPlus, FaTrash, FaSave, FaCheck } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useToast } from "../../context/ToastContext.jsx";
import useReceiptBusiness from "../../hooks/useReceiptBusiness.js";
import {
    updatePurchaseCertificate,
    issuePurchaseCertificate,
} from "../../api/purchaseCertificates.js";
import PurchaseCertificatePDF from "../Printables/PurchaseCertificatePDF.jsx";
import { DEFAULT_CERTIFICATE_COMMENT } from "../../utils/purchaseCertificate.js";
import { toDateInputValue } from "../../utils/businessModality.js";

const CANCEL_BTN =
    "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";
const SAVE_BTN =
    "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2";
const ISSUE_BTN =
    "px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2";

function emptyLine() {
    return {
        purchaseCertificateDetailId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceSaleDetailId: null,
        lineType: "PRODUCT",
        lineSku: "",
        lineDescription: "",
        lineQuantity: 1,
        lineUnitPrice: 0,
        lineTotal: 0,
        sortOrder: 0,
        lineIncluded: true,
    };
}

export default function EditPurchaseCertificateModal({
    isOpen,
    onClose,
    certificate,
    onSaved,
}) {
    const toast = useToast();
    const receiptBusiness = useReceiptBusiness();
    const [isSaving, setIsSaving] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const [form, setForm] = useState({
        certificateIssuedDate: "",
        certificateComment: DEFAULT_CERTIFICATE_COMMENT,
        certificateResponsibleName: "",
        customerNameSnapshot: "",
        customerDocumentSnapshot: "",
        details: [],
    });

    const isDraft = certificate?.certificateStatus === "DRAFT";
    const isIssued = certificate?.certificateStatus === "ISSUED";

    useEffect(() => {
        if (!isOpen || !certificate) return;
        setForm({
            certificateIssuedDate: toDateInputValue(certificate.certificateIssuedDate),
            certificateComment: certificate.certificateComment || DEFAULT_CERTIFICATE_COMMENT,
            certificateResponsibleName: certificate.certificateResponsibleName || "",
            customerNameSnapshot: certificate.customerNameSnapshot || "",
            customerDocumentSnapshot: certificate.customerDocumentSnapshot || "",
            details: (certificate.details || []).map((d, i) => ({
                ...d,
                sortOrder: d.sortOrder ?? i,
            })),
        });
    }, [isOpen, certificate]);

    const previewCertificate = useMemo(
        () => ({
            ...certificate,
            ...form,
            certificateTotal: form.details
                .filter((d) => d.lineIncluded !== false)
                .reduce((s, d) => s + (Number(d.lineTotal) || 0), 0),
            details: form.details,
        }),
        [certificate, form],
    );

    const updateLine = (index, patch) => {
        setForm((prev) => {
            const details = prev.details.map((line, i) => {
                if (i !== index) return line;
                const next = { ...line, ...patch };
                if (patch.lineQuantity !== undefined || patch.lineUnitPrice !== undefined) {
                    const qty = Math.max(1, Number(next.lineQuantity) || 1);
                    const price = Math.max(0, Number(next.lineUnitPrice) || 0);
                    next.lineQuantity = qty;
                    next.lineUnitPrice = price;
                    next.lineTotal = qty * price;
                }
                return next;
            });
            return { ...prev, details };
        });
    };

    const addLine = () => {
        setForm((prev) => ({
            ...prev,
            details: [...prev.details, { ...emptyLine(), sortOrder: prev.details.length }],
        }));
    };

    const removeLine = (index) => {
        setForm((prev) => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        if (!isDraft || !certificate) return;
        setIsSaving(true);
        try {
            const { data } = await updatePurchaseCertificate(certificate.purchaseCertificateId, {
                certificateIssuedDate: form.certificateIssuedDate || null,
                certificateComment: form.certificateComment,
                certificateResponsibleName: form.certificateResponsibleName,
                customerNameSnapshot: form.customerNameSnapshot,
                customerDocumentSnapshot: form.customerDocumentSnapshot,
                details: form.details,
            });
            toast.success("Guardado", "El certificado se actualizó correctamente.");
            onSaved?.(data);
        } catch (error) {
            toast.error("Error", error.response?.data?.message || "No se pudo guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleIssue = async () => {
        if (!isDraft || !certificate) return;
        const included = form.details.filter((d) => d.lineIncluded !== false);
        if (included.length === 0) {
            toast.info("Sin ítems", "Incluye al menos un producto en el certificado.");
            return;
        }
        setIsIssuing(true);
        try {
            await updatePurchaseCertificate(certificate.purchaseCertificateId, {
                certificateIssuedDate: form.certificateIssuedDate || null,
                certificateComment: form.certificateComment,
                certificateResponsibleName: form.certificateResponsibleName,
                customerNameSnapshot: form.customerNameSnapshot,
                customerDocumentSnapshot: form.customerDocumentSnapshot,
                details: form.details,
            });
            const { data } = await issuePurchaseCertificate(certificate.purchaseCertificateId);
            toast.success("Emitido", "El certificado quedó emitido y listo para imprimir.");
            onSaved?.(data.certificate);
        } catch (error) {
            toast.error("Error", error.response?.data?.message || "No se pudo emitir.");
        } finally {
            setIsIssuing(false);
        }
    };

    if (!isOpen || !certificate) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <Motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Certificado {certificate.certificateNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {isDraft
                                    ? "Edita los datos y emite cuando esté listo. La venta original no se modifica."
                                    : isIssued
                                        ? "Certificado emitido — puedes reimprimir el PDF."
                                        : "Certificado anulado."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Fecha de emisión
                                </label>
                                <input
                                    type="date"
                                    disabled={!isDraft}
                                    value={form.certificateIssuedDate}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, certificateIssuedDate: e.target.value }))
                                    }
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 disabled:bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Responsable (firma)
                                </label>
                                <input
                                    type="text"
                                    disabled={!isDraft}
                                    value={form.certificateResponsibleName}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            certificateResponsibleName: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 disabled:bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Nombre del cliente
                                </label>
                                <input
                                    type="text"
                                    disabled={!isDraft}
                                    value={form.customerNameSnapshot}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, customerNameSnapshot: e.target.value }))
                                    }
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 disabled:bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    RUT / Documento
                                </label>
                                <input
                                    type="text"
                                    disabled={!isDraft}
                                    value={form.customerDocumentSnapshot}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            customerDocumentSnapshot: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 text-sm rounded-md border border-slate-300 disabled:bg-slate-50"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Productos del certificado
                                </label>
                                {isDraft && (
                                    <button
                                        type="button"
                                        onClick={addLine}
                                        className="text-xs text-teal-700 font-medium inline-flex items-center gap-1 hover:underline"
                                    >
                                        <FaPlus /> Agregar línea
                                    </button>
                                )}
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            {isDraft && <th className="px-2 py-2">Incl.</th>}
                                            <th className="px-2 py-2 text-left">Descripción</th>
                                            <th className="px-2 py-2 w-16">Cant.</th>
                                            <th className="px-2 py-2 w-24">Valor</th>
                                            <th className="px-2 py-2 w-24">Total</th>
                                            {isDraft && <th className="px-2 py-2 w-10" />}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {form.details.map((line, index) => (
                                            <tr key={line.purchaseCertificateDetailId}>
                                                {isDraft && (
                                                    <td className="px-2 py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={line.lineIncluded !== false}
                                                            onChange={(e) =>
                                                                updateLine(index, {
                                                                    lineIncluded: e.target.checked,
                                                                })
                                                            }
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="text"
                                                        disabled={!isDraft}
                                                        value={line.lineDescription}
                                                        onChange={(e) =>
                                                            updateLine(index, {
                                                                lineDescription: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm disabled:bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        disabled={!isDraft}
                                                        value={line.lineQuantity}
                                                        onChange={(e) =>
                                                            updateLine(index, {
                                                                lineQuantity: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center disabled:bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        disabled={!isDraft}
                                                        value={line.lineUnitPrice}
                                                        onChange={(e) =>
                                                            updateLine(index, {
                                                                lineUnitPrice: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right disabled:bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-right font-medium text-gray-800">
                                                    {Number(line.lineTotal || 0).toLocaleString("es-CL")}
                                                </td>
                                                {isDraft && (
                                                    <td className="px-2 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(index)}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                Observaciones / comentarios
                            </label>
                            <textarea
                                disabled={!isDraft}
                                rows={3}
                                value={form.certificateComment}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, certificateComment: e.target.value }))
                                }
                                className="block w-full px-3 py-2 text-sm rounded-lg border border-gray-200 resize-none disabled:bg-slate-50"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={onClose} className={CANCEL_BTN}>
                            Cerrar
                        </button>
                        {(isDraft || isIssued) && (
                            <PDFDownloadLink
                                document={
                                    <PurchaseCertificatePDF
                                        certificate={previewCertificate}
                                        business={receiptBusiness}
                                    />
                                }
                                fileName={`certificado-compra-${certificate.certificateNumber || "borrador"}.pdf`}
                                className={CANCEL_BTN}
                            >
                                {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
                            </PDFDownloadLink>
                        )}
                        {isDraft && (
                            <>
                                <button
                                    type="button"
                                    disabled={isSaving || isIssuing}
                                    onClick={handleSave}
                                    className={SAVE_BTN}
                                >
                                    <FaSave className="text-xs" />
                                    {isSaving ? "Guardando..." : "Guardar borrador"}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving || isIssuing}
                                    onClick={handleIssue}
                                    className={ISSUE_BTN}
                                >
                                    <FaCheck className="text-xs" />
                                    {isIssuing ? "Emitiendo..." : "Emitir certificado"}
                                </button>
                            </>
                        )}
                    </div>
                </Motion.div>
            </div>
        </AnimatePresence>,
        document.body,
    );
}
