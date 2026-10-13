import { v4 as uuidv4 } from 'uuid';
import { getSaleById, updateSale, markSaleDeliveredRequest, sendSaleEmail, getSaleShareLink } from '../../api/sale.js'
import { getSaleDetailById } from '../../api/saleDetail.js'
import { getPaymentBySaleId, createPayment } from '../../api/payment.js'
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext.jsx'
import useTenantPermissions from '../../hooks/useTenantPermissions.js'
import useReceiptBusiness from '../../hooks/useReceiptBusiness.js'
import {
    buildSaleWhatsAppMessage,
    buildSaleWhatsAppShareUrl,
} from '../../utils/saleShare.js'
import { useConfirm } from '../../context/ConfirmationContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { IconPrinter } from "../../components/IconComponent.jsx"
import { PDFDownloadLink } from '@react-pdf/renderer'
import SimpleTestPDFContent from '../../components/Printables/SimpleTestPDF.jsx'
import SaleDeliveryBadge from '../../components/sales/SaleDeliveryBadge.jsx'
import SaleWorkOrdersSection from '../../components/sales/SaleWorkOrdersSection.jsx'
import SalePurchaseCertificatesSection from '../../components/sales/SalePurchaseCertificatesSection.jsx'
import { isDeliveryControlEnabled } from '../../utils/businessReceiptSettings.js'
import { isOpticsBusiness } from '../../utils/businessModality.js'
import { getWorkOrdersBySaleId } from '../../api/workOrders.js'
import { motion as Motion, AnimatePresence } from "framer-motion";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { 
    FaHashtag, 
    FaCalendarAlt, 
    FaUser, 
    FaMoneyBillWave, 
    FaClipboardList, 
    FaArrowLeft, 
    FaPlus, 
    FaPrint, 
    FaTimes,
    FaCreditCard,
    FaMoneyBill,
    FaUniversity,
    FaBoxOpen,
    FaTruck,
    FaEnvelope,
    FaWhatsapp,
} from "react-icons/fa";

export default function ViewSalePage() {
    const { business } = useAuth();
    const { isTenantAdmin } = useTenantPermissions();
    const receiptBusiness = useReceiptBusiness();
    const confirm = useConfirm();
    const toast = useToast();
    const [sale, setSale] = useState({});
    const [tableProductAndService, setTableProductAndService] = useState([]);
    const [tablaPayment, setTablaPayment] = useState([])
    const { id } = useParams();
    const [paymentId, setPaymentId] = useState(uuidv4());
    const [method, setMethod] = useState("");
    const [payment, setPayment] = useState(0);
    const [btnModal, setBtnModal] = useState(false); // Used for loading state of button
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [markingDelivered, setMarkingDelivered] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const [workOrders, setWorkOrders] = useState([]);
    const [editingSale, setEditingSale] = useState(false);
    const [editPrices, setEditPrices] = useState({});
    const [editPayments, setEditPayments] = useState([]);
    const [savingSale, setSavingSale] = useState(false);

    const DOCUMENT_LABELS = {
        RECEIPT: "Comprobante de venta",
        BOLETA: "Boleta electrónica",
        FACTURA: "Factura electrónica",
    };

    const deliveryControlEnabled = useMemo(
        () => isDeliveryControlEnabled(business),
        [business],
    );

    const hasProducts = useMemo(
        () => tableProductAndService.some((item) => item.saleDetailType === "PRODUCT"),
        [tableProductAndService],
    );

    const isOptics = useMemo(() => isOpticsBusiness(business), [business]);

    const hasPendingWorkOrders = useMemo(
        () => workOrders.length > 0 && workOrders.some((wo) => wo.workOrderStatus !== "DELIVERED"),
        [workOrders],
    );

    /** Óptica: estado de entrega = OTs. Otras modalidades: saleDeliveryStatus. */
    const effectiveDeliveryStatus = useMemo(() => {
        if (isOptics) {
            if (workOrders.length === 0) return null;
            return hasPendingWorkOrders ? "PENDING" : "DELIVERED";
        }
        return sale?.saleDeliveryStatus || null;
    }, [isOptics, workOrders.length, hasPendingWorkOrders, sale?.saleDeliveryStatus]);

    const showDeliverySection = isOptics
        ? workOrders.length > 0
        : deliveryControlEnabled && hasProducts && Boolean(sale?.saleDeliveryStatus);

    const customerEmail = sale?.customer?.customerEmail?.trim() || "";
    const customerPhone = sale?.customer?.customerPhoneNumber?.trim() || "";
    const customerPhoneCode = sale?.customer?.customerCodePhoneNumber?.trim() || "";
    const customerName = [
        sale?.customer?.customerFirstName,
        sale?.customer?.customerLastName,
    ].filter(Boolean).join(" ").trim();

    const documentLabel = DOCUMENT_LABELS[sale?.documentType] || DOCUMENT_LABELS.RECEIPT;
    const activePayments = tablaPayment.filter((item) => Number(item.paymentAmount) > 0);

    // Payment methods for the modal
    const methods = [
        { methodId: 0, methodName: 'Tarjeta de Débito', icon: <FaCreditCard /> },
        { methodId: 1, methodName: 'Tarjeta de Crédito', icon: <FaCreditCard /> },
        { methodId: 2, methodName: 'Efectivo', icon: <FaMoneyBill /> },
        { methodId: 3, methodName: 'Transferencia Bancaria', icon: <FaUniversity /> },
    ];

    const searchSaleById = useCallback(async () => {
        try {
            const saleData = await getSaleById(id);
            const saleDetailData = await getSaleDetailById(id);
            const payments = await getPaymentBySaleId(id)

            setSale(saleData.data);
            setTableProductAndService(saleDetailData.data);
            setTablaPayment(payments.data)

            // Update initial amount to pending amount
            setPayment(saleData.data.salePendingAmount || 0);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    }, [id]);

    const fetchWorkOrders = async () => {
        if (!isOptics) return;
        try {
            const { data } = await getWorkOrdersBySaleId(id);
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
        }
    };

    // Call search function on initial load
    useEffect(() => {
        searchSaleById();
    }, [searchSaleById]);

    useEffect(() => {
        fetchWorkOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOptics, id]);

    const handleAmountChange = (e) => {
        const newAmount = Number(e.target.value);
        if (newAmount > sale.salePendingAmount) {
            alert('El monto del abono no puede exceder el saldo pendiente.');
            setPayment(sale.salePendingAmount);
            return;
        }
        setPayment(newAmount)
    };

    const handleClickModal = () => {
        setBtnModal(true);
        if (method === "") {
            alert('Debe seleccionar un método de pago.')
            setBtnModal(false);
            return;
        }

        if (payment <= 0) {
            alert('El monto debe ser mayor a 0.')
            setBtnModal(false);
            return;
        }

        const data = {
            paymentId: paymentId,
            paymentMethod: method,
            paymentAmount: payment,
            saleId: sale.saleId
        }

        if (data.paymentAmount > sale.salePendingAmount) {
            alert('El monto del abono no puede exceder el saldo pendiente.')
            setBtnModal(false);
            return;
        }

        createPayment(data).then(() => {
            setPaymentId(uuidv4());
            searchSaleById(); // Reload data to view the payment
            setShowPaymentModal(false); // Close modal using state
            // Reset form
            setMethod("");
            setPayment(0);
            setBtnModal(false);
        }).catch(err => {
            console.error(err);
            setBtnModal(false);
        });
    };

    const handleClickModalOpen = () => {
        setPayment(sale.salePendingAmount || 0);
        setMethod(""); 
        setShowPaymentModal(true);
    };

    const startSaleEdit = () => {
        setEditPrices(Object.fromEntries(
            tableProductAndService
                .filter((item) => item.saleDetailType === "PRODUCT" && item.product?.productPriceFixed === false)
                .map((item) => [item.saleDetailId, String(item.saleDetailPrice)]),
        ));
        setEditPayments(tablaPayment
            .filter((item) => Number(item.paymentAmount) > 0)
            .map((item) => ({
                paymentMethod: String(item.paymentMethod),
                paymentAmount: String(item.paymentAmount),
            })));
        setEditingSale(true);
    };

    const saveSaleEdit = async () => {
        const details = tableProductAndService.flatMap((item) => {
            if (!Object.hasOwn(editPrices, item.saleDetailId)) return [];
            const saleDetailPrice = Number(editPrices[item.saleDetailId]);
            return saleDetailPrice === Number(item.saleDetailPrice)
                ? []
                : [{ saleDetailId: item.saleDetailId, saleDetailPrice }];
        });
        const payments = editPayments.map((item) => ({
            paymentMethod: item.paymentMethod,
            paymentAmount: Number(item.paymentAmount),
        }));
        const updatedTotal = tableProductAndService.reduce((sum, item) => {
            const price = Object.hasOwn(editPrices, item.saleDetailId)
                ? Number(editPrices[item.saleDetailId])
                : Number(item.saleDetailPrice);
            return sum + price * Number(item.saleDetailQuantity);
        }, 0);

        if (details.some((item) => !Number.isSafeInteger(item.saleDetailPrice) || item.saleDetailPrice < 0)) {
            toast.error("Precio inválido", "Usa montos enteros iguales o mayores que cero.");
            return;
        }
        if (payments.some((item) => !["0", "1", "2", "3"].includes(item.paymentMethod)
            || !Number.isSafeInteger(item.paymentAmount) || item.paymentAmount <= 0)) {
            toast.error("Pago inválido", "Cada método añadido debe tener un monto entero mayor que cero.");
            return;
        }
        if (payments.reduce((sum, item) => sum + item.paymentAmount, 0) > updatedTotal) {
            toast.error("Montos excedidos", "Los pagos no pueden superar el total de la venta.");
            return;
        }

        setSavingSale(true);
        try {
            await updateSale(sale.saleId, { details, payments });
            setEditingSale(false);
            await searchSaleById();
            toast.success("Venta actualizada", "Se guardaron los precios y la distribución de pagos.");
        } catch (error) {
            toast.error(
                "No se pudo actualizar",
                error.response?.data?.message ?? "Ocurrió un error al guardar los cambios.",
            );
        } finally {
            setSavingSale(false);
        }
    };

    const handleMarkDelivered = async () => {
        const isConfirmed = await confirm({
            title: "¿Marcar como entregado?",
            message: "Se registrará la fecha, hora y tu usuario como responsable de la entrega.",
            variant: "success",
            confirmText: "Marcar entregado",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setMarkingDelivered(true);
        try {
            const { data } = await markSaleDeliveredRequest(sale.saleId);
            setSale(data.sale);
            toast.success("Entrega registrada", "La venta quedó marcada como entregada.");
        } catch (error) {
            if (error.response?.data?.code === "WORK_ORDERS_PENDING_DELIVERY") {
                toast.error(
                    "Órdenes de trabajo pendientes",
                    error.response?.data?.message ?? "Existen órdenes de trabajo sin entregar al cliente.",
                );
            } else {
                toast.error(
                    "No se pudo registrar",
                    error.response?.data?.message ?? "Ocurrió un error al marcar la entrega.",
                );
            }
        } finally {
            setMarkingDelivered(false);
        }
    };

    const handleSendEmail = async () => {
        if (!customerEmail) {
            toast.info("Sin correo", "El cliente no tiene correo electrónico registrado.");
            return;
        }
        setSendingEmail(true);
        try {
            await sendSaleEmail(id);
            toast.success("Correo enviado", `Comprobante enviado a ${customerEmail}.`);
        } catch (error) {
            toast.error(
                "No se pudo enviar",
                error.response?.data?.message ?? "Ocurrió un error al enviar el correo.",
            );
        } finally {
            setSendingEmail(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!customerPhone) {
            toast.info("Sin teléfono", "El cliente no tiene número de WhatsApp registrado.");
            return;
        }
        setSendingWhatsApp(true);
        try {
            const linkRes = await getSaleShareLink(id);
            const message = buildSaleWhatsAppMessage({
                customerName,
                businessName: receiptBusiness?.businessName || business?.businessName,
                saleNumber: sale?.saleNumber,
                saleDate: sale?.createdAt
                    ? new Date(sale.createdAt).toLocaleDateString("es-CL")
                    : "",
                documentLabel,
                total: sale?.saleTotal,
                itemCount: tableProductAndService.length,
                publicUrl: linkRes.data.shareUrl,
            });
            const shareUrl = buildSaleWhatsAppShareUrl({
                customerCodePhoneNumber: customerPhoneCode,
                customerPhoneNumber: customerPhone,
                message,
            });
            if (!shareUrl) {
                toast.info("WhatsApp", "No se pudo preparar el enlace de WhatsApp.");
                return;
            }
            window.open(shareUrl, "_blank", "noopener,noreferrer");
            toast.success("WhatsApp", "Se abrió el chat con el enlace al comprobante.");
        } catch (error) {
            toast.error(
                "WhatsApp",
                error.response?.data?.message ?? "No se pudo generar el enlace para compartir.",
            );
        } finally {
            setSendingWhatsApp(false);
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';
    };

    // Helper to get method name
    const getMethodName = (id) => {
        const m = methods.find(item => item.methodId === Number(id));
        return m ? m.methodName : 'Desconocido';
    };

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } }
    };

    const itemVariants = { hidden: { y: 8 }, visible: { y: 0 } };

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
                                Detalle de Venta
                                <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    #{sale?.saleNumber}
                                </span>
                                {showDeliverySection && (
                                    <SaleDeliveryBadge status={effectiveDeliveryStatus} className="text-xs" />
                                )}
                            </h1>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <Link to="/sales" className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
                                <FaArrowLeft /> Volver
                            </Link>

                            {!isLoading && isTenantAdmin && sale.editability && !sale.editability.allowed && (
                                <span className="self-center text-xs text-gray-500">
                                    {sale.editability.reason === "DAY_CLOSED" ? "Día cerrado: edición bloqueada." : "Solo se editan ventas de hoy o ayer."}
                                </span>
                            )}

                            {!isLoading && isTenantAdmin && sale.editability?.allowed && !editingSale && (
                                <button type="button" onClick={startSaleEdit} className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-sm text-sm font-bold">
                                    <FaClipboardList /> Editar venta
                                </button>
                            )}
                            {editingSale && (
                                <>
                                    <button type="button" onClick={() => setEditingSale(false)} disabled={savingSale} className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-60">Cancelar</button>
                                    <button type="button" onClick={saveSaleEdit} disabled={savingSale} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-60">{savingSale ? "Guardando…" : "Guardar cambios"}</button>
                                </>
                            )}

                            {!isLoading && sale.salePendingAmount > 0 && (
                                <button
                                    onClick={handleClickModalOpen}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"
                                >
                                    <FaPlus /> Abonar
                                </button>
                            )}

                            {!isLoading &&
                                !isOptics &&
                                showDeliverySection &&
                                sale.saleDeliveryStatus === "PENDING" && (
                                <button
                                    type="button"
                                    onClick={handleMarkDelivered}
                                    disabled={markingDelivered}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FaTruck />
                                    {markingDelivered ? "Registrando..." : "Marcar como entregado"}
                                </button>
                            )}

                            {!isLoading && (
                                <PDFDownloadLink
                                    document={
                                        <SimpleTestPDFContent
                                            sale={sale}
                                            tableProductAndService={tableProductAndService}
                                            business={receiptBusiness}
                                        />
                                    }
                                    fileName={`boleta-${sale.saleNumber}.pdf`}
                                >
                                    {({ loading }) => (
                                        <button className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm text-sm font-medium">
                                            {loading ? 'Generando...' : <><FaPrint /> PDF</>}
                                        </button>
                                    )}
                                </PDFDownloadLink>
                            )}

                            {!isLoading && customerEmail && (
                                <button
                                    type="button"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold disabled:opacity-60"
                                >
                                    <FaEnvelope />
                                    {sendingEmail ? "Enviando..." : "Enviar correo"}
                                </button>
                            )}

                            {!isLoading && customerPhone && (
                                <button
                                    type="button"
                                    onClick={handleSendWhatsApp}
                                    disabled={sendingWhatsApp}
                                    className="flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe57] transition-colors shadow-sm text-sm font-bold disabled:opacity-60"
                                >
                                    <FaWhatsapp />
                                    {sendingWhatsApp ? "Preparando..." : "WhatsApp"}
                                </button>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="spinner-border text-emerald-600 w-12 h-12 border-4 rounded-full" role="status"></div>
                        </div>
                    ) : (
                        <Motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4" // Reduced space between cards
                        >
                            
                            {/* 1. Main Info Card (Compact Grid) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-base font-bold text-emerald-600 mb-4 border-b border-gray-100 pb-2">
                                    Información General
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                    {/* Sale Number */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Número de venta</span>
                                        <span className="text-base font-bold text-gray-900">{sale?.saleNumber}</span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fecha</span>
                                        <span className="text-base font-bold text-gray-900">{new Date(sale?.createdAt).toLocaleDateString('es-CL')}</span>
                                    </div>

                                    {/* Customer */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</span>
                                        <span className="text-base font-bold text-gray-900 capitalize truncate">
                                            {sale.customer?.customerFirstName} {sale.customer?.customerLastName}
                                        </span>
                                    </div>

                                    {/* Seller */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Vendedor</span>
                                        <span className="text-base font-bold text-gray-900 capitalize truncate">
                                            {sale.user?.userFirstName} {sale.user?.userLastName}
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Venta</span>
                                        <span className="text-lg font-extrabold text-emerald-600">
                                            {formatCurrency(sale.saleTotal)}
                                        </span>
                                    </div>

                                    {/* Pending */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pendiente</span>
                                        <span className={`text-lg font-extrabold ${sale.salePendingAmount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formatCurrency(sale.salePendingAmount)}
                                        </span>
                                    </div>

                                    {showDeliverySection && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado de entrega</span>
                                            <div className="mt-1">
                                                <SaleDeliveryBadge status={effectiveDeliveryStatus} />
                                            </div>
                                            {isOptics && hasPendingWorkOrders && (
                                                <span className="text-xs text-amber-700 mt-1">
                                                    Hay órdenes de trabajo pendientes de entregar al cliente.
                                                </span>
                                            )}
                                            {!isOptics && sale.saleDeliveryStatus === "DELIVERED" && sale.saleDeliveredAt && (
                                                <span className="text-xs text-gray-500 mt-1">
                                                    {new Date(sale.saleDeliveredAt).toLocaleString("es-CL")}
                                                    {sale.deliveredBy && (
                                                        <> · {sale.deliveredBy.userFirstName} {sale.deliveredBy.userLastName}</>
                                                    )}
                                                </span>
                                            )}
                                            {isOptics && effectiveDeliveryStatus === "DELIVERED" && (
                                                <span className="text-xs text-gray-500 mt-1">
                                                    Todas las OT de esta venta fueron entregadas.
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Observations */}
                                    <div className="col-span-2 md:col-span-2">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Observaciones</span>
                                        <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                                            <p className="text-sm text-gray-700 italic">
                                                {sale?.saleObservation || "Sin observaciones."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Items Table (Compact) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <h5 className="font-bold text-gray-800 text-sm uppercase">Productos y Servicios</h5>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Tipo</th>
                                                <th className="px-4 py-2 font-semibold">SKU / Nombre</th>
                                                <th className="px-4 py-2 font-semibold">Producto / Servicio</th>
                                                <th className="px-4 py-2 font-semibold text-center">Cant.</th>
                                                <th className="px-4 py-2 font-semibold text-right">Precio</th>
                                                <th className="px-4 py-2 font-semibold text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {tableProductAndService?.map((ps) => (
                                                <tr key={ps.saleDetailId} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ps.saleDetailType === 'PRODUCT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {ps.saleDetailType === 'PRODUCT' ? 'PROD' : 'SERV'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                                                        {ps.product?.productSKU || ps.service?.serviceSKU}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                        {ps.product?.productName || ps.service?.serviceName}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{ps?.saleDetailQuantity}</td>
                                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                        {editingSale && ps.saleDetailType === "PRODUCT" && ps.product?.productPriceFixed === false ? (
                                                            <input aria-label={`Precio ${ps.product?.productName}`} type="number" min="0" step="1" value={editPrices[ps.saleDetailId] ?? ps.saleDetailPrice} onChange={(event) => setEditPrices((current) => ({ ...current, [ps.saleDetailId]: event.target.value }))} className="w-32 rounded border border-gray-300 px-2 py-1 text-right" />
                                                        ) : formatCurrency(ps?.saleDetailPrice)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                                                        {formatCurrency((editingSale && Object.hasOwn(editPrices, ps.saleDetailId) ? Number(editPrices[ps.saleDetailId]) : Number(ps.saleDetailPrice)) * Number(ps.saleDetailQuantity))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 3. Payments Table (Compact) — debajo de productos */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center justify-between gap-3">
                                        <h5 className="font-bold text-gray-800 text-sm uppercase">Detalle de Pagos</h5>
                                        {editingSale && <button type="button" onClick={() => setEditPayments((current) => [...current, { paymentMethod: "2", paymentAmount: "" }])} className="text-sm font-semibold text-emerald-700">+ Añadir método</button>}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    {editingSale ? (
                                        <div className="space-y-3 p-4">
                                            {editPayments.map((item, index) => (
                                                <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_160px_auto]">
                                                    <select aria-label={`Método de pago ${index + 1}`} value={item.paymentMethod} onChange={(event) => setEditPayments((current) => current.map((paymentItem, paymentIndex) => paymentIndex === index ? { ...paymentItem, paymentMethod: event.target.value } : paymentItem))} className="rounded-lg border border-gray-300 p-2 text-sm">
                                                        {methods.map((methodItem) => <option key={methodItem.methodId} value={String(methodItem.methodId)}>{methodItem.methodName}</option>)}
                                                    </select>
                                                    <input aria-label={`Monto del pago ${index + 1}`} type="number" min="1" step="1" value={item.paymentAmount} onChange={(event) => setEditPayments((current) => current.map((paymentItem, paymentIndex) => paymentIndex === index ? { ...paymentItem, paymentAmount: event.target.value } : paymentItem))} placeholder="Monto" className="rounded-lg border border-gray-300 p-2 text-right text-sm" />
                                                    <button type="button" onClick={() => setEditPayments((current) => current.filter((_, paymentIndex) => paymentIndex !== index))} className="rounded px-3 py-2 text-sm text-red-700 hover:bg-red-50">Quitar</button>
                                                </div>
                                            ))}
                                            <div className="flex flex-wrap justify-between gap-2 border-t pt-3 text-sm">
                                                <span>Total actualizado: <strong>{formatCurrency(tableProductAndService.reduce((sum, item) => sum + (Object.hasOwn(editPrices, item.saleDetailId) ? Number(editPrices[item.saleDetailId]) : Number(item.saleDetailPrice)) * Number(item.saleDetailQuantity), 0))}</strong></span>
                                                <span>Pagado: <strong>{formatCurrency(editPayments.reduce((sum, item) => sum + (Number(item.paymentAmount) || 0), 0))}</strong></span>
                                                <span>Por cobrar: <strong>{formatCurrency(Math.max(0, tableProductAndService.reduce((sum, item) => sum + (Object.hasOwn(editPrices, item.saleDetailId) ? Number(editPrices[item.saleDetailId]) : Number(item.saleDetailPrice)) * Number(item.saleDetailQuantity), 0) - editPayments.reduce((sum, item) => sum + (Number(item.paymentAmount) || 0), 0)))}</strong></span>
                                            </div>
                                        </div>
                                    ) : <table className="w-full text-left">
                                        <thead className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Fecha</th>
                                                <th className="px-4 py-2 font-semibold">Método de pago</th>
                                                <th className="px-4 py-2 font-semibold text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {activePayments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-6 text-center text-xs text-gray-500 italic">
                                                        No hay pagos registrados
                                                    </td>
                                                </tr>
                                            ) : (
                                                activePayments.map((p) => (
                                                    <tr key={p.paymentId}>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(p?.createdAt).toLocaleDateString('es-CL')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            <span className="inline-flex items-center gap-2">
                                                                {methods.find(m => m.methodId === Number(p.paymentMethod))?.icon || <FaCreditCard />}
                                                                {getMethodName(p.paymentMethod)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                                                            {formatCurrency(p?.paymentAmount)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>}
                                </div>
                            </div>

                            {/* 2.5 Órdenes de Trabajo (Óptica) */}
                            {isOptics && (
                                <SaleWorkOrdersSection
                                    saleId={sale.saleId}
                                    customerId={sale.saleCustomerId || sale.customer?.customerId}
                                    saleDetails={tableProductAndService}
                                    onChanged={fetchWorkOrders}
                                />
                            )}

                            {/* 2.6 Certificados de Compra (Óptica) */}
                            {isOptics && sale?.saleId && (
                                <SalePurchaseCertificatesSection saleId={sale.saleId} />
                            )}

                        </Motion.div>
                    )}

                </Motion.div>
            </div>

            {/* Custom Tailwind Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <FaMoneyBillWave /> Registrar Abono
                                </h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white transition-colors">
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {methods.map((m) => (
                                            <button
                                                key={m.methodId}
                                                onClick={() => setMethod(m.methodId.toString())}
                                                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all
                                                    ${method === m.methodId.toString() 
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500 font-medium' 
                                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`
                                                }
                                            >
                                                <span className="text-lg">{m.icon}</span>
                                                {m.methodName}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Abonar</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={payment}
                                            onChange={handleAmountChange}
                                            className="pl-7 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all font-mono text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-right">
                                        Máximo: {formatCurrency(sale.salePendingAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                                    disabled={btnModal}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleClickModal}
                                    disabled={btnModal}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold text-sm shadow-sm flex items-center gap-2"
                                >
                                    {btnModal ? 'Procesando...' : 'Confirmar Pago'}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    )
};