import { motion, useReducedMotion } from "framer-motion";

export default function PageContainer({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`page-container ${className}`}>
      <motion.div
        className="page-inner"
        initial={reduceMotion ? false : { y: 6 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="card card-body flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
