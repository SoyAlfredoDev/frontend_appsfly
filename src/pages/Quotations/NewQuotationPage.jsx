import { getCustomers } from "../../api/customers.js";
import { getProductsAndServices } from "../../libs/productsAndServices.js";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import formatName from "../../utils/formatName.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { createQuotationGeneral } from "../../utils/createQuotation.js";
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
} from "react-icons/fa";
import SendDocumentEmailOption from "../../components/sales/SendDocumentEmailOption.jsx";
import { useAbortEffect, isAbortError } from "../../hooks/useAbortEffect.js";
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

const IVA_RATE = 0.19;

export default function NewQuotationPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [quotationId, setQuotationId] = useState(uuidv4());
  const { user } = useAuth();

  // Data
  const [customers, setCustomers] = useState([]);
  const [productsServices, setProductsServices] = useState([]);
  const [dataTable, setDataTable] = useState([createEmptyRow()]);

  // Totals
  const [total, setTotal] = useState(0);

  // Quotation header
  const [dataQuotation, setDataQuotation] = useState({
    quotationId: quotationId,
    quotationComment: "",
    quotationCustomerId: null,
    quotationTotal: 0,
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [sendByEmail, setSendByEmail] = useState(false);

  const canFinalizeQuotation = total > 0;

  // Derived values
  const todayDate = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const netTotal = useMemo(() => Math.round(total / (1 + IVA_RATE)), [total]);
  const ivaTotal = useMemo(() => total - netTotal, [total, netTotal]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.customerId === dataQuotation.quotationCustomerId),
    [customers, dataQuotation.quotationCustomerId],
  );

  const customerHasEmail = Boolean(selectedCustomer?.customerEmail?.trim());

  useEffect(() => {
    if (!customerHasEmail) {
      setSendByEmail(false);
    }
  }, [customerHasEmail, dataQuotation.quotationCustomerId]);

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

  // Data loaders
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
      } catch (error) {
        if (!isAbortError(error)) console.error(error);
      } finally {
        if (!signal.aborted) setIsDataLoading(false);
      }
    };
    loadData();
  }, []);

  // Table handlers
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

  // Customer handlers
  const handleChangeCustomerSelect = (customerId) => {
    setDataQuotation((prev) => ({ ...prev, quotationCustomerId: customerId }));
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

  // Sync totals
  useEffect(() => {
    setDataQuotation((prev) => {
      if (prev.quotationTotal === total) {
        return prev;
      }
      return {
        ...prev,
        quotationTotal: total,
      };
    });
  }, [total]);

  // Submit
  const handleSubmit = async () => {
    if (!dataQuotation.quotationCustomerId) {
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
      title: '¿Confirmar cotización?',
      message: `Cliente: ${customerLabel}. Items: ${dataTable.length}. Total: ${formatCurrency(total)}.`,
      variant: 'success',
      confirmText: 'Confirmar cotización',
      cancelText: 'Cancelar',
    });

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const quotationPayload = {
        ...dataQuotation,
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
        // Reset state or navigate
        navigate("/quotations");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      const apiMessage = error.response?.data?.message;
      toast.error(
        'Error',
        apiMessage || 'No se pudo registrar la cotización. Inténtalo de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const itemCount = dataTable.filter((d) => d.saleDetailProductServiceId).length;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col w-full h-[calc(100dvh-3.5rem)] md:h-dvh bg-surface md:pb-0"
    >
      <Motion.div className={FLAT_PAGE_HEADER}>
        <div className="md:hidden px-3 py-2 flex items-center gap-2 border-b border-gray-100">
          <Link to="/quotations" className={`${FLAT_TAP_TARGET} -ml-1 text-gray-500 rounded-md`} title="Volver">
            <FaChevronLeft className="text-sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-dark">Nueva Cotización</h1>
            <p className="text-[11px] text-gray-400">{todayDate}</p>
          </div>
        </div>

        <div className="hidden md:block px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/quotations" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md shrink-0" title="Volver">
                <FaChevronLeft className="text-sm" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-dark">Nueva Cotización</h1>
                <p className="text-[11px] text-gray-400">Productos y servicios para el cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={FLAT_META_TEXT}><FaCalendarAlt className="text-primary" /> {todayDate}</span>
              <span className={FLAT_META_TEXT}>
                <FaUserTie className="text-secondary" />
                {formatName(user?.userFirstName)} {formatName(user?.userLastName)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 md:px-4 py-2 border-t border-gray-100 md:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1 md:hidden">Cliente</p>
          <RegisterCustomerBar
            selectedCustomer={selectedCustomer}
            selectedCustomerId={dataQuotation.quotationCustomerId}
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
              setDataQuotation((prev) => ({ ...prev, quotationCustomerId: null }))
            }
            filteredCustomers={filteredCustomers}
            onCustomerCreated={handleCreated}
          />
        </div>
      </Motion.div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Main List */}
        <div className="flex-1 min-h-0 overflow-y-auto w-full">
          <div className={FLAT_MOBILE_SCROLL}>
            <FormFlatSection
              title="Productos"
              subtitle={formatRecordCount(itemCount)}
              actions={
                <button type="button" onClick={newRow} className={`${PRIMARY_BTN} !h-8 !px-3 !py-1 !text-xs`}>
                  <FaPlus className="text-[10px]" /> Agregar
                </button>
              }
            >
              {dataTable.map((d, index) => (
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
              ))}
            </FormFlatSection>

            <FormFlatSection title="Envío al cliente">
              <SendDocumentEmailOption
                checked={sendByEmail}
                onChange={setSendByEmail}
                customerEmail={selectedCustomer?.customerEmail}
                disabled={isLoading}
              />
            </FormFlatSection>

            <FormFlatSection title="Comentarios" bordered={false}>
              <textarea
                className={`${FLAT_INPUT} resize-none w-full min-h-[72px] !h-auto py-2`}
                placeholder="Notas sobre la cotización..."
                value={dataQuotation.quotationComment || ""}
                onChange={(e) =>
                  setDataQuotation((prev) => ({ ...prev, quotationComment: e.target.value }))
                }
              />
            </FormFlatSection>
          </div>

          {/* Desktop view */}
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
                            Agrega productos o servicios a esta cotización
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3 py-2 border-t border-gray-200 hidden md:block">
              <button type="button" onClick={newRow} className={`${PRIMARY_BTN} w-full justify-center !py-1.5 !text-xs`}>
                <FaPlus /> Agregar ítem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer desktop */}
      <div className="hidden md:block bg-white border-t border-gray-200 flex-none z-20 w-full shrink-0">
        <div className="w-full flex flex-col lg:flex-row">
          <div className="flex-1 p-3 border-b lg:border-b-0 lg:border-r border-gray-200">
            <h2 className={TABLE_SECTION_TITLE}>Comentarios</h2>
            <textarea
              className={`${TABLE_INPUT} resize-none w-full min-h-[56px] mt-1.5`}
              placeholder="Notas y condiciones de la cotización..."
              value={dataQuotation.quotationComment || ""}
              onChange={(e) =>
                setDataQuotation((prev) => ({
                  ...prev,
                  quotationComment: e.target.value,
                }))
              }
            />
          </div>

          {/* Right Summary */}
          <div className="lg:w-[260px] p-3 bg-gray-50/50 flex flex-col justify-between gap-2">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-gray-400 pb-1 border-b border-gray-100">
                <span>{itemCount} ítem{itemCount !== 1 ? "s" : ""}</span>
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
            </div>

            <SendDocumentEmailOption
              checked={sendByEmail}
              onChange={setSendByEmail}
              customerEmail={selectedCustomer?.customerEmail}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleSubmit}
              className={`${PRIMARY_BTN_BLOCK} py-3`}
              disabled={isLoading || !canFinalizeQuotation}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Crear Cotización</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pos Footer bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="px-3 pt-1.5">
          <SendDocumentEmailOption
            compact
            checked={sendByEmail}
            onChange={setSendByEmail}
            customerEmail={selectedCustomer?.customerEmail}
            disabled={isLoading}
          />
        </div>
        <div className="px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-[10px] uppercase font-semibold text-gray-400">Total</p>
            <p className="text-base font-extrabold text-gray-900 font-mono">{formatCurrency(total)}</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className={`${PRIMARY_BTN} flex-1 justify-center !py-2.5 !text-sm`}
            disabled={isLoading || !canFinalizeQuotation}
          >
            {isLoading ? "Procesando..." : (<><FaSave /> Crear cotización</>)}
          </button>
        </div>
      </div>
    </Motion.div>
  );
}
