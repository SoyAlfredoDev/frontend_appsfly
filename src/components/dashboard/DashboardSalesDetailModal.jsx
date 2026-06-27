import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaShoppingCart } from "react-icons/fa";
import { getDashboardSalesView, getSales } from "../../api/sale.js";
import { filterSalesByDashboardView } from "../../utils/salesFilters.js";
import SalesTable from "../sales/SalesTable.jsx";

export default function DashboardSalesDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  filterView,
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !filterView) {
      return undefined;
    }

    let cancelled = false;

    const loadSales = async () => {
      setLoading(true);
      setSales([]);
      try {
        const response = await getDashboardSalesView(filterView);
        if (!cancelled) {
          setSales(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 404 || status === 400) {
          try {
            const fallback = await getSales();
            if (!cancelled) {
              setSales(
                filterSalesByDashboardView(
                  Array.isArray(fallback.data) ? fallback.data : [],
                  filterView,
                ),
              );
            }
            return;
          } catch (fallbackError) {
            console.error("Error loading sales fallback for dashboard detail:", fallbackError);
          }
        } else {
          console.error("Error loading sales for dashboard detail:", error);
        }
        if (!cancelled) setSales([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSales();

    return () => {
      cancelled = true;
    };
  }, [isOpen, filterView]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && filterView && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-sales-modal-title"
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
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/80 shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                  <FaShoppingCart className="text-lg" />
                </div>
                <div className="min-w-0">
                  <h3
                    id="dashboard-sales-modal-title"
                    className="text-lg font-bold text-gray-800 truncate"
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                  )}
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

            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50 min-h-0">
              <SalesTable
                data={sales}
                isLoading={loading}
                sectionTitle="Detalle de ventas"
                emptyTitle="No hay ventas para este periodo."
                className="shadow-sm"
              />
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
    </AnimatePresence>,
    document.body,
  );
}
