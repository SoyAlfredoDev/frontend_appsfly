import { motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";

export default function KpiComponent({
  title,
  icon,
  value,
  footer,
  loading,
  isCurrency = true,
}) {
  return (
    <motion.div
      className="card overflow-hidden flex flex-col h-full"
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(2, 31, 65, 0.1)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-dark">{title}</h4>
      </div>

      <div className="flex justify-between items-center px-5 py-4 flex-1 gap-3">
        <div className="text-primary text-3xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-xl sm:text-2xl font-bold text-dark text-right">
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : value === null ? (
            <FaExclamationCircle className="text-amber-500 text-2xl" />
          ) : isCurrency ? (
            value.toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
            })
          ) : (
            value
          )}
        </span>
      </div>

      <div className="bg-slate-50 text-slate-600 text-center py-2.5 px-4 text-xs font-medium border-t border-slate-100">
        {footer}
      </div>
    </motion.div>
  );
}
