import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaPrint, FaStore, FaExclamationTriangle } from "react-icons/fa";
import { fetchPublicSaleReceipt } from "../../api/publicSale.js";
import SimpleTestPDFContent from "../../components/Printables/SimpleTestPDF.jsx";
import { mapPublicReceiptForPdf } from "../../utils/saleShare.js";

function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return value.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}

export default function PublicSaleReceiptPage() {
    const { token } = useParams();
    const [receipt, setReceipt] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const res = await fetchPublicSaleReceipt(token);
                if (!cancelled) {
                    setReceipt(res.data.receipt);
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(
                        error.response?.data?.message
                            || "No se pudo cargar el comprobante. El enlace puede haber expirado.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        if (token) {
            load();
        } else {
            setLoadError("Enlace inválido.");
            setIsLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [token]);

    const pdfData = useMemo(() => mapPublicReceiptForPdf(receipt), [receipt]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-montserrat">
                <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" />
                    Cargando comprobante…
                </div>
            </div>
        );
    }

    if (loadError || !receipt) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-montserrat">
                <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <FaExclamationTriangle className="mx-auto text-amber-500 text-3xl mb-4" />
                    <h1 className="text-lg font-bold text-slate-900 mb-2">Comprobante no disponible</h1>
                    <p className="text-sm text-slate-600">{loadError}</p>
                    <Link
                        to="/"
                        className="inline-block mt-6 text-sm font-medium text-emerald-700 hover:underline no-underline"
                    >
                        Ir a AppsFly
                    </Link>
                </div>
            </div>
        );
    }

    const { business } = receipt;

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-montserrat">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
                    {business?.logoUrl ? (
                        <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="h-12 w-12 rounded-lg object-contain border border-slate-100 bg-white"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                            <FaStore />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Comprobante de</p>
                        <h1 className="text-lg font-bold text-slate-900 truncate">{business?.name || "Empresa"}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm text-slate-500">{receipt.documentLabel}</p>
                            <h2 className="text-2xl font-bold text-slate-900">
                                #{receipt.saleNumber ?? "—"}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">Fecha: {receipt.saleDate}</p>
                            <p className="text-sm text-slate-600">Cliente: {receipt.customerName}</p>
                        </div>
                        <PDFDownloadLink
                            document={
                                <SimpleTestPDFContent
                                    sale={pdfData.sale}
                                    tableProductAndService={pdfData.tableProductAndService}
                                    business={pdfData.business}
                                    customerName={pdfData.customerName}
                                />
                            }
                            fileName={`comprobante-${receipt.saleNumber || "venta"}.pdf`}
                        >
                            {({ loading }) => (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-semibold shadow-sm"
                                >
                                    <FaPrint />
                                    {loading ? "Generando…" : "Descargar PDF"}
                                </button>
                            )}
                        </PDFDownloadLink>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Producto / Servicio</th>
                                    <th className="px-3 py-2 text-center">Cant.</th>
                                    <th className="px-3 py-2 text-right">Precio</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(receipt.items ?? []).map((item, index) => (
                                    <tr key={`${item.name}-${index}`} className="border-t border-slate-100">
                                        <td className="px-3 py-2.5">
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            {item.sku ? (
                                                <span className="block text-xs text-slate-400">SKU: {item.sku}</span>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                                        <td className="px-3 py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 space-y-1 text-sm max-w-xs ml-auto">
                        <div className="flex justify-between text-slate-600">
                            <span>Neto</span>
                            <span>{formatCurrency(receipt.netTotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>IVA (19%)</span>
                            <span>{formatCurrency(receipt.ivaTotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
                            <span>Total</span>
                            <span>{formatCurrency(receipt.total)}</span>
                        </div>
                        {receipt.pendingAmount > 0 ? (
                            <div className="flex justify-between text-red-600 font-medium">
                                <span>Saldo pendiente</span>
                                <span>{formatCurrency(receipt.pendingAmount)}</span>
                            </div>
                        ) : null}
                    </div>

                    {(receipt.payments ?? []).length > 0 ? (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Pagos</p>
                            <ul className="space-y-1 text-sm text-slate-700">
                                {receipt.payments.map((payment, index) => (
                                    <li key={`${payment.methodLabel}-${index}`} className="flex justify-between">
                                        <span>{payment.methodLabel}</span>
                                        <span>{formatCurrency(payment.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {receipt.saleComment?.trim() ? (
                        <p className="mt-6 text-sm text-slate-600">
                            <strong>Notas:</strong> {receipt.saleComment.trim()}
                        </p>
                    ) : null}
                </div>

                {(business?.email || business?.phone || business?.address) ? (
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
                        <p className="font-semibold text-slate-800 mb-2">Contacto — {business.name}</p>
                        {business.email ? <p>Correo: {business.email}</p> : null}
                        {business.phone ? <p>Teléfono: {business.phone}</p> : null}
                        {business.address ? <p>{business.address}</p> : null}
                        {business.document ? <p className="text-slate-500">{business.document}</p> : null}
                    </div>
                ) : null}

                <p className="text-center text-xs text-slate-400">
                    Comprobante compartido de forma segura ·{" "}
                    <a href="https://appsfly.app" className="text-emerald-700 hover:underline">
                        AppsFly
                    </a>
                </p>
            </main>
        </div>
    );
}
