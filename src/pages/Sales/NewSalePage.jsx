import { getCustomers } from "../../api/customers.js";
import { getProductsAndServices } from "../../libs/productsAndServices.js";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import CardRegisterPayments from "../../components/paymennts/CardRegisterPayments.jsx";
import NewCustomerModal from "../../components/modals/AddCustomerModal.jsx";
import formatName from "../../utils/formatName.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { createSaleGeneral } from "../../utils/createSale.js";
import { v4 as uuidv4 } from "uuid";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaUserPlus,
  FaCalendarAlt,
  FaUserTie,
  FaSave,
  FaSearch,
  FaBoxOpen,
  FaChevronLeft,
  FaMinus,
  FaTimes,
  FaReceipt,
  FaMoneyBillWave,
  FaListUl,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";

import { getClosureStatus, closeAllPendingClosures } from "../../api/dailySales.js";
import {
  PRIMARY_BTN,
  PRIMARY_BTN_BLOCK,
  KPI_CARD,
  KPI_ICON_PRIMARY,
  KPI_ICON_SECONDARY,
  KPI_ICON_AMBER,
  KPI_LABEL,
  KPI_VALUE,
  TABLE_WRAPPER_FULL,
  TABLE_TOOLBAR,
  TABLE_SEARCH,
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
  PAGE_HEADER_CARD,
  containerVariants,
  itemVariants,
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

export default function NewSalePage() {
  const toast = useToast();
  const confirm = useConfirm();
  /** { blocked, error, fechaPendiente, fechasPendientes, message } | null */
  const [closureBlock, setClosureBlock] = useState(null);
  const [closingAllPending, setClosingAllPending] = useState(false);
  const [saleId, setSaleId] = useState(uuidv4());
  const { user } = useAuth();

  // Data
  const [customers, setCustomers] = useState([]);
  const [productsServices, setProductsServices] = useState([]);
  const [dataTable, setDataTable] = useState([createEmptyRow()]);
  const [dataSalePayments, setDataSalePayments] = useState([]);

  // Totals
  const [total, setTotal] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [amountDue, setAmountDue] = useState(0);

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
  const customerDropdownRef = useRef(null);

  const isSalesBlocked = closureBlock?.blocked === true;

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
    () => customers.find((c) => c.customerId === dataSale.saleCustomerId),
    [customers, dataSale.saleCustomerId],
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
          c.customerDocumentNumber.toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  // ── Close dropdown on click outside ─────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Data loaders ────────────────────────────────────
  const searchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const searchProductsServices = async () => {
    try {
      const res = await getProductsAndServices();
      setProductsServices(res);
      return res;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      await Promise.all([
        searchCustomers(),
        searchProductsServices(),
        checkSalesClosureStatus(),
      ]);
      setIsDataLoading(false);
    };
    loadData();
  }, []);

  const checkSalesClosureStatus = async () => {
    try {
      const res = await getClosureStatus();
      applyClosureStatus(res.data);
      if (res.data?.blocked) {
        if (res.data.error === "DAY_CLOSED") {
          toast.info("Día cerrado", res.data.message);
        } else {
          toast.error("Operación bloqueada", res.data.message);
        }
      }
    } catch (error) {
      console.error("Error verificando cierre diario:", error);
    }
  };

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
  const handlePayments = (paymentsArr) => {
    setDataSalePayments(paymentsArr);
    const pTotal = paymentsArr.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );
    setTotalPayments(pTotal);
  };

  // Recalculate amountDue whenever total or totalPayments change
  useEffect(() => {
    const due = total - totalPayments;
    setAmountDue(due);
    setDataSale((prev) => ({
      ...prev,
      saleTotal: total,
      saleTotalPayments: totalPayments,
    }));
  }, [totalPayments, total]);

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSalesBlocked) {
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
        'Sin productos',
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

    const customerLabel = selectedCustomer
      ? `${selectedCustomer.customerFirstName} ${selectedCustomer.customerLastName}`
      : '—';

    const isConfirmed = await confirm({
      title: '¿Confirmar venta?',
      message: `Cliente: ${customerLabel}. Items: ${dataTable.length}. Total: ${formatCurrency(total)}.`,
      variant: 'success',
      confirmText: 'Confirmar venta',
      cancelText: 'Cancelar',
    });

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const res = await createSaleGeneral(
        dataSale,
        dataTable,
        dataSalePayments,
      );
      if (res) {
        toast.success(
          `Venta #${res.dataSale.saleNumber}`,
          'La venta se registró correctamente.',
        );
        // Reset
        const newId = uuidv4();
        setSaleId(newId);
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
        setAmountDue(0);
        setDataSalePayments([]);
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      const apiError = error.response?.data;
      if (apiError?.error === "BLOQUEO_CIERRE_PENDIENTE" || apiError?.error === "DAY_CLOSED") {
        applyClosureStatus({
          blocked: true,
          error: apiError.error,
          fechaPendiente: apiError.fechaPendiente,
          message: apiError.message,
        });
        toast.error("Operación bloqueada", apiError.message);
        return;
      }
      toast.error(
        'Error',
        'No se pudo registrar la venta. Inténtalo de nuevo.',
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
        className="flex flex-col w-full min-h-[calc(100dvh-3.5rem)] md:min-h-dvh items-center justify-center bg-surface"
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full min-h-[calc(100dvh-3.5rem)] md:min-h-dvh bg-surface overflow-hidden"
    >
        {/* Header — PageHeader / Expenses (full-bleed) */}
        <Motion.div
          variants={itemVariants}
          className={`${PAGE_HEADER_CARD} flex-none !rounded-none border-x-0 border-t-0 shadow-sm w-full flex-col gap-4`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <a
                href="/sales"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver a Ventas"
              >
                <FaChevronLeft className="text-sm" />
              </a>
              <div>
                <h1 className="page-title">Nueva Venta</h1>
                <p className="page-subtitle">
                  Registra una nueva venta con productos y servicios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <FaCalendarAlt className="text-primary text-xs" />
                <span className="text-xs font-semibold text-gray-700">{todayDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <FaUserTie className="text-secondary text-xs" />
                <span className="text-xs font-medium text-gray-600">
                  {formatName(user?.userFirstName)} {formatName(user?.userLastName)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
              <div
                ref={customerDropdownRef}
                className="flex-1 relative"
              >
                {/* Selected customer display OR search input */}
                {selectedCustomer && !isCustomerDropdownOpen ? (
                  <div
                    className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 h-11 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setIsCustomerDropdownOpen(true)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedCustomer.customerFirstName
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {selectedCustomer.customerFirstName}{" "}
                        {selectedCustomer.customerLastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedCustomer.customerDocumentNumber ||
                          "Sin documento"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDataSale((prev) => ({
                          ...prev,
                          saleCustomerId: null,
                        }));
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Cambiar cliente"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      type="text"
                      className={TABLE_SEARCH}
                      placeholder="Buscar cliente por nombre o documento..."
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      autoComplete="off"
                    />
                  </div>
                )}

                {/* Dropdown list */}
                <AnimatePresence>
                  {isCustomerDropdownOpen && (
                    <Motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                    >
                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                          No se encontraron clientes
                        </div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.customerId}
                            className={`w-full flex items-center gap-3 px-4 h-10 text-left hover:bg-primary/5 transition-colors text-sm ${c.customerId === dataSale.saleCustomerId ? "bg-primary/10" : ""}`}
                            onClick={() =>
                              handleChangeCustomerSelect(c.customerId)
                            }
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                              {c.customerFirstName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {c.customerFirstName} {c.customerLastName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {c.customerDocumentNumber || "—"}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Customer button */}
              <NewCustomerModal
                trigger={
                  <button type="button" className={PRIMARY_BTN} title="Registrar Cliente" disabled={isSalesBlocked}>
                    <FaUserPlus className="text-sm" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                }
                title={"Registrar Cliente"}
                onCreated={handleCreated}
              />

              {dataSale.saleCustomerId && (
                <a
                  href={`/customers/${dataSale.saleCustomerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 text-secondary hover:bg-secondary/10 rounded-lg transition-colors border border-slate-200"
                  title="Ver Ficha Cliente"
                >
                  <FaSearch className="text-xs" />
                </a>
              )}
            </div>
        </Motion.div>

        {/* Banner de bloqueo por cierre pendiente o día cerrado */}
        <AnimatePresence>
          {isSalesBlocked && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex-none mx-4 md:mx-6 mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FaExclamationTriangle className="text-amber-600 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-gray-900">
                      Operación bloqueada
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
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
            isSalesBlocked ? "pointer-events-none opacity-45 select-none" : ""
          }`}
        >

        {/* KPI Cards — ExpensesPage */}
        <Motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-4 border-b border-gray-200 bg-surface flex-none"
        >
          <div className={KPI_CARD}>
            <div className={KPI_ICON_PRIMARY}>
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div>
              <p className={KPI_LABEL}>Total venta</p>
              <p className={KPI_VALUE}>{formatCurrency(total)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_SECONDARY}>
              <FaListUl className="text-xl" />
            </div>
            <div>
              <p className={KPI_LABEL}>Items agregados</p>
              <p className={KPI_VALUE}>{itemCount}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_AMBER}>
              <FaReceipt className="text-xl" />
            </div>
            <div>
              <p className={KPI_LABEL}>Saldo pendiente</p>
              <p className={KPI_VALUE}>{formatCurrency(amountDue)}</p>
            </div>
          </div>
        </Motion.div>

        {/* Tabla de productos — patrón ExpensesPage */}
        <div className="flex-1 overflow-y-auto w-full">
          <Motion.div
            variants={itemVariants}
            className={TABLE_WRAPPER_FULL}
          >
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
                                .map((p) => (
                                  <option key={p.productId} value={p.productId}>
                                    {p.productName}
                                  </option>
                                ))}
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

            {/* Add Row Button */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button type="button" onClick={newRow} className={PRIMARY_BTN_BLOCK} disabled={isSalesBlocked}>
                <FaPlus /> Agregar Item
              </button>
            </div>
          </Motion.div>
        </div>

        {/* ═══════════════════════════════════════════
                    3. FOOTER — Comments, Payments, Summary
                   ═══════════════════════════════════════════ */}
        <Motion.div
          variants={itemVariants}
          className="bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(2,31,65,0.05)] flex-none z-20 w-full"
        >
          <div className="w-full flex flex-col lg:flex-row">
            <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
              <h2 className={TABLE_SECTION_TITLE}>Comentarios</h2>
              <p className={`${TABLE_SECTION_SUB} mb-3`}>Notas adicionales sobre la venta</p>
              <textarea
                className={`${TABLE_INPUT} resize-none flex-1 min-h-[72px]`}
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

            <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col min-h-[120px]">
              <h2 className={TABLE_SECTION_TITLE}>Métodos de Pago</h2>
              <p className={`${TABLE_SECTION_SUB} mb-3`}>Registre los pagos de esta venta</p>
              <div className="flex-1 overflow-hidden">
                <CardRegisterPayments sendPayments={handlePayments} />
              </div>
            </div>

            {/* Right: Summary & Actions */}
            <div className="lg:w-[280px] p-6 bg-gray-50/80 flex flex-col justify-between gap-3">
              {/* Totals breakdown */}
              <div className="space-y-1.5">
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
                {total > 0 && (
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
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span
                          className={`font-semibold ${amountDue > 0 ? "text-red-500" : "text-gray-400"}`}
                        >
                          Saldo: {formatCurrency(amountDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className={`${PRIMARY_BTN_BLOCK} py-3 disabled:active:scale-100`}
                disabled={isLoading || isSalesBlocked}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Finalizar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Motion.div>
        </div>
    </Motion.div>
  );
}
