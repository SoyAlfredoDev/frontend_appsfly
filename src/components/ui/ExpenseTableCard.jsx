import { motion as Motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import {
  TABLE_WRAPPER,
  TABLE_TOOLBAR,
  TABLE_SECTION_TITLE,
  TABLE_SECTION_SUB,
  TABLE_SEARCH,
  itemVariants,
  formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

/**
 * Contenedor de tabla idéntico a /expenses — toolbar + búsqueda + contenido.
 */
export default function ExpenseTableCard({
  sectionTitle,
  recordCount = 0,
  loading = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  toolbarExtra,
  children,
  className = "",
  disableAnimation = false,
}) {
  const Wrapper = disableAnimation ? "div" : Motion.div;
  const wrapperProps = disableAnimation
    ? {}
    : { variants: itemVariants };

  return (
    <Wrapper {...wrapperProps} className={`${TABLE_WRAPPER} ${className}`}>
      <div className={TABLE_TOOLBAR}>
        <div>
          <h2 className={TABLE_SECTION_TITLE}>{sectionTitle}</h2>
          <p className={TABLE_SECTION_SUB}>
            {formatRecordCount(recordCount, loading)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
          {toolbarExtra}
          {showSearch && onSearchChange && (
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={TABLE_SEARCH}
              />
            </div>
          )}
        </div>
      </div>
      {children}
    </Wrapper>
  );
}

export function ExpenseTableScroll({ children }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function ExpenseTableLoading({ colSpan, message = "Cargando..." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function ExpenseTableEmpty({ colSpan, icon, title, hint }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
          {icon}
          <p className="text-sm font-medium">{title}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
      </td>
    </tr>
  );
}
