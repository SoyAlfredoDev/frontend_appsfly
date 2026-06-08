import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaSave } from "react-icons/fa";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";
import { createTransaction } from "../../api/transaction.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PAYMENT_METHODS } from "../../utils/transactionUtils.js";
import {
  PRIMARY_BTN,
} from "../../utils/expenseUiPatterns.js";

const CANCEL_BTN =
  "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium";
const MODAL_SAVE_BTN =
  "px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

export default function AddTransactionModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onCreated = null,
  trigger = null,
}) {
  const toast = useToast();
  const isControlled = externalIsOpen !== undefined;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const transactionId = uuidv4();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    transactionId,
    transactionType: "ADJUSTMENT",
    transactionMethod: "2",
    direction: "IN",
    transactionNewValue: 100000,
    transactionDescription: "",
  });

  const openModal = () => {
    if (!isControlled) setInternalIsOpen(true);
  };

  const closeModal = () => {
    if (isControlled) externalOnClose?.();
    else setInternalIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      const id = uuidv4();
      setData({
        transactionId: id,
        transactionType: "ADJUSTMENT",
        transactionMethod: "2",
        direction: "IN",
        transactionNewValue: 100000,
        transactionDescription: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const amount = Number(data.transactionNewValue);
    if (!amount || amount <= 0) {
      toast.info("Monto requerido", "Ingresa un monto mayor a cero.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await createTransaction({
        transactionId: data.transactionId,
        transactionType: data.transactionType,
        transactionMethod: data.transactionMethod,
        transactionDescription: data.transactionDescription,
        amount,
        direction: data.direction,
      });
      if (res.status === 200 || res.status === 201) {
        toast.success("Transacción agregada", "La transacción se registró correctamente.");
        onCreated?.();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Error", "No se pudo registrar la transacción.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Agregar Transacción</h2>
              <button type="button" onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Movimiento
                  </label>
                  <select
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    name="direction"
                    value={data.direction}
                    onChange={handleInputChange}
                  >
                    <option value="IN">Entrada (+)</option>
                    <option value="OUT">Salida (−)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo</label>
                  <select
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    name="transactionType"
                    value={data.transactionType}
                    disabled
                  >
                    <option value="ADJUSTMENT">Ajuste manual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Método</label>
                  <select
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    name="transactionMethod"
                    value={data.transactionMethod}
                    onChange={handleInputChange}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <InputFloatingComponent
                  label="Monto"
                  type="number"
                  name="transactionNewValue"
                  value={data.transactionNewValue}
                  onChange={handleInputChange}
                />
              </div>
              <InputFloatingComponent
                label="Descripción"
                type="text"
                name="transactionDescription"
                value={data.transactionDescription ?? ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} disabled={isLoading} className={CANCEL_BTN}>
                Cancelar
              </button>
              <button type="button" onClick={handleSave} disabled={isLoading} className={MODAL_SAVE_BTN}>
                <FaSave /> {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {trigger ?? (
        <button type="button" onClick={openModal} className={PRIMARY_BTN}>
          <FaPlus /> Agregar Transacción
        </button>
      )}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
