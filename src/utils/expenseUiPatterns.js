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

/** Variante full-bleed para POS / ventas / cotizaciones (plano, sin card) */
export const TABLE_WRAPPER_FULL =
  "bg-white border-b border-gray-200 overflow-hidden flex flex-col h-full min-h-0";

export const TABLE_TOOLBAR =
  "px-3 md:px-4 py-2 border-b border-gray-200 flex items-center justify-between gap-2";

export const TABLE_SECTION_TITLE = "text-xs font-semibold text-gray-800";

export const TABLE_SECTION_SUB = "text-[11px] text-gray-400";

export const TABLE_SEARCH =
  "pl-9 pr-3 py-1.5 w-full border-0 border-b border-gray-200 rounded-none focus:outline-none focus:border-primary text-sm bg-transparent";

export const TABLE_INPUT =
  "py-1.5 px-2.5 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white";

export const THEAD =
  "bg-gray-50/80 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200";

export const TH = "px-3 py-2";

export const TD = "px-3 py-2 text-sm";

export const TD_MUTED = "px-3 py-2 text-gray-600 text-sm whitespace-nowrap";

export const TD_AMOUNT = "px-3 py-2 text-primary font-semibold text-sm whitespace-nowrap";

export const TR_ROW = "hover:bg-gray-50 transition-colors group";

export const TBODY = "divide-y divide-gray-100";

export const ACTION_VIEW =
  "p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors";

export const ACTION_EDIT =
  "p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors";

export const ACTION_DELETE =
  "p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors";

/** Formularios de registro — layout plano (sin cards). */
export const FLAT_PAGE_HEADER =
  "flex-none w-full bg-white border-b border-gray-200";

export const FLAT_META_TEXT = "text-[11px] text-gray-500 flex items-center gap-1.5";

export const FLAT_MOBILE_SCROLL =
  "md:hidden px-3 py-1 pb-[calc(8rem+env(safe-area-inset-bottom))]";

export const FLAT_INPUT =
  "h-9 px-2.5 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white";

export const FLAT_TAP_TARGET =
  "min-h-9 min-w-9 flex items-center justify-center touch-manipulation";

/** @deprecated Usar FormFlatSection — mantener alias por compatibilidad */
export const MOBILE_SECTION_CARD = "";
export const MOBILE_SECTION_HEADER = "";
export const MOBILE_SECTION_BODY = "";
export const MOBILE_TAP_TARGET = FLAT_TAP_TARGET;
export const MOBILE_INPUT = FLAT_INPUT;

export const PAGE_HEADER_CARD =
  "card card-body flex flex-col md:flex-row md:items-center justify-between gap-4";

/** Barra de cliente en formularios de registro (venta, cotización) — plana. */
export const REGISTER_CUSTOMER_BAR = "overflow-visible w-full";

export const REGISTER_CUSTOMER_BAR_ROW =
  "flex items-stretch min-h-[40px] gap-2";

export const REGISTER_CUSTOMER_BAR_LABEL =
  "hidden md:flex items-center gap-1.5 shrink-0";

export const REGISTER_CUSTOMER_BAR_LABEL_TEXT =
  "text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";

export const REGISTER_CUSTOMER_BAR_FIELD =
  "flex-1 relative min-w-0 flex items-center";

export const REGISTER_CUSTOMER_BAR_ACTIONS =
  "flex items-center gap-1 shrink-0";

export const REGISTER_CUSTOMER_SEARCH_INPUT =
  "w-full h-9 bg-transparent border-0 border-b border-gray-200 outline-none text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary";

export const REGISTER_CUSTOMER_DROPDOWN =
  "absolute z-[60] left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto";

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
