import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { FaSearch, FaTimes, FaUser, FaUserPlus } from "react-icons/fa";
import NewCustomerModal from "../modals/AddCustomerModal.jsx";
import {
  PRIMARY_BTN,
  REGISTER_CUSTOMER_BAR,
  REGISTER_CUSTOMER_BAR_ACTIONS,
  REGISTER_CUSTOMER_BAR_FIELD,
  REGISTER_CUSTOMER_BAR_LABEL,
  REGISTER_CUSTOMER_BAR_LABEL_TEXT,
  REGISTER_CUSTOMER_BAR_ROW,
  REGISTER_CUSTOMER_DROPDOWN,
  REGISTER_CUSTOMER_SEARCH_INPUT,
} from "../../utils/expenseUiPatterns.js";

function customerSecondaryLine(customer) {
  return [customer.customerDocumentNumber, customer.customerPhoneNumber, customer.customerEmail]
    .filter(Boolean)
    .join(" · ");
}

export default function RegisterCustomerBar({
  selectedCustomer,
  selectedCustomerId,
  customerSearch,
  isDropdownOpen,
  onSearchChange,
  onOpenDropdown,
  onCloseDropdown,
  onSelectCustomer,
  onClearCustomer,
  filteredCustomers,
  onCustomerCreated,
  disabled = false,
  viewCustomerHref = null,
  className = "",
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onCloseDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCloseDropdown]);

  return (
    <div className={className}>
      <div
        className={`${REGISTER_CUSTOMER_BAR} ${disabled ? "opacity-45 pointer-events-none select-none" : ""}`}
      >
        <div className={REGISTER_CUSTOMER_BAR_ROW}>
          <div className={REGISTER_CUSTOMER_BAR_LABEL}>
            <FaUser className="text-primary text-xs shrink-0 md:hidden" />
            <span className={REGISTER_CUSTOMER_BAR_LABEL_TEXT}>Cliente</span>
          </div>

          <div ref={dropdownRef} className={REGISTER_CUSTOMER_BAR_FIELD}>
            {selectedCustomer && !isDropdownOpen ? (
              <div
                className="flex items-center gap-3 w-full py-1 cursor-pointer group"
                onClick={onOpenDropdown}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpenDropdown();
                }}
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {selectedCustomer.customerFirstName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedCustomer.customerFirstName}{" "}
                    {selectedCustomer.customerLastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {customerSecondaryLine(selectedCustomer) || "Sin datos de contacto"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearCustomer();
                    onCloseDropdown();
                  }}
                  className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors shrink-0 touch-manipulation"
                  title="Quitar cliente"
                  aria-label="Quitar cliente"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            ) : (
              <div className="relative w-full flex items-center">
                <FaSearch className="absolute left-0 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  className={`${REGISTER_CUSTOMER_SEARCH_INPUT} pl-7 text-base md:text-sm`}
                  placeholder="Buscar por nombre, RUT, teléfono o correo..."
                  value={customerSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onOpenDropdown}
                  autoComplete="off"
                />
              </div>
            )}

            <AnimatePresence>
              {isDropdownOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={REGISTER_CUSTOMER_DROPDOWN}
                >
                  {filteredCustomers.length === 0 ? (
                    <div className="px-4 py-5 text-center text-sm text-gray-400">
                      No se encontraron clientes
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        key={c.customerId}
                        type="button"
                        className={`w-full flex items-center gap-3 px-4 h-12 text-left hover:bg-primary/5 transition-colors text-sm border-b border-gray-50 last:border-0 ${
                          c.customerId === selectedCustomerId ? "bg-primary/10" : ""
                        }`}
                        onClick={() => onSelectCustomer(c.customerId)}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                          {c.customerFirstName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {c.customerFirstName} {c.customerLastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {customerSecondaryLine(c) || "Sin datos de contacto"}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={REGISTER_CUSTOMER_BAR_ACTIONS}>
            {viewCustomerHref && (
              <Link
                to={viewCustomerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 text-secondary hover:bg-secondary/10 rounded-lg transition-colors border border-gray-200"
                title="Ver ficha del cliente"
              >
                <FaSearch className="text-xs" />
              </Link>
            )}
            <NewCustomerModal
              trigger={
                <button
                  type="button"
                  className={`${PRIMARY_BTN} !px-2.5 !py-1.5 !h-8 !text-xs touch-manipulation`}
                  title="Registrar cliente"
                  disabled={disabled}
                >
                  <FaUserPlus className="text-sm" />
                  <span className="hidden md:inline ml-1.5">Nuevo</span>
                </button>
              }
              title="Registrar Cliente"
              onCreated={onCustomerCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
