import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExchangeAlt } from "react-icons/fa";
import formatDate from "../../utils/formatDate.js";
import {
    parseTransactionAmount,
    formatPaymentMethod,
    formatTransactionType,
    formatSignedAmount,
    formatUserName,
    TRANSACTION_DIRECTION_LABELS,
} from "../../utils/transactionUtils.js";

export default function ViewTransactionModal({ transaction, isOpen, onClose }) {
    if (!isOpen || !transaction) return null;

    const { amount, direction } = parseTransactionAmount(transaction);
    const isOut = direction === "OUT";

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <Motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaExchangeAlt className="text-primary" />
                                Detalle de transacción
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto text-sm">
                            <div className="text-center py-2">
                                <p
                                    className={`text-3xl font-bold font-display ${
                                        isOut ? "text-red-600" : "text-emerald-600"
                                    }`}
                                >
                                    {formatSignedAmount(transaction)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                                    {TRANSACTION_DIRECTION_LABELS[direction] ?? direction}
                                </p>
                            </div>

                            <dl className="grid grid-cols-1 gap-3">
                                <DetailRow
                                    label="Fecha"
                                    value={formatDate(transaction.createdAt)}
                                />
                                <DetailRow
                                    label="Tipo"
                                    value={formatTransactionType(transaction.transactionType)}
                                />
                                <DetailRow
                                    label="Método"
                                    value={formatPaymentMethod(transaction.transactionMethod)}
                                />
                                <DetailRow
                                    label="Descripción"
                                    value={transaction.transactionDescription || "—"}
                                />
                                <DetailRow
                                    label="Origen"
                                    value={
                                        transaction.transactionTable
                                            ? `${transaction.transactionTable}${
                                                  transaction.transactionRecordId
                                                      ? ` · ${transaction.transactionRecordId}`
                                                      : ""
                                              }`
                                            : "—"
                                    }
                                />
                                <DetailRow
                                    label="Registrado por"
                                    value={formatUserName(transaction.user)}
                                />
                                <DetailRow
                                    label="Monto"
                                    value={amount.toLocaleString("es-CL", {
                                        style: "currency",
                                        currency: "CLP",
                                    })}
                                />
                            </dl>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-50">
            <dt className="text-gray-500 font-medium">{label}</dt>
            <dd className="text-gray-900 sm:text-right break-all">{value}</dd>
        </div>
    );
}
