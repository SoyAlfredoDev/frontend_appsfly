import { FaBoxOpen, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import formatCurrency from "../../utils/formatCurrency.js";
import {
  TABLE_INPUT,
  ACTION_DELETE,
} from "../../utils/expenseUiPatterns.js";

function ProductSelect({ productsServices, value, onChange, compact = false }) {
  return (
    <select
      className={`${TABLE_INPUT} font-medium ${compact ? "text-sm py-2" : ""}`}
      onChange={onChange}
      value={value || ""}
    >
      <option value="">Seleccionar producto o servicio...</option>
      <optgroup label="Productos">
        {productsServices
          .filter((p) => p.productId)
          .map((p) => {
            const stock = Number(p.productStock ?? p.quantityOnHand ?? 0);
            return (
              <option key={p.productId} value={p.productId}>
                {p.productName} (Stock: {stock})
              </option>
            );
          })}
      </optgroup>
      <optgroup label="Servicios">
        {productsServices
          .filter((p) => p.serviceId)
          .map((p) => (
            <option key={p.serviceId} value={p.serviceId}>
              {p.serviceName}
            </option>
          ))}
      </optgroup>
    </select>
  );
}

function QuantityStepper({ amount, onStep, onInput, compact = false }) {
  const btnClass = compact
    ? "w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-600 text-xs"
    : "w-8 h-10 flex items-center justify-center rounded-l-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs";
  const inputClass = compact
    ? "input-field h-9 w-11 border-x-0 text-center font-semibold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    : "input-field h-10 w-12 rounded-none border-x-0 text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className={`flex items-center ${compact ? "rounded-lg overflow-hidden border border-slate-200" : "justify-center gap-0.5"}`}>
      <button
        type="button"
        onClick={() => onStep(-1)}
        className={`${btnClass} ${compact ? "rounded-none" : "rounded-l-lg"}`}
        disabled={amount <= 1}
      >
        <FaMinus className="text-[8px]" />
      </button>
      <input
        type="number"
        min="1"
        className={inputClass}
        value={amount}
        onInput={onInput}
      />
      <button
        type="button"
        onClick={() => onStep(1)}
        className={`${btnClass} ${compact ? "rounded-none" : "rounded-r-lg"}`}
      >
        <FaPlus className="text-[8px]" />
      </button>
    </div>
  );
}

/** Tarjeta compacta para móvil — sustituye fila de tabla en pantallas pequeñas. */
export function SaleLineItemMobileCard({
  row,
  index,
  productsServices,
  onSelectProduct,
  onAmountStep,
  onAmountInput,
  onPriceInput,
  onDelete,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-center">
            {index + 1}
          </span>
          {row.saleDetailType === "PRODUCT" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">
              <FaBoxOpen className="text-[8px]" /> PROD
            </span>
          )}
          {row.saleDetailType === "SERVICE" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600">
              SERV
            </span>
          )}
          {row.saleDetailSKU && (
            <span className="text-[10px] font-mono text-gray-400 truncate">{row.saleDetailSKU}</span>
          )}
        </div>
        <button type="button" className={ACTION_DELETE} onClick={onDelete} title="Eliminar">
          <FaTrash className="text-xs" />
        </button>
      </div>

      <ProductSelect
        productsServices={productsServices}
        value={row.saleDetailProductServiceId}
        onChange={(e) => onSelectProduct(e, index)}
        compact
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Cantidad</p>
          <QuantityStepper
            amount={row.saleDetailAmount}
            onStep={(dir) => onAmountStep(index, dir)}
            onInput={(e) => onAmountInput(index, "saleDetailAmount", e.target.value)}
            compact
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Precio</p>
          <input
            type="number"
            className={`${TABLE_INPUT} text-sm h-9 ${row.saleDetailPriceFixed ? "bg-gray-50 text-gray-400" : ""}`}
            value={row.saleDetailPrice}
            onInput={(e) => onPriceInput(index, "saleDetailPrice", e.target.value)}
            disabled={row.saleDetailPriceFixed}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-500">Subtotal</span>
        <span className="text-base font-bold text-primary font-mono">
          {formatCurrency(row.saleDetailTotal)}
        </span>
      </div>
    </div>
  );
}

export { ProductSelect, QuantityStepper };
