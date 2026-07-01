import { getQuotationById, updateQuotationStatus, deleteQuotation, sendQuotationEmail } from '../../api/quotation.js';
import { getQuotationDetailsByQuotationId } from '../../api/quotationDetail.js';
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConfirm } from '../../context/ConfirmationContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useReceiptBusiness from '../../hooks/useReceiptBusiness.js';
import QuotationStatusBadge from '../../components/quotations/QuotationStatusBadge.jsx';
import QuotationReceiptPDFContent from '../../components/Printables/QuotationReceiptPDF.jsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { motion as Motion } from "framer-motion";
import PageContainer from "../../components/layout/PageContainer.jsx";
import formatName from '../../utils/formatName.js';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaClipboardList, 
  FaArrowLeft, 
  FaTrash, 
  FaCheck,
  FaFileAlt,
  FaPrint,
  FaEnvelope,
} from "react-icons/fa";

export default function ViewQuotationPage() {
    const confirm = useConfirm();
    const toast = useToast();
    const navigate = useNavigate();
    const receiptBusiness = useReceiptBusiness();
    const { id } = useParams();
    
    const [quotation, setQuotation] = useState({});
    const [tableDetails, setTableDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingState, setUpdatingState] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const customerEmail = quotation?.customer?.customerEmail?.trim() || "";

    const searchQuotationById = async () => {
        try {
            const quotationData = await getQuotationById(id);
            const detailData = await getQuotationDetailsByQuotationId(id);

            setQuotation(quotationData.data);
            setTableDetails(detailData.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading quotation:", error);
            toast.error("Error", "No se pudo cargar el detalle de la cotización.");
            navigate("/quotations");
        }
    };

    useEffect(() => {
        searchQuotationById();
    }, [id]);

    const handleSendEmail = async () => {
        if (!customerEmail) {
            toast.info("Sin correo", "El cliente no tiene email registrado.");
            return;
        }

        const isConfirmed = await confirm({
            title: "¿Enviar cotización por correo?",
            message: `Se enviará la cotización #${quotation?.quotationNumber} con PDF adjunto a ${customerEmail}.`,
            variant: "success",
            confirmText: "Enviar correo",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setSendingEmail(true);
        try {
            await sendQuotationEmail(id);
            toast.success("Correo enviado", `Cotización enviada a ${customerEmail}.`);
            await searchQuotationById();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message ?? "No se pudo enviar el correo con la cotización.",
            );
        } finally {
            setSendingEmail(false);
        }
    };

    const handleUpdateStatus = async (newStatus, confirmMessage, successMessage) => {
        const isConfirmed = await confirm({
            title: "¿Confirmar cambio de estado?",
            message: confirmMessage,
            variant: "success",
            confirmText: "Confirmar",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setUpdatingState(true);
        try {
            await updateQuotationStatus(id, newStatus);
            toast.success("Estado actualizado", successMessage);
            await searchQuotationById();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message ?? "Ocurrió un error al cambiar el estado de la cotización."
            );
        } finally {
            setUpdatingState(false);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: "¿Eliminar cotización?",
            message: "Esta acción no se puede deshacer y borrará permanentemente la cotización.",
            variant: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        try {
            await deleteQuotation(id);
            toast.success("Eliminado", "La cotización fue eliminada exitosamente.");
            navigate("/quotations");
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message ?? "No se pudo eliminar la cotización."
            );
        }
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const IVA_RATE = 0.19;
    const total = quotation?.quotationTotal ?? 0;
    const netTotal = Math.round(total / (1 + IVA_RATE));
    const ivaTotal = total - netTotal;

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Cargando cotización…
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="min-h-screen bg-gray-50/50 pb-12 font-montserrat">
                <Motion.div 
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 "
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                Detalle de Cotización
                                <span className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    #{quotation?.quotationNumber}
                                </span>
                                <QuotationStatusBadge status={quotation?.quotationStatus} className="text-xs" />
                            </h1>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <Link to="/quotations" className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
                                <FaArrowLeft /> Volver
                            </Link>

                            <PDFDownloadLink
                                document={
                                    <QuotationReceiptPDFContent
                                        quotation={quotation}
                                        details={tableDetails}
                                        business={receiptBusiness}
                                        netTotal={netTotal}
                                        ivaTotal={ivaTotal}
                                        total={total}
                                    />
                                }
                                fileName={`cotizacion-${quotation?.quotationNumber || id}.pdf`}
                            >
                                {({ loading: pdfLoading }) => (
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm text-sm font-medium"
                                    >
                                        <FaPrint />
                                        {pdfLoading ? "Generando..." : "Descargar PDF"}
                                    </button>
                                )}
                            </PDFDownloadLink>

                            {customerEmail && (
                                <button
                                    type="button"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail || updatingState}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold disabled:opacity-60"
                                >
                                    <FaEnvelope />
                                    {sendingEmail ? "Enviando..." : quotation?.quotationStatus === "DRAFT" ? "Enviar por correo" : "Reenviar correo"}
                                </button>
                            )}

                            {quotation?.quotationStatus === "DRAFT" && (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-bold"
                                    >
                                        <FaTrash /> Eliminar
                                    </button>
                                </>
                            )}

                            {(quotation?.quotationStatus === "DRAFT" || quotation?.quotationStatus === "SENT") && (
                                <button
                                    onClick={() => handleUpdateStatus("ACCEPTED", "¿Marcar cotización como aceptada por el cliente?", "La cotización fue marcada como aceptada.")}
                                    disabled={updatingState}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold disabled:opacity-60"
                                >
                                    <FaCheck /> Marcar Aceptada
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Main info card */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Products & services table card */}
                            <Motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                                    <h2 className="text-md font-bold text-gray-900 flex items-center gap-2">
                                        <FaClipboardList className="text-primary" />
                                        Ítems Cotizados
                                    </h2>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                        {tableDetails.length} {tableDetails.length === 1 ? 'ítem' : 'ítems'}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Cant.</th>
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Precio</th>
                                                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {tableDetails.map((item, index) => {
                                                const itemName = item.quotationDetailType === "PRODUCT"
                                                    ? item.product?.productName
                                                    : item.service?.serviceName;
                                                const itemSKU = item.quotationDetailType === "PRODUCT"
                                                    ? item.product?.productSKU
                                                    : item.service?.serviceSKU;

                                                return (
                                                    <tr key={item.quotationDetailId || index} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {item.quotationDetailType === "PRODUCT" ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                                    PROD
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                                                                    SERV
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                                                            {itemSKU || "—"}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                            {itemName || "—"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-semibold">
                                                            {item.quotationDetailQuantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">
                                                            {formatCurrency(item.quotationDetailPrice)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold font-mono">
                                                            {formatCurrency(item.quotationDetailTotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Motion.div>

                            {/* Comment card */}
                            {quotation?.quotationComment && (
                                <Motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-sm font-bold text-gray-800 mb-2">Comentarios y Condiciones</h3>
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-100 italic leading-relaxed">
                                        "{quotation?.quotationComment}"
                                    </p>
                                </Motion.div>
                            )}
                        </div>

                        {/* Sidebar info card */}
                        <div className="space-y-6">
                            
                            {/* Summary Card */}
                            <Motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <FaFileAlt className="text-secondary" />
                                        Resumen
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
                                        <span className="text-gray-500">Neto</span>
                                        <span className="font-semibold text-gray-700 font-mono">{formatCurrency(netTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
                                        <span className="text-gray-500">IVA (19%)</span>
                                        <span className="font-semibold text-gray-700 font-mono">{formatCurrency(ivaTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-1">
                                        <span className="text-md font-bold text-gray-950">Total</span>
                                        <span className="text-xl font-extrabold text-primary font-mono">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </Motion.div>

                            {/* Customer & Creator Meta Info */}
                            <Motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                        <FaUser className="text-xs" /> Cliente
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                            {quotation?.customer?.customerFirstName?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {quotation?.customer?.customerFirstName} {quotation?.customer?.customerLastName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {quotation?.customer?.customerEmail || "Sin correo"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                        <FaCalendarAlt className="text-xs" /> Metadatos
                                    </h3>
                                    <div className="space-y-2 text-xs text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Fecha registro:</span>
                                            <span className="font-semibold text-gray-800">{quotation?.quotationDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Creado por:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formatName(quotation?.user?.userFirstName)} {formatName(quotation?.user?.userLastName)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Motion.div>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </PageContainer>
    );
}
