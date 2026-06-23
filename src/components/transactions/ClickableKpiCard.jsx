import {
  KPI_CARD,
  KPI_ICON_PRIMARY,
  KPI_ICON_SECONDARY,
  KPI_ICON_AMBER,
  KPI_LABEL,
  KPI_VALUE,
} from "../../utils/expenseUiPatterns.js";

export default function ClickableKpiCard({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${KPI_CARD} text-left w-full cursor-pointer hover:border-primary/30 hover:shadow-md transition-all ${className}`}
    >
      {children}
    </button>
  );
}

export { KPI_ICON_PRIMARY, KPI_ICON_SECONDARY, KPI_ICON_AMBER, KPI_LABEL, KPI_VALUE };
