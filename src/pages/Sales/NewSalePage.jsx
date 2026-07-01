import { getCustomers } from "../../api/customers.js";
import { getProductsAndServices } from "../../libs/productsAndServices.js";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardRegisterPayments from "../../components/paymennts/CardRegisterPayments.jsx";
import formatName from "../../utils/formatName.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { createSaleGeneral } from "../../utils/createSale.js";
import { createQuotationGeneral } from "../../utils/createQuotation.js";
import { issueTaxDocumentRequest } from "../../api/taxDocuments.js";
import ReceiptTypeSelector, {
  RECEIPT_SHORT_LABELS,
  isQuotationDocumentType,
} from "../../components/billing/ReceiptTypeSelector.jsx";
import SendDocumentEmailOption from "../../components/sales/SendDocumentEmailOption.jsx";
import SendDocumentWhatsAppOption from "../../components/sales/SendDocumentWhatsAppOption.jsx";
import { getSaleShareLink } from "../../api/sale.js";
import {
  buildSaleWhatsAppMessage,
  buildSaleWhatsAppShareUrl,
} from "../../utils/saleShare.js";
import FacturaReceiverForm from "../../components/billing/FacturaReceiverForm.jsx";
import { validateSaleStockLines, formatSaleStockErrors } from "../../utils/validateSaleStock.js";
import { isCreditSalesEnabled, isDeliveryControlEnabled } from "../../utils/businessReceiptSettings.js";
import {
    isSalePaymentComplete,
    validateSalePaymentsForCreditPolicy,
} from "../../utils/salePaymentValidation.js";
import { v4 as uuidv4 } from "uuid";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaUserTie,
  FaSave,
  FaBoxOpen,
  FaChevronLeft,
  FaMinus,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";

import { getClosureStatus, closeAllPendingClosures } from "../../api/dailySales.js";
import { useAbortEffect, isAbortError } from "../../hooks/useAbortEffect.js";
import { useMatchMedia } from "../../hooks/useMatchMedia.js";
import { SaleLineItemMobileCard } from "../../components/sales/SaleRegisterLineItem.jsx";
import RegisterCustomerBar from "../../components/sales/RegisterCustomerBar.jsx";
import FormFlatSection from "../../components/forms/FormFlatSection.jsx";
import {
  PRIMARY_BTN,
  PRIMARY_BTN_BLOCK,
  TABLE_WRAPPER_FULL,
  TABLE_TOOLBAR,
  TABLE_INPUT,
  TABLE_SECTION_TITLE,
  TABLE_SECTION_SUB,
  THEAD,
  TH,
  TD,
  TD_MUTED,
  TD_AMOUNT,
  TR_ROW,
  TBODY,
  ACTION_DELETE,
  FLAT_PAGE_HEADER,
  FLAT_META_TEXT,
  FLAT_MOBILE_SCROLL,
  FLAT_INPUT,
  FLAT_TAP_TARGET,
  formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

// ── Empty row factory ──────────────────────────────────
const createEmptyRow = () => ({
  saleDetailId: uuidv4(),
  saleDetailSKU: "",
  saleDetailProductServiceId: undefined,
  saleDetailPrice: 0,
  saleDetailPriceFixed: true,
  saleDetailAmount: 1,
  saleDetailTotal: 0,
  saleDetailType: null,
});

// ── IVA Rate ────────────────────────────────────────────
const IVA_RATE = 0.19;

function formatPendingClosureDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Evita toasts duplicados al remontar (React Strict Mode). */
let lastClosureToastKey = null;

export default function NewSalePage() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  /** { blocked, error, fechaPendiente, fechasPendientes, message } | null */
  const [closureBlock, setClosureBlock] = useState(null);
  const [closingAllPending, setClosingAllPending] = useState(false);
  const [saleId, setSaleId] = useState(uuidv4());
  const [quotationId, setQuotationId] = useState(uuidv4());
  const [sendByEmail, setSendByEmail] = useState(false);
  const [sendByWhatsApp, setSendByWhatsApp] = useState(false);
  const { user, business } = useAuth();
  const creditSalesEnabled = useMemo(
    () => isCreditSalesEnabled(business),
    [business],
  );
  const deliveryControlEnabled = useMemo(
    () => isDeliveryControlEnabled(business),
    [business],
  );

  // Data
  const [customers, setCustomers] = useState([]);
  const [productsServices, setProductsServices] = useState([]);
  const [dataTable, setDataTable] = useState([createEmptyRow()]);
  const [dataSalePayments, setDataSalePayments] = useState([]);

  const [documentType, setDocumentType] = useState("RECEIPT");
  const isQuotationMode = isQuotationDocumentType(documentType);
  const [facturaReceiver, setFacturaReceiver] = useState({
    businessName: "",
    rut: "",
    businessActivity: "",
    address: "",
    commune: "",
    city: "",
    email: "",
  });

  // Totals
  const [total, setTotal] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const amountDue = useMemo(() => total - totalPayments, [total, totalPayments]);
  const requireFullPayment = !creditSalesEnabled && !isQuotationMode;

  // Sale header
  const [dataSale, setDataSale] = useState({
    saleId: saleId,
    saleComment: "",
    saleCustomerId: null,
    saleTotal: 0,
    saleTotalPayments: 0,
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const isSalesBlocked = closureBlock?.blocked === true;
  /** Ventas bloqueadas por cierre; las cotizaciones siguen habilitadas. */
  const blockSalesRegistration = isSalesBlocked && !isQuotationMode;
  const isDesktopLayout = useMatchMedia("(min-width: 768px)");

  const salePaymentComplete = useMemo(
    () =>
      isSalePaymentComplete({
        creditSalesEnabled,
        total,
        payments: dataSalePayments,
        totalPayments,
      }),
    [creditSalesEnabled, total, dataSalePayments, totalPayments],
  );
  const canFinalizeSale = useMemo(() => {
    const hasValidItems = dataTable.some((row) => row.saleDetailProductServiceId);
    if (isQuotationMode) {
      return total > 0 && Boolean(dataSale.saleCustomerId) && hasValidItems;
    }
    return (
      !isSalesBlocked &&
      (creditSalesEnabled || total <= 0 || salePaymentComplete)
    );
  }, [
    isQuotationMode,
    total,
    dataSale.saleCustomerId,
    dataTable,
    isSalesBlocked,
    creditSalesEnabled,
    salePaymentComplete,
  ]);

  const submitActionLabel = isQuotationMode ? "Generar cotización" : "Finalizar venta";

  const applyClosureStatus = useCallback((status) => {
    if (status?.blocked) {
      setClosureBlock(status);
    } else {
      setClosureBlock(null);
    }
  }, []);

  // ── Derived values ──────────────────────────────────
  const todayDate = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // IVA calculations (prices include IVA, so we extract neto)
  const netTotal = useMemo(() => Math.round(total / (1 + IVA_RATE)), [total]);
  const ivaTotal = useMemo(() => total - netTotal, [total, netTotal]);

  // Selected customer object
  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (c) => String(c.customerId) === String(dataSale.saleCustomerId ?? ""),
      ),
    [customers, dataSale.saleCustomerId],
  );

  const customerHasEmail = Boolean(selectedCustomer?.customerEmail?.trim());
  const customerHasPhone = Boolean(selectedCustomer?.customerPhoneNumber?.trim());

  const SALE_DOCUMENT_LABELS = {
    RECEIPT: "Comprobante de venta",
    BOLETA: "Boleta electrónica",
    FACTURA: "Factura electrónica",
  };

  useEffect(() => {
    if (!customerHasEmail) {
      setSendByEmail(false);
    }
  }, [customerHasEmail, dataSale.saleCustomerId]);

  useEffect(() => {
    if (!customerHasPhone) {
      setSendByWhatsApp(false);
    }
  }, [customerHasPhone, dataSale.saleCustomerId]);

  const tryOpenSaleWhatsAppShare = useCallback(
    async (saleId, saleNumber) => {
      if (!sendByWhatsApp || !customerHasPhone) return;
      const customerLabel = selectedCustomer
        ? `${selectedCustomer.customerFirstName} ${selectedCustomer.customerLastName}`.trim()
        : "";
      try {
        const linkRes = await getSaleShareLink(saleId);
        const message = buildSaleWhatsAppMessage({
          customerName: customerLabel,
          businessName: business?.businessName,
          saleNumber,
          saleDate: new Date().toLocaleDateString("es-CL"),
          documentLabel: SALE_DOCUMENT_LABELS[documentType] || SALE_DOCUMENT_LABELS.RECEIPT,
          total,
          itemCount: dataTable.filter((row) => row.saleDetailProductServiceId).length,
          publicUrl: linkRes.data.shareUrl,
        });
        const shareUrl = buildSaleWhatsAppShareUrl({
          customerCodePhoneNumber: selectedCustomer?.customerCodePhoneNumber,
          customerPhoneNumber: selectedCustomer?.customerPhoneNumber,
          message,
        });
        if (shareUrl) {
          window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
      } catch (error) {
        toast.info(
          "WhatsApp",
          error.response?.data?.message || "No se pudo abrir WhatsApp con el enlace.",
        );
      }
    },
    [
      sendByWhatsApp,
      customerHasPhone,
      selectedCustomer,
      business?.businessName,
      documentType,
      total,
      dataTable,
      toast,
    ],
  );

  // Filtered customers for search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        `${c.customerFirstName} ${c.customerLastName}`
          .toLowerCase()
          .includes(q) ||
        (c.customerDocumentNumber &&
          c.customerDocumentNumber.toLowerCase().includes(q)) ||
        (c.customerPhoneNumber &&
          c.customerPhoneNumber.toLowerCase().includes(q)) ||
        (c.customerEmail &&
          c.customerEmail.toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  // ── Data loaders ────────────────────────────────────
  const searchCustomers = useCallback(async (signal) => {
    try {
      const res = await getCustomers({ signal });
      setCustomers(res.data);
      return res.data;
    } catch (error) {
      if (!isAbortError(error)) console.log(error);
      return [];
    }
  }, []);

  const searchProductsServices = useCallback(async (signal) => {
    try {
      const res = await getProductsAndServices({ signal });
      setProductsServices(res);
      return res;
    } catch (error) {
      if (!isAbortError(error)) console.log(error);
      return [];
    }
  }, []);

  const notifyClosureBlockOnce = useCallback((status) => {
    if (!status?.blocked) return;
    const key = `${status.error}:${status.fechaPendiente ?? ""}`;
    if (lastClosureToastKey === key) return;
    lastClosureToastKey = key;
    if (status.error === "DAY_CLOSED") {
      toast.info("Día cerrado", status.message);
    } else {
      toast.error("Operación bloqueada", status.message);
    }
  }, [toast]);

  const checkSalesClosureStatus = useCallback(async (signal) => {
    try {
      const res = await getClosureStatus({ signal });
      applyClosureStatus(res.data);
      notifyClosureBlockOnce(res.data);
    } catch (error) {
      if (!isAbortError(error)) {
        console.error("Error verificando cierre diario:", error);
      }
    }
  }, [applyClosureStatus, notifyClosureBlockOnce]);

  useAbortEffect((signal) => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [customersRes, productsRes] = await Promise.all([
          getCustomers({ signal }),
          getProductsAndServices({ signal }),
        ]);
        if (!signal.aborted) {
          setCustomers(customersRes.data ?? []);
          setProductsServices(productsRes ?? []);
        }
        await checkSalesClosureStatus(signal);
      } catch (error) {
        if (!isAbortError(error)) console.error(error);
      } finally {
        if (!signal.aborted) setIsDataLoading(false);
      }
    };
    loadData();
    // Carga inicial única al montar — evita re-fetch en loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseAllPending = async () => {
    const pendingCount = closureBlock?.fechasPendientes?.length ?? (closureBlock?.fechaPendiente ? 1 : 0);
    if (pendingCount === 0) return;

    const isConfirmed = await confirm({
      title: '¿Cerrar todos los días pendientes?',
      message: `Se procesarán ${pendingCount} cierre(s) diario(s) para habilitar nuevas ventas.`,
      variant: 'success',
      confirmText: 'Sí, cerrar todos',
      cancelText: 'Cancelar',
    });
    if (!isConfirmed) return;

    try {
      setClosingAllPending(true);
      const res = await closeAllPendingClosures();
      const { closedCount = 0 } = res.data ?? {};
      if (closedCount > 0) {
        toast.success('Cierres completados', `Se registraron ${closedCount} cierre(s) pendiente(s).`);
        await checkSalesClosureStatus();
      } else {
        toast.info('Sin pendientes', 'No había cierres pendientes por procesar.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error', 'No se pudieron cerrar los días pendientes.');
    } finally {
      setClosingAllPending(false);
    }
  };

  // ── Table handlers ──────────────────────────────────
  const newRow = () => {
    setDataTable((prev) => [...prev, createEmptyRow()]);
  };

  const handleDeleteRow = (idToRemove) => {
    setDataTable((prev) => {
      const updated = prev.filter((item) => item.saleDetailId !== idToRemove);
      const newTotal = updated.reduce(
        (sum, item) => sum + Number(item.saleDetailTotal),
        0,
      );
      setTotal(newTotal);
      return updated;
    });
  };

  const handleOnInput = (index, field, value) => {
    const rows = [...dataTable];
    rows[index][field] = Number(value);
    const rowTotal =
      Number(rows[index].saleDetailPrice) *
      Number(rows[index].saleDetailAmount);
    rows[index].saleDetailTotal = rowTotal;
    setDataTable(rows);
    const newTotal = rows.reduce(
      (sum, item) => sum + Number(item.saleDetailTotal),
      0,
    );
    setTotal(newTotal);
  };

  const handleChangeSelect = (e, index) => {
    const value = e.target.value;
    const selectedProductService = productsServices.find(
      (p) => p.productId === value || p.serviceId === value,
    );
    if (selectedProductService) {
      const updatedDataTable = [...dataTable];
      updatedDataTable[index].saleDetailSKU =
        selectedProductService.productSKU ||
        selectedProductService.serviceSKU ||
        "";
      updatedDataTable[index].saleDetailProductServiceId = value;
      updatedDataTable[index].saleDetailPrice = Number(
        selectedProductService.productPrice ||
          selectedProductService.servicePrice ||
          0,
      );
      updatedDataTable[index].saleDetailTotal =
        updatedDataTable[index].saleDetailPrice *
        Number(updatedDataTable[index].saleDetailAmount);
      updatedDataTable[index].saleDetailType = selectedProductService.productId
        ? "PRODUCT"
        : "SERVICE";
      updatedDataTable[index].saleDetailPriceFixed =
        selectedProductService.productPriceFixed ??
        selectedProductService.servicePriceFixed ??
        true;
      setDataTable(updatedDataTable);
      const newTotal = updatedDataTable.reduce(
        (sum, item) => sum + Number(item.saleDetailTotal),
        0,
      );
      setTotal(newTotal);
    }
  };

  const handleAmountStep = (index, direction) => {
    const rows = [...dataTable];
    const current = Number(rows[index].saleDetailAmount);
    const next = Math.max(1, current + direction);
    rows[index].saleDetailAmount = next;
    rows[index].saleDetailTotal = Number(rows[index].saleDetailPrice) * next;
    setDataTable(rows);
    const newTotal = rows.reduce(
      (sum, item) => sum + Number(item.saleDetailTotal),
      0,
    );
    setTotal(newTotal);
  };

  // ── Customer handlers ───────────────────────────────
  const handleChangeCustomerSelect = (customerId) => {
    setDataSale((prev) => ({ ...prev, saleCustomerId: customerId }));
    setIsCustomerDropdownOpen(false);
    setCustomerSearch("");
  };

  const handleCreated = async (customerCreatedId) => {
    const updatedCustomers = await searchCustomers();
    setCustomers(updatedCustomers);
    setTimeout(() => {
      handleChangeCustomerSelect(customerCreatedId);
    }, 150);
  };

  // ── Payment handlers ────────────────────────────────
  const handlePayments = useCallback((paymentsArr) => {
    setDataSalePayments(paymentsArr);
    const pTotal = paymentsArr.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );
    setTotalPayments(pTotal);
  }, []);

  // Sincroniza totales en el payload de venta solo cuando cambian.
  useEffect(() => {
    setDataSale((prev) => {
      if (prev.saleTotal === total && prev.saleTotalPayments === totalPayments) {
        return prev;
      }
      return {
        ...prev,
        saleTotal: total,
        saleTotalPayments: totalPayments,
      };
    });
  }, [totalPayments, total]);

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isQuotationMode && isSalesBlocked) {
      toast.error("Operación bloqueada", closureBlock?.message ?? "No se pueden registrar ventas en este momento.");
      return;
    }
    if (!dataSale.saleCustomerId) {
      toast.info(
        'Cliente requerido',
        'Por favor selecciona un cliente para continuar.',
      );
      return;
    }
    if (dataTable.length < 1) {
      toast.info(
        isQuotationMode ? 'Sin productos' : 'Sin productos',
        'Debes agregar al menos un producto o servicio.',
      );
      return;
    }
    for (const data of dataTable) {
      if (!data.saleDetailProductServiceId && data.saleDetailAmount > 0) {
        toast.info(
          'Producto incompleto',
          'Hay filas sin producto seleccionado.',
        );
        return;
      }
      if (data.saleDetailProductServiceId && data.saleDetailAmount < 1) {
        toast.info(
          'Cantidad inválida',
          'La cantidad debe ser al menos 1.',
        );
        return;
      }
    }

    if (!isQuotationMode) {
      const stockErrors = validateSaleStockLines(dataTable, productsServices);
      if (stockErrors.length > 0) {
        toast.error(
          'Stock insuficiente',
          formatSaleStockErrors(stockErrors),
        );
        return;
      }

      if (amountDue > 0 && !creditSalesEnabled) {
        toast.error(
          "Pago incompleto",
          "Este negocio no permite ventas a crédito. El total abonado debe igualar el total de la venta.",
        );
        return;
      }

      const paymentValidation = validateSalePaymentsForCreditPolicy({
        creditSalesEnabled,
        total,
        payments: dataSalePayments,
        totalPayments,
      });
      if (!paymentValidation.isValid) {
        toast.error(paymentValidation.title, paymentValidation.message);
        return;
      }
    }

    const customerLabel = selectedCustomer
      ? `${selectedCustomer.customerFirstName} ${selectedCustomer.customerLastName}`
      : '—';

    const isConfirmed = await confirm({
      title: isQuotationMode ? '¿Generar cotización?' : '¿Confirmar venta?',
      message: `Cliente: ${customerLabel}. Items: ${dataTable.length}. Total: ${formatCurrency(total)}.`,
      variant: 'success',
      confirmText: isQuotationMode ? 'Generar cotización' : 'Confirmar venta',
      cancelText: 'Cancelar',
    });

    if (!isConfirmed) return;

    if (!isQuotationMode && documentType === "FACTURA") {
      const required = ["businessName", "rut", "businessActivity", "address", "commune", "city", "email"];
      const missing = required.filter((key) => !String(facturaReceiver[key] ?? "").trim());
      if (missing.length) {
        toast.info("Factura incompleta", "Completa los datos del receptor para factura electrónica.");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isQuotationMode) {
        const quotationPayload = {
          quotationId,
          quotationCustomerId: dataSale.saleCustomerId,
          quotationTotal: total,
          quotationComment: dataSale.saleComment || "",
        };
        const res = await createQuotationGeneral(
          quotationPayload,
          dataTable,
          { sendByEmail: sendByEmail && customerHasEmail },
        );
        if (res) {
          const sentEmail = Boolean(res.emailResult?.sent);
          if (res.emailError) {
            toast.info(
              `Cotización #${res.dataQuotation.quotationNumber}`,
              res.emailError.message || "La cotización se guardó, pero no se pudo enviar el correo.",
            );
          } else {
            toast.success(
              `Cotización #${res.dataQuotation.quotationNumber}`,
              sentEmail
                ? `La cotización se registró y se envió a ${selectedCustomer?.customerEmail}.`
                : "La cotización se registró correctamente.",
            );
          }
          navigate(`/quotations/view/${quotationId}`);
        }
        return;
      }

      const salePayload = {
        ...dataSale,
        documentType,
      };
      const hasProducts = dataTable.some(
        (row) => row.saleDetailType === "PRODUCT" && row.saleDetailProductServiceId,
      );
      if (deliveryControlEnabled && hasProducts) {
        salePayload.saleDeliveryStatus = "PENDING";
      }
      const res = await createSaleGeneral(
        salePayload,
        dataTable,
        dataSalePayments,
        { sendByEmail: sendByEmail && customerHasEmail },
      );
      if (res) {
        if (documentType === "BOLETA" || documentType === "FACTURA") {
          try {
            const issueRes = await issueTaxDocumentRequest({
              saleId: res.dataSale.saleId,
              documentType,
              receiver:
                documentType === "FACTURA"
                  ? facturaReceiver
                  : {
                        rut: selectedCustomer?.customerDocumentNumber,
                        name: customerLabel,
                        email: selectedCustomer?.customerEmail,
                    },
            });
            const folio = issueRes.data?.document?.folio;
            let emailNote = "";
            if (sendByEmail && customerHasEmail) {
              if (res.emailResult?.sent) {
                emailNote = ` Correo enviado a ${selectedCustomer?.customerEmail}.`;
              } else if (res.emailError) {
                emailNote = ` ${res.emailError.message || "No se pudo enviar el correo."}`;
              }
            }
            toast.success(
              `Venta #${res.dataSale.saleNumber}`,
              (folio
                ? `DTE emitido. Folio ${folio}.`
                : "Venta registrada y DTE en proceso.") + emailNote,
            );
            await tryOpenSaleWhatsAppShare(res.dataSale.saleId, res.dataSale.saleNumber);
          } catch (dteError) {
            toast.error(
              "DTE no emitido",
              dteError.response?.data?.error ??
                "La venta se guardó, pero falló la emisión electrónica.",
            );
          }
        } else {
          const sentEmail = Boolean(res.emailResult?.sent);
          if (res.emailError) {
            toast.info(
              `Venta #${res.dataSale.saleNumber}`,
              res.emailError.message || "La venta se guardó, pero no se pudo enviar el correo.",
            );
          } else {
            toast.success(
              `Venta #${res.dataSale.saleNumber}`,
              sentEmail
                ? `La venta se registró y se envió a ${selectedCustomer?.customerEmail}.`
                : "La venta se registró correctamente.",
            );
          }
          await tryOpenSaleWhatsAppShare(res.dataSale.saleId, res.dataSale.saleNumber);
        }
        const newId = uuidv4();
        setSaleId(newId);
        setQuotationId(uuidv4());
        setDataSale({
          saleId: newId,
          saleComment: "",
          saleCustomerId: null,
          saleTotal: 0,
          saleTotalPayments: 0,
        });
        setDataTable([createEmptyRow()]);
        setTotal(0);
        setTotalPayments(0);
        setDataSalePayments([]);
        setDocumentType("RECEIPT");
        setSendByEmail(false);
        setSendByWhatsApp(false);
        setFacturaReceiver({
          businessName: "",
          rut: "",
          businessActivity: "",
          address: "",
          commune: "",
          city: "",
          email: "",
        });
      }
    } catch (error) {
      console.error(isQuotationMode ? "Error creating quotation:" : "Error creating sale:", error);
      const apiError = error.response?.data;
      if (!isQuotationMode && (apiError?.error === "BLOQUEO_CIERRE_PENDIENTE" || apiError?.error === "DAY_CLOSED")) {
        applyClosureStatus({
          blocked: true,
          error: apiError.error,
          fechaPendiente: apiError.fechaPendiente,
          message: apiError.message,
        });
        toast.error("Operación bloqueada", apiError.message);
        return;
      }
      if (!isQuotationMode && (apiError?.code === "INSUFFICIENT_STOCK" || error.code === "INSUFFICIENT_STOCK")) {
        toast.error("Stock insuficiente", apiError?.message || error.message || "No hay unidades disponibles.");
        return;
      }
      toast.error(
        'Error',
        isQuotationMode
          ? (error.response?.status === 404
              ? 'El servidor aún no tiene activo el módulo de cotizaciones. Espera unos minutos al despliegue del backend o contacta soporte.'
              : (apiError?.message || 'No se pudo registrar la cotización. Inténtalo de nuevo.'))
          : 'No se pudo registrar la venta. Inténtalo de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────
  if (isDataLoading) {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col w-full h-[calc(100dvh-3.5rem)] md:h-dvh items-center justify-center bg-surface"
      >
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Cargando datos...</p>
        </div>
      </Motion.div>
    );
  }

  // ── Paid percentage for visual indicator ─────────────
  const paidPercentage =
    total > 0 ? Math.min(100, Math.round((totalPayments / total) * 100)) : 0;

  const itemCount = dataTable.filter((d) => d.saleDetailProductServiceId).length;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col w-full h-[calc(100dvh-3.5rem)] md:h-dvh bg-surface md:pb-0"
    >
        {/* Header plano */}
        <Motion.div className={FLAT_PAGE_HEADER}>
          <div className="md:hidden px-3 py-2 flex items-center gap-2 border-b border-gray-100">
            <Link
              to="/sales"
              className={`${FLAT_TAP_TARGET} -ml-1 text-gray-500 rounded-md`}
              title="Volver"
              aria-label="Volver a ventas"
            >
              <FaChevronLeft className="text-sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-dark leading-tight">Nueva Venta</h1>
              <p className="text-[11px] text-gray-400">{todayDate}</p>
            </div>
          </div>

          <div className="hidden md:block px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  to="/sales"
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors shrink-0"
                  title="Volver a Ventas"
                >
                  <FaChevronLeft className="text-sm" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-dark">Nueva Venta</h1>
                  <p className="text-[11px] text-gray-400">
                    Registra productos, servicios y comprobante
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={FLAT_META_TEXT}>
                  <FaCalendarAlt className="text-primary" /> {todayDate}
                </span>
                <span className={FLAT_META_TEXT}>
                  <FaUserTie className="text-secondary" />
                  {formatName(user?.userFirstName)} {formatName(user?.userLastName)}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:px-4 md:py-2 md:items-end">
            <div className="col-span-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Comprobante
              </p>
              <ReceiptTypeSelector
                variant="compact"
                value={documentType}
                onChange={setDocumentType}
                disabled={isLoading}
              />
            </div>
            <div className="col-span-8">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Cliente
              </p>
              <RegisterCustomerBar
                selectedCustomer={selectedCustomer}
                selectedCustomerId={dataSale.saleCustomerId}
                customerSearch={customerSearch}
                isDropdownOpen={isCustomerDropdownOpen}
                onSearchChange={(value) => {
                  setCustomerSearch(value);
                  setIsCustomerDropdownOpen(true);
                }}
                onOpenDropdown={() => setIsCustomerDropdownOpen(true)}
                onCloseDropdown={() => setIsCustomerDropdownOpen(false)}
                onSelectCustomer={handleChangeCustomerSelect}
                onClearCustomer={() =>
                  setDataSale((prev) => ({ ...prev, saleCustomerId: null }))
                }
                filteredCustomers={filteredCustomers}
                onCustomerCreated={handleCreated}
                disabled={blockSalesRegistration}
                isActive={isDesktopLayout}
                viewCustomerHref={
                  dataSale.saleCustomerId
                    ? `/customers/${dataSale.saleCustomerId}`
                    : null
                }
              />
            </div>
          </div>

          {documentType === "FACTURA" && (
            <div className="hidden md:block px-4 py-2 border-t border-gray-100">
              <FacturaReceiverForm
                value={facturaReceiver}
                onChange={setFacturaReceiver}
                disabled={isLoading || blockSalesRegistration}
              />
            </div>
          )}
        </Motion.div>

        {/* Banner de bloqueo por cierre pendiente o día cerrado */}
        <AnimatePresence>
          {isSalesBlocked && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex-none mx-3 md:mx-6 mt-3 md:mt-4 rounded-lg md:rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-5">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-100 flex items-center justify-center">
                    <FaExclamationTriangle className="text-amber-600 text-base md:text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm md:text-base font-bold text-gray-900">
                      Operación bloqueada
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">
                      {closureBlock?.error === "DAY_CLOSED" ? (
                        closureBlock.message
                      ) : (
                        <>
                          Se requiere el cierre diario del día{" "}
                          <span className="font-semibold text-gray-800">
                            {formatPendingClosureDate(closureBlock?.fechaPendiente)}
                          </span>{" "}
                          antes de registrar nuevas ventas.
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {closureBlock?.error === "BLOQUEO_CIERRE_PENDIENTE" && (
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCloseAllPending}
                      disabled={closingAllPending}
                      className={PRIMARY_BTN}
                    >
                      <FaLock />
                      {closingAllPending
                        ? 'Cerrando...'
                        : `Cerrar todos (${closureBlock?.fechasPendientes?.length ?? 1})`}
                    </button>
                    <Link
                      to="/sales/dailySales"
                      className={`${PRIMARY_BTN} justify-center bg-white !text-primary border border-primary hover:bg-primary/5`}
                    >
                      Ir a Cierres
                    </Link>
                  </div>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        <div
          className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-opacity ${
            blockSalesRegistration ? "pointer-events-none opacity-45 select-none" : ""
          }`}
        >

        {/* Items — tarjetas móvil / tabla desktop */}
        <div className="flex-1 min-h-0 overflow-y-auto w-full scroll-pb-36 md:scroll-pb-0">
          {/* Móvil — layout plano */}
          <div className={FLAT_MOBILE_SCROLL}>
            <FormFlatSection title="Cliente">
              <RegisterCustomerBar
                selectedCustomer={selectedCustomer}
                selectedCustomerId={dataSale.saleCustomerId}
                customerSearch={customerSearch}
                isDropdownOpen={isCustomerDropdownOpen}
                onSearchChange={(value) => {
                  setCustomerSearch(value);
                  setIsCustomerDropdownOpen(true);
                }}
                onOpenDropdown={() => setIsCustomerDropdownOpen(true)}
                onCloseDropdown={() => setIsCustomerDropdownOpen(false)}
                onSelectCustomer={handleChangeCustomerSelect}
                onClearCustomer={() =>
                  setDataSale((prev) => ({ ...prev, saleCustomerId: null }))
                }
                filteredCustomers={filteredCustomers}
                onCustomerCreated={handleCreated}
                disabled={blockSalesRegistration}
                isActive={!isDesktopLayout}
                viewCustomerHref={
                  dataSale.saleCustomerId
                    ? `/customers/${dataSale.saleCustomerId}`
                    : null
                }
              />
            </FormFlatSection>

            <FormFlatSection title="Comprobante">
              <ReceiptTypeSelector
                variant="compact"
                value={documentType}
                onChange={setDocumentType}
                disabled={isLoading}
              />
            </FormFlatSection>

            {documentType === "FACTURA" && (
              <FormFlatSection title="Datos del receptor">
                <FacturaReceiverForm
                  value={facturaReceiver}
                  onChange={setFacturaReceiver}
                  disabled={isLoading || blockSalesRegistration}
                />
              </FormFlatSection>
            )}

            <FormFlatSection
              title="Productos"
              subtitle={formatRecordCount(itemCount)}
              actions={
                <button
                  type="button"
                  onClick={newRow}
                  className={`${PRIMARY_BTN} !h-8 !px-3 !py-1 !text-xs`}
                  disabled={blockSalesRegistration}
                >
                  <FaPlus className="text-[10px]" /> Agregar
                </button>
              }
            >
              {dataTable.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Sin productos — toca Agregar
                </p>
              ) : (
                dataTable.map((d, index) => (
                  <SaleLineItemMobileCard
                    key={d.saleDetailId}
                    row={d}
                    index={index}
                    productsServices={productsServices}
                    onSelectProduct={handleChangeSelect}
                    onAmountStep={handleAmountStep}
                    onAmountInput={handleOnInput}
                    onPriceInput={handleOnInput}
                    onDelete={() => handleDeleteRow(d.saleDetailId)}
                  />
                ))
              )}
            </FormFlatSection>

            {!isQuotationMode && (
              <FormFlatSection title="Métodos de pago">
                {!creditSalesEnabled && total > 0 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1.5 mb-2 rounded-sm">
                    Pago completo requerido: {formatCurrency(total)}
                  </p>
                )}
                <CardRegisterPayments
                  sendPayments={handlePayments}
                  requireFullPayment={requireFullPayment}
                  saleTotal={total}
                  mobile
                />
                {total > 0 && (
                  <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-gray-100">
                    <span className="text-primary font-medium">Abonado: {formatCurrency(totalPayments)}</span>
                    <span className={`font-semibold ${amountDue > 0 ? "text-red-500" : "text-gray-400"}`}>
                      Saldo: {formatCurrency(amountDue)}
                    </span>
                  </div>
                )}
              </FormFlatSection>
            )}

            {isQuotationMode && (
              <p className="text-[11px] text-gray-500 py-2 border-b border-gray-200">
                Las cotizaciones no registran venta ni pagos.
              </p>
            )}

            <FormFlatSection title="Envío al cliente">
              <SendDocumentEmailOption
                checked={sendByEmail}
                onChange={setSendByEmail}
                customerEmail={selectedCustomer?.customerEmail}
                disabled={isLoading || blockSalesRegistration}
              />
              <SendDocumentWhatsAppOption
                checked={sendByWhatsApp}
                onChange={setSendByWhatsApp}
                customerCodePhoneNumber={selectedCustomer?.customerCodePhoneNumber}
                customerPhone={selectedCustomer?.customerPhoneNumber}
                disabled={isLoading || blockSalesRegistration || isQuotationMode}
              />
            </FormFlatSection>

            <FormFlatSection title="Comentarios" bordered={false}>
              <textarea
                className={`${FLAT_INPUT} resize-none w-full min-h-[72px] !h-auto py-2`}
                placeholder="Notas sobre la venta..."
                value={dataSale.saleComment || ""}
                onChange={(e) =>
                  setDataSale((prev) => ({ ...prev, saleComment: e.target.value }))
                }
              />
            </FormFlatSection>
          </div>

          {/* Desktop */}
          <div className={`hidden md:block ${TABLE_WRAPPER_FULL}`}>
            <div className={TABLE_TOOLBAR}>
              <div>
                <h2 className={TABLE_SECTION_TITLE}>Productos y Servicios</h2>
                <p className={TABLE_SECTION_SUB}>
                  {formatRecordCount(itemCount)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className={`${THEAD} sticky top-0 z-10`}>
                  <tr>
                    <th className={`${TH} text-center w-10`}>#</th>
                    <th className={`${TH} text-center w-20`}>Tipo</th>
                    <th className={`${TH} w-24`}>SKU</th>
                    <th className={TH}>Producto / Servicio</th>
                    <th className={`${TH} text-center w-28`}>Cant.</th>
                    <th className={`${TH} text-end w-28`}>Precio</th>
                    <th className={`${TH} text-end w-28`}>Total</th>
                    <th className={`${TH} text-center w-12`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={TBODY}>
                  <AnimatePresence initial={false}>
                    {dataTable.map((d, index) => (
                      <Motion.tr
                        key={d.saleDetailId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={TR_ROW}
                      >
                        <td className={`${TD_MUTED} text-center font-mono`}>
                          {index + 1}
                        </td>

                        {/* Type badge */}
                        <td className={`${TD} text-center`}>
                          {d.saleDetailType === "PRODUCT" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                              <FaBoxOpen className="text-[8px]" /> PROD
                            </span>
                          )}
                          {d.saleDetailType === "SERVICE" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                              SERV
                            </span>
                          )}
                        </td>

                        {/* SKU */}
                        <td className={TD}>
                          <span className="text-xs font-mono text-gray-400">
                            {d.saleDetailSKU || "—"}
                          </span>
                        </td>

                        {/* Product select */}
                        <td className={TD}>
                          <select
                            className={`${TABLE_INPUT} font-medium`}
                            onChange={(e) => handleChangeSelect(e, index)}
                            value={d.saleDetailProductServiceId || ""}
                          >
                            <option value="">
                              Seleccionar producto o servicio...
                            </option>
                            <optgroup label="Productos">
                              {productsServices
                                .filter((p) => p.productId)
                                .map((p) => {
                                  const stock = Number(p.productStock ?? p.quantityOnHand ?? 0);
                                  return (
                                    <option key={p.productId} value={p.productId}>
                                      {p.productName} (Stock: {stock})
                                    </option>
                                  );
                                })}
                            </optgroup>
                            <optgroup label="Servicios">
                              {productsServices
                                .filter((p) => p.serviceId)
                                .map((p) => (
                                  <option key={p.serviceId} value={p.serviceId}>
                                    {p.serviceName}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                        </td>

                        {/* Quantity with stepper */}
                        <td className={TD}>
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => handleAmountStep(index, -1)}
                              className="w-8 h-10 flex items-center justify-center rounded-l-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors text-xs"
                              disabled={d.saleDetailAmount <= 1}
                            >
                              <FaMinus className="text-[8px]" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              className="input-field h-10 w-12 rounded-none border-x-0 text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={d.saleDetailAmount}
                              onInput={(e) =>
                                handleOnInput(
                                  index,
                                  "saleDetailAmount",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              onClick={() => handleAmountStep(index, 1)}
                              className="w-8 h-10 flex items-center justify-center rounded-r-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors text-xs"
                            >
                              <FaPlus className="text-[8px]" />
                            </button>
                          </div>
                        </td>

                        {/* Price */}
                        <td className={TD}>
                          <input
                            type="number"
                            className={`${TABLE_INPUT} text-end font-mono ${d.saleDetailPriceFixed ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-800"}`}
                            value={d.saleDetailPrice}
                            onInput={(e) =>
                              handleOnInput(
                                index,
                                "saleDetailPrice",
                                e.target.value,
                              )
                            }
                            disabled={d.saleDetailPriceFixed}
                          />
                        </td>

                        {/* Row total */}
                        <td className={TD_AMOUNT}>
                          <span className="font-mono">
                            {formatCurrency(d.saleDetailTotal)}
                          </span>
                        </td>

                        <td className={TD}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className={ACTION_DELETE}
                              onClick={() => handleDeleteRow(d.saleDetailId)}
                              title="Eliminar fila"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </Motion.tr>
                    ))}
                  </AnimatePresence>

                  {/* Empty state */}
                  {dataTable.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                          <FaBoxOpen className="text-4xl text-gray-300" />
                          <p className="text-sm font-medium">
                            No hay productos agregados
                          </p>
                          <p className="text-xs">
                            Agrega productos o servicios a esta venta
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50/40 hidden md:block">
              <button type="button" onClick={newRow} className={`${PRIMARY_BTN} w-full justify-center !py-1.5 !text-xs`} disabled={blockSalesRegistration}>
                <FaPlus /> Agregar ítem
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER — scroll en móvil; desktop igual que antes */}
        <div className="hidden md:block bg-white border-t border-gray-200 flex-none z-20 w-full shrink-0">
          <div className="w-full flex flex-col lg:flex-row">
            <div className="lg:w-1/3 p-3 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
              <h2 className={TABLE_SECTION_TITLE}>Comentarios</h2>
              <textarea
                className={`${TABLE_INPUT} resize-none flex-1 min-h-[56px] mt-1.5`}
                placeholder="Notas adicionales sobre la venta..."
                value={dataSale.saleComment || ""}
                onChange={(e) =>
                  setDataSale((prev) => ({
                    ...prev,
                    saleComment: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex-1 p-3 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-[80px]">
              {isQuotationMode ? (
                <>
                  <h2 className={TABLE_SECTION_TITLE}>Cotización</h2>
                  <p className={`${TABLE_SECTION_SUB} mb-3`}>
                    No se registran pagos. El documento se guardará como cotización.
                  </p>
                </>
              ) : (
                <>
              <h2 className={TABLE_SECTION_TITLE}>Métodos de Pago</h2>
              <p className={`${TABLE_SECTION_SUB} mb-3`}>Registre los pagos de esta venta</p>
              {!creditSalesEnabled && total > 0 && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  Venta a crédito desactivada: selecciona un método de pago. El monto se fija automáticamente en {formatCurrency(total)}.
                </p>
              )}
              <div className="flex-1 overflow-hidden">
                <CardRegisterPayments
                  sendPayments={handlePayments}
                  requireFullPayment={requireFullPayment}
                  saleTotal={total}
                />
              </div>
                </>
              )}
            </div>

            {/* Right: Summary & Actions */}
            <div className="lg:w-[260px] p-3 bg-gray-50/50 flex flex-col justify-between gap-2">
              {/* Totals breakdown */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-gray-400 pb-1 border-b border-gray-100">
                  <span>{itemCount} ítem{itemCount !== 1 ? "s" : ""}</span>
                  {total > 0 && (
                    <span className={amountDue > 0 ? "text-red-500 font-medium" : ""}>
                      Saldo: {formatCurrency(amountDue)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Neto</span>
                  <span className="font-medium text-gray-700 font-mono">
                    {formatCurrency(netTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">IVA (19%)</span>
                  <span className="font-medium text-gray-700 font-mono">
                    {formatCurrency(ivaTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-700 font-semibold text-sm">
                    Total
                  </span>
                  <span className="text-xl font-extrabold text-gray-900 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Payment progress */}
                {!isQuotationMode && total > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <Motion.div
                        className={`h-full rounded-full ${paidPercentage >= 100 ? "bg-primary" : "bg-amber-400"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${paidPercentage}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-primary font-medium">
                          Abonado: {formatCurrency(totalPayments)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1 py-2 border-t border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-0.5">
                  Envío al cliente
                </p>
                <SendDocumentEmailOption
                checked={sendByEmail}
                onChange={setSendByEmail}
                customerEmail={selectedCustomer?.customerEmail}
                disabled={isLoading || blockSalesRegistration}
              />
              <SendDocumentWhatsAppOption
                checked={sendByWhatsApp}
                onChange={setSendByWhatsApp}
                customerCodePhoneNumber={selectedCustomer?.customerCodePhoneNumber}
                customerPhone={selectedCustomer?.customerPhoneNumber}
                disabled={isLoading || blockSalesRegistration || isQuotationMode}
              />

              <button
                type="button"
                onClick={handleSubmit}
                className={`${PRIMARY_BTN_BLOCK} py-3 disabled:active:scale-100`}
                disabled={isLoading || !canFinalizeSale}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>{submitActionLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Móvil: barra fija inferior tipo POS */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="px-3 pt-1.5">
            <SendDocumentEmailOption
              compact
              checked={sendByEmail}
              onChange={setSendByEmail}
              customerEmail={selectedCustomer?.customerEmail}
              disabled={isLoading || blockSalesRegistration}
            />
            <SendDocumentWhatsAppOption
              compact
              checked={sendByWhatsApp}
              onChange={setSendByWhatsApp}
              customerCodePhoneNumber={selectedCustomer?.customerCodePhoneNumber}
              customerPhone={selectedCustomer?.customerPhoneNumber}
              disabled={isLoading || blockSalesRegistration || isQuotationMode}
            />
          </div>
          {!isQuotationMode && total > 0 && (
            <div className="px-4">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <Motion.div
                  className={`h-full rounded-full ${paidPercentage >= 100 ? "bg-primary" : "bg-amber-400"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${paidPercentage}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
          <div className="px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase font-semibold text-gray-400 tracking-wide">
                {isQuotationMode ? "Total cotización" : "Total venta"}
              </p>
              <p className="text-2xl font-extrabold text-gray-900 font-mono leading-tight">
                {formatCurrency(total)}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {RECEIPT_SHORT_LABELS[documentType]}
                </span>
                <span>
                  {itemCount} ítem{itemCount !== 1 ? "s" : ""}
                </span>
                {amountDue > 0 && !isQuotationMode && (
                  <span className="text-red-500 font-semibold">
                    Saldo {formatCurrency(amountDue)}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className={`${PRIMARY_BTN} min-h-12 px-5 shrink-0 !text-sm font-bold touch-manipulation shadow-md`}
              disabled={isLoading || !canFinalizeSale}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="sr-only sm:not-sr-only">Procesando...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>{isQuotationMode ? "Generar" : "Finalizar"}</span>
                </>
              )}
            </button>
          </div>
        </div>
    </Motion.div>
  );
}
