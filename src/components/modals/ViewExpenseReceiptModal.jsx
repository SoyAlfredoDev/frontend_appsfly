import { useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaReceipt, FaExclamationCircle } from "react-icons/fa";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";
import { getPaymentMethodLabel } from "../../utils/monthOptions.js";
import { useReceiptViewer } from "./useReceiptViewer.js";

function ReceiptContent({ url, description }) {
  const { normalizedUrl, status, viewerMode } = useReceiptViewer(url);

  if (!normalizedUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
        <FaExclamationCircle className="text-3xl text-amber-500" />
        <p className="text-sm font-medium text-gray-700">
          No hay comprobante disponible
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="animate-spin h-10 w-10 border-2 border-emerald-500 rounded-full border-t-transparent" />
        <p className="text-sm text-gray-500">Cargando comprobante...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
        <FaExclamationCircle className="text-3xl text-amber-500" />
        <p className="text-sm font-medium text-gray-700">
          No se pudo cargar el comprobante
        </p>
        <p className="text-xs text-gray-500">
          Verifica tu conexión e intenta nuevamente.
        </p>
      </div>
    );
  }

  if (viewerMode === "pdf") {
    return (
      <iframe
        src={normalizedUrl}
        title={`Comprobante PDF: ${description || "gasto"}`}
        className="w-full h-[55vh] rounded-lg border-0 bg-white"
      />
    );
  }

  return (
    <img
      src={normalizedUrl}
      alt={`Comprobante: ${description || "gasto"}`}
      draggable={false}
      className="max-w-full max-h-[55vh] object-contain opacity-100 transition-opacity duration-300"
    />
  );
}

export default function ViewExpenseReceiptModal({ isOpen, onClose, expense }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && expense && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
        >
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <Motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/80 shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
                  <FaReceipt className="text-lg" />
                </div>
                <div className="min-w-0">
                  <h3
                    id="receipt-modal-title"
                    className="text-lg font-bold text-gray-800 truncate"
                  >
                    Comprobante de gasto
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {expense.expenseDescription || "Sin descripción"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 rounded-lg transition-colors shrink-0"
                aria-label="Cerrar"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-100 bg-white shrink-0">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Fecha
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(expense.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Monto
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatCurrency(expense.expenseAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Método
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {getPaymentMethodLabel(expense.expensePaymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                  Registrado por
                </p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {expense.user?.userFirstName} {expense.user?.userLastName}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-slate-50 min-h-[280px]">
              <div className="relative flex items-center justify-center min-h-[240px] rounded-xl border border-gray-200 bg-white overflow-hidden">
                <ReceiptContent
                  key={expense.expenseImageUrl}
                  url={expense.expenseImageUrl}
                  description={expense.expenseDescription}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
