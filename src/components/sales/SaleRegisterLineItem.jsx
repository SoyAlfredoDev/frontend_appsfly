import { FaBoxOpen, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import formatCurrency from "../../utils/formatCurrency.js";
import {
  FLAT_INPUT,
  FLAT_TAP_TARGET,
  TABLE_INPUT,
} from "../../utils/expenseUiPatterns.js";

function ProductSelect({ productsServices, value, onChange, mobile = false }) {
  return (
    <select
      className={`${mobile ? FLAT_INPUT : TABLE_INPUT} font-medium`}
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

function QuantityStepper({ amount, onStep, onInput, mobile = false }) {
  const btnClass = mobile
    ? `${FLAT_TAP_TARGET} bg-gray-100 text-gray-600 active:bg-gray-200`
    : "w-8 h-8 flex items-center justify-center rounded-l-md bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs";
  const inputClass = mobile
    ? "h-9 w-12 border-x border-gray-200 text-center font-semibold text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    : "input-field h-8 w-11 rounded-none border-x-0 text-center font-semibold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div
      className={`flex items-center ${
        mobile
          ? "rounded-md overflow-hidden border border-gray-200 w-fit"
          : "justify-center gap-0.5"
      }`}
    >
      <button
        type="button"
        onClick={() => onStep(-1)}
        className={`${btnClass} ${mobile ? "" : "rounded-l-md"}`}
        disabled={amount <= 1}
        aria-label="Disminuir cantidad"
      >
        <FaMinus className="text-[9px]" />
      </button>
      <input
        type="number"
        min="1"
        inputMode="numeric"
        className={inputClass}
        value={amount}
        onInput={onInput}
        aria-label="Cantidad"
      />
      <button
        type="button"
        onClick={() => onStep(1)}
        className={`${btnClass} ${mobile ? "" : "rounded-r-md"}`}
        aria-label="Aumentar cantidad"
      >
        <FaPlus className="text-[9px]" />
      </button>
    </div>
  );
}

/** Fila compacta para móvil — sin card, solo divider. */
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
    <article className="border-b border-gray-200 py-2.5 space-y-2 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap text-[11px] text-gray-500">
          <span className="font-mono font-semibold text-gray-400">#{index + 1}</span>
          {row.saleDetailType === "PRODUCT" && (
            <span className="text-blue-600 font-semibold">PROD</span>
          )}
          {row.saleDetailType === "SERVICE" && (
            <span className="text-purple-600 font-semibold">SERV</span>
          )}
          {row.saleDetailSKU && (
            <span className="font-mono truncate">{row.saleDetailSKU}</span>
          )}
        </div>
        <button
          type="button"
          className={`${FLAT_TAP_TARGET} text-red-500 hover:bg-red-50 rounded-md shrink-0`}
          onClick={onDelete}
          title="Eliminar ítem"
          aria-label="Eliminar ítem"
        >
          <FaTrash className="text-xs" />
        </button>
      </div>

      <ProductSelect
        productsServices={productsServices}
        value={row.saleDetailProductServiceId}
        onChange={(e) => onSelectProduct(e, index)}
        mobile
      />

      <div className="grid grid-cols-2 gap-2">
        <QuantityStepper
          amount={row.saleDetailAmount}
          onStep={(dir) => onAmountStep(index, dir)}
          onInput={(e) => onAmountInput(index, "saleDetailAmount", e.target.value)}
          mobile
        />
        <input
          type="number"
          inputMode="decimal"
          className={`${FLAT_INPUT} font-mono text-right ${
            row.saleDetailPriceFixed ? "bg-gray-50 text-gray-400" : ""
          }`}
          value={row.saleDetailPrice}
          onInput={(e) => onPriceInput(index, "saleDetailPrice", e.target.value)}
          disabled={row.saleDetailPriceFixed}
          aria-label="Precio unitario"
          placeholder="Precio"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Subtotal</span>
        <span className="font-bold text-primary font-mono">
          {formatCurrency(row.saleDetailTotal)}
        </span>
      </div>
    </article>
  );
}

export { ProductSelect, QuantityStepper };
