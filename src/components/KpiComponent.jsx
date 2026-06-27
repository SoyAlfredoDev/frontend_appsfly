import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";

export default function KpiComponent({
  title,
  icon,
  value,
  footer,
  loading,
  isCurrency = true,
  to,
  onClick,
}) {
  const isClickable = Boolean(to || onClick);

  const cardBody = (
    <>
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
    </>
  );

  const motionProps = {
    className: `card overflow-hidden flex flex-col h-full${
      isClickable ? " cursor-pointer hover:border-primary/25 transition-colors" : ""
    }`,
    whileHover: isClickable
      ? { y: -2, boxShadow: "0 8px 24px rgba(2, 31, 65, 0.1)" }
      : undefined,
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  if (to) {
    return (
      <Link to={to} className="no-underline block h-full">
        <motion.div {...motionProps}>{cardBody}</motion.div>
      </Link>
    );
  }

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        {...motionProps}
        className={`${motionProps.className} w-full text-left appearance-none`}
      >
        {cardBody}
      </motion.button>
    );
  }

  return <motion.div {...motionProps}>{cardBody}</motion.div>;
}
