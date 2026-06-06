/**
 * Patrones UI extraídos de ExpensesPage.jsx — Source of Truth.
 * Importar solo en vistas que deben replicar el acabado de /expenses.
 */

export const PRIMARY_BTN =
  "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm text-sm font-medium";

export const PRIMARY_BTN_BLOCK = `${PRIMARY_BTN} w-full justify-center`;

export const KPI_CARD =
  "bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4";

export const KPI_ICON_PRIMARY = "p-3 bg-primary/10 rounded-xl text-primary";
export const KPI_ICON_SECONDARY = "p-3 bg-secondary/10 rounded-xl text-secondary";
export const KPI_ICON_AMBER = "p-3 bg-amber-100 rounded-xl text-amber-600";

export const KPI_LABEL =
  "text-xs text-gray-500 font-semibold uppercase tracking-wide";

export const KPI_VALUE = "text-2xl font-bold text-gray-900";

export const TABLE_WRAPPER =
  "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden";

/** Variante full-bleed para POS /sales/register (sin márgenes laterales) */
export const TABLE_WRAPPER_FULL =
  "bg-white border-y border-gray-200 overflow-hidden flex flex-col h-full min-h-[280px]";

export const TABLE_TOOLBAR =
  "px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3";

export const TABLE_SECTION_TITLE = "text-sm font-semibold text-gray-800";

export const TABLE_SECTION_SUB = "text-xs text-gray-500 mt-0.5";

export const TABLE_SEARCH =
  "pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm";

export const TABLE_INPUT =
  "py-2 px-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm";

export const THEAD =
  "bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100";

export const TH = "px-6 py-4";

export const TD = "px-6 py-4 text-sm";

export const TD_MUTED = "px-6 py-4 text-gray-600 text-sm whitespace-nowrap";

export const TD_AMOUNT = "px-6 py-4 text-primary font-semibold text-sm whitespace-nowrap";

export const TR_ROW = "hover:bg-gray-50 transition-colors group";

export const TBODY = "divide-y divide-gray-100";

export const ACTION_VIEW =
  "p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors";

export const ACTION_EDIT =
  "p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors";

export const ACTION_DELETE =
  "p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors";

export const PAGE_HEADER_CARD =
  "card card-body flex flex-col md:flex-row md:items-center justify-between gap-4";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/** Texto contador bajo título de sección — mismo patrón que Gastos */
export function formatRecordCount(count, loading = false) {
  if (loading) return "Cargando...";
  return `${count} registro${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`;
}
