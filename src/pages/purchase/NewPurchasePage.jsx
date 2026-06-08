import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaCalendar,
  FaHashtag,
  FaUserTie,
  FaBoxOpen,
  FaCommentAlt,
  FaMoneyBillWave,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency.js";
import { getProviders } from "../../api/providers.js";
import { getProducts } from "../../api/product.js";
import { createPurchaseCompleteRequest } from "../../api/purchase.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // --- States ---
  const [isLoading, setIsLoading] = useState(false);

  // Header / Document Data
  const [purchaseData, setPurchaseData] = useState({
    providerId: "",
    documentNumber: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    applyTax: false, // IVA Toggle
    note: "", // Comments
  });

  // Table Data
  const [items, setItems] = useState([
    {
      id: uuidv4(),
      productId: "",
      productName: "",
      quantity: 1,
      unitCost: 0,
      totalLine: 0,
    },
  ]);

  // Product Search State
  const [focusedRowId, setFocusedRowId] = useState(null);
  const searchContainerRef = useRef(null);

  // Products
  const [products, setProducts] = useState([]);
  const searchProducts = async () => {
    try {
      const res = await getProducts();
      // Ensure we have an array
      setProducts(Array.isArray(res.data) ? res.data : []);
      return res.data;
    } catch (error) {
      console.log(error);
      setProducts([]);
      return [];
    }
  };

  // Providers
  const [providers, setProviders] = useState([]);
  const searchProvider = async () => {
    try {
      const res = await getProviders();
      setProviders(Array.isArray(res.data) ? res.data : []);
      return res.data;
    } catch (error) {
      console.log(error);
      setProviders([]);
      return [];
    }
  };

  useEffect(() => {
    searchProvider();
    searchProducts();
  }, []);

  // Handle click outside to close filtering dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setFocusedRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Payment Logic
  const [payments, setPayments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState({
    amount: "",
    method: "Efectivo",
  });

  // Totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0, // IVA
    totalNet: 0,
    totalPaid: 0,
    balanceDue: 0,
  });

  // --- Effects ---

  // Calculate Totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalLine, 0);
    const tax = purchaseData.applyTax ? Math.round(subtotal * 0.19) : 0;
    const totalNet = subtotal + tax;

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balanceDue = Math.max(0, totalNet - totalPaid);

    setTotals({ subtotal, tax, totalNet, totalPaid, balanceDue });
  }, [items, purchaseData.applyTax, payments]);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPurchaseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitCost") {
            updatedItem.totalLine =
              Number(updatedItem.quantity) * Number(updatedItem.unitCost);
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleProductSelect = (id, product) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const unitCost = Number(product.productPrice ?? product.productCost ?? product.cost ?? 0);
          return {
            ...item,
            productId: product.productId || product.id,
            productName: product.productName || product.name || "",
            unitCost,
            totalLine: unitCost * Number(item.quantity),
          };
        }
        return item;
      }),
    );
    setFocusedRowId(null);
  };

  const addNewRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: uuidv4(),
        productId: "",
        productName: "",
        quantity: 1,
        unitCost: 0,
        totalLine: 0,
      },
    ]);
  };

  const removeRow = (id) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const addPayment = () => {
    if (!currentPayment.amount || Number(currentPayment.amount) <= 0) return;
    setPayments([...payments, { ...currentPayment, id: uuidv4() }]);
    setCurrentPayment({ amount: "", method: "Efectivo" }); // Reset but keep method preference? Or reset to default.
  };

  const removePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!purchaseData.providerId) {
      toast.info("Proveedor requerido", "Selecciona un proveedor para continuar.");
      return;
    }
    if (!purchaseData.documentNumber?.trim()) {
      toast.info("Documento requerido", "Ingresa el número de documento o factura.");
      return;
    }

    const validItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      toast.info("Productos requeridos", "Agrega al menos un producto con cantidad válida.");
      return;
    }

    setIsLoading(true);
    try {
      const purchaseId = uuidv4();
      const payload = {
        purchaseId,
        purchaseProviderId: purchaseData.providerId,
        purchaseRealNumber: purchaseData.documentNumber.trim(),
        purchaseComment: purchaseData.note?.trim() || null,
        purchaseTotal: totals.subtotal,
        items: validItems.map((item) => ({
          id: uuidv4(),
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          totalLine: Number(item.totalLine),
        })),
      };

      const result = await createPurchaseCompleteRequest(payload);

      toast.success(
        `Compra #${result.data?.purchase?.purchaseNumber ?? ""}`.trim(),
        "La compra se registró y el stock se actualizó correctamente.",
      );
      navigate("/purchase");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "No se pudo registrar la compra.";
      toast.error("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to filter products
  const getFilteredProducts = (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return products
      .filter(
        (p) =>
          (p.productName && p.productName.toLowerCase().includes(lowerQuery)) ||
          (p.productSKU && p.productSKU.toLowerCase().includes(lowerQuery)),
      )
      .slice(0, 5);
  };

  return (
    <PageContainer>
      <div className="min-h-screen bg-gray-50 pt-[70px] pb-2 px-4 md:px-6 font-sans">
        {/* PAGE HEADER (Full Width) */}
        <div className="max-w-[1600px] mx-auto mb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#021f41] font-display">
                Registrar Compra
              </h1>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FORM & DETAILS (~70%) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* 1. HEADER FORM */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-5 items-start">
              {/* Provider Select */}
              <div className="flex-1 w-full space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FaUserTie /> Proveedor
                </label>
                <div className="relative">
                  <select
                    name="providerId"
                    value={purchaseData.providerId}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center]"
                  >
                    <option value="" className="text-gray-400">
                      Seleccionar Proveedor...
                    </option>
                    {providers.map((provider) => (
                      <option
                        key={provider.providerId}
                        value={provider.providerId}
                      >
                        {provider.providerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoice Number */}
              <div className="w-full md:w-1/4 space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FaHashtag /> Nro. Documento
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={purchaseData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="Ej. 123456"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Date */}
              <div className="w-full md:w-1/4 space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FaCalendar /> Fecha Emisión
                </label>
                <input
                  type="date"
                  name="date"
                  value={purchaseData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-600"
                />
              </div>
            </div>

            {/* 2. ITEMS TABLE */}
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible min-h-[400px] flex flex-col"
              ref={searchContainerRef}
            >
              <div className="overflow-visible flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 text-gray-600 text-[11px] uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 text-left">Producto / Detalle</th>
                      <th className="p-3 w-28 text-center">Cantidad</th>
                      <th className="p-3 w-36 text-end">Costo Unit.</th>
                      <th className="p-3 w-36 text-end">Total</th>
                      <th className="p-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <Motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-blue-50/30 transition-colors group text-sm relative"
                        >
                          <td className="p-3 text-center text-gray-400 font-mono text-xs">
                            {index + 1}
                          </td>
                          <td className="p-3 relative">
                            <div className="relative z-20">
                              <FaBoxOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                              <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={item.productName}
                                onFocus={() => setFocusedRowId(item.id)}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "productName",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded text-sm transition-all placeholder-gray-400 relative z-20"
                                autoComplete="off"
                              />
                              {/* Search Dropdown */}
                              {focusedRowId === item.id && item.productName && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                  {getFilteredProducts(item.productName)
                                    .length > 0 ? (
                                    getFilteredProducts(item.productName).map(
                                      (p) => (
                                        <button
                                          key={p.productId || p.id}
                                          onClick={() =>
                                            handleProductSelect(item.id, p)
                                          }
                                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm flex justify-between items-center border-b border-gray-50 last:border-0"
                                        >
                                          <span className="font-medium text-gray-700">
                                            {p.productName}
                                          </span>
                                          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                            Stock: {Number(p.productStock ?? p.quantityOnHand ?? 0)}
                                          </span>
                                        </button>
                                      ),
                                    )
                                  ) : (
                                    <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                                      <FaSearch className="text-gray-300" /> No
                                      se encontraron productos
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className="w-full text-center py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded text-sm transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "unitCost",
                                  e.target.value,
                                )
                              }
                              className="w-full text-end py-1.5 bg-transparent border border-transparent focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded text-sm transition-all"
                            />
                          </td>
                          <td className="p-3 text-end font-semibold text-gray-700 bg-gray-50/50">
                            {formatCurrency(item.totalLine)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => removeRow(item.id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              disabled={items.length === 1}
                            >
                              <FaTrash size={12} />
                            </button>
                          </td>
                        </Motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={addNewRow}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus size={10} /> AGREGAR ITEM
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR DETAILS (~30%) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-[90px]">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-5">
              {/* BLOCK 1: TOTALS (Top Priority) */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`transition-colors ${purchaseData.applyTax ? "text-emerald-700" : "text-gray-400"}`}
                      >
                        IVA (19%)
                      </span>
                      {/* IVA Toggle Compact */}
                      <div className="bg-gray-50 rounded border border-gray-200 px-1.5 py-0.5 flex items-center">
                        <input
                          type="checkbox"
                          checked={purchaseData.applyTax}
                          onChange={(e) =>
                            setPurchaseData((prev) => ({
                              ...prev,
                              applyTax: e.target.checked,
                            }))
                          }
                          className="w-3 h-3 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>
                    <span
                      className={`font-mono font-medium ${purchaseData.applyTax ? "text-emerald-700" : "text-gray-300"}`}
                    >
                      {formatCurrency(totals.tax)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#021f41] uppercase">
                    Total Neto
                  </span>
                  <span className="text-xl font-black text-emerald-600 font-display">
                    {formatCurrency(totals.totalNet)}
                  </span>
                </div>
              </div>

              {/* BLOCK 2: PAYMENTS */}
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 flex flex-col gap-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FaMoneyBillWave size={10} /> Pagos
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="$"
                    value={currentPayment.amount}
                    onChange={(e) =>
                      setCurrentPayment({
                        ...currentPayment,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <select
                    value={currentPayment.method}
                    onChange={(e) =>
                      setCurrentPayment({
                        ...currentPayment,
                        method: e.target.value,
                      })
                    }
                    className="w-24 bg-white border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-sans"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transfer</option>
                    <option value="Credito">Crédito</option>
                    <option value="Debito">Débito</option>
                  </select>
                  <button
                    onClick={addPayment}
                    disabled={!currentPayment.amount}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-2 rounded transition-colors disabled:opacity-50"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>

                <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {payments.map((p) => (
                      <Motion.div
                        key={p.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between items-center px-2 py-1 bg-white border border-gray-100 rounded text-[10px]"
                      >
                        <span className="font-semibold text-gray-700">
                          {formatCurrency(p.amount)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="uppercase text-gray-400 text-[9px]">
                            {p.method}
                          </span>
                          <button
                            onClick={() => removePayment(p.id)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      </Motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Balance Grid */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-center">
                    <p className="text-[9px] text-blue-400 uppercase font-bold">
                      Pagado
                    </p>
                    <p className="text-xs font-bold text-blue-600">
                      {formatCurrency(totals.totalPaid)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-red-400 uppercase font-bold">
                      Pendiente
                    </p>
                    <p className="text-xs font-bold text-red-500">
                      {formatCurrency(totals.balanceDue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: COMMENTS */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FaCommentAlt size={10} /> Notas
                </label>
                <textarea
                  name="note"
                  value={purchaseData.note}
                  onChange={handleInputChange}
                  placeholder="..."
                  className="w-full bg-gray-50 border-0 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 resize-none placeholder-gray-400 text-gray-600 h-16"
                />
              </div>

              {/* BLOCK 4: ACTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => navigate("/purchase")}
                  className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave /> {isLoading ? "GUARDANDO..." : "GUARDAR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
