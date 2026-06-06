import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion as Motion } from "framer-motion";
import { FaPlus, FaExchangeAlt } from "react-icons/fa";
import AddTransactionModal from "../components/modals/AddTransactionModal.jsx";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableEmpty,
} from "../components/ui/ExpenseTableCard.jsx";
import {
  KPI_CARD,
  KPI_ICON_PRIMARY,
  KPI_LABEL,
  KPI_VALUE,
  THEAD,
  TH,
  TD_MUTED,
  TBODY,
  TR_ROW,
  PRIMARY_BTN,
} from "../utils/expenseUiPatterns.js";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const transactionId = uuidv4();
    setTransactions([
      {
        transactionId,
        transactionDate: new Date().toISOString(),
        transactionType: "ADJUSTMENT",
        transactionMethod: 0,
        transactionTable: "TRANSACTIONS",
        transactionRecordId: transactionId,
        transactionOldValue: null,
        transactionNewValue: 100000,
        transactionDescription: "Ajuste de saldo",
      },
    ]);
  }, []);

  const filtered = transactions.filter((t) => {
    if (!globalFilter.trim()) return true;
    const q = globalFilter.toLowerCase();
    return (
      t.transactionDescription?.toLowerCase().includes(q) ||
      t.transactionType?.toLowerCase().includes(q)
    );
  });

  const formatMoney = (n) =>
    n?.toLocaleString?.("es-CL", { style: "currency", currency: "CLP" }) ?? "—";

  return (
    <ExpensePageLayout
      title="Transacciones"
      subtitle="Movimientos y ajustes financieros del negocio"
      actions={
        <>
          <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_BTN}>
            <FaPlus /> Agregar Transacción
          </button>
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={() => setIsModalOpen(false)}
          />
        </>
      }
    >
      <ExpenseAnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={KPI_CARD}>
            <div className={KPI_ICON_PRIMARY}>
              <FaExchangeAlt className="text-xl" />
            </div>
            <div>
              <p className={KPI_LABEL}>Efectivo disponible</p>
              <p className={KPI_VALUE}>
                {formatMoney(2000000)}
              </p>
            </div>
          </div>
        </div>
      </ExpenseAnimatedSection>

      <ExpenseTableCard
        sectionTitle="Movimientos registrados"
        recordCount={filtered.length}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Buscar por descripción, tipo..."
      >
        <ExpenseTableScroll>
          <table className="w-full text-left border-collapse">
            <thead className={THEAD}>
              <tr>
                <th className={TH}>Fecha</th>
                <th className={TH}>Tipo</th>
                <th className={TH}>Método</th>
                <th className={TH}>Descripción</th>
                <th className={TH}>Monto</th>
              </tr>
            </thead>
            <tbody className={TBODY}>
              {filtered.length === 0 ? (
                <ExpenseTableEmpty
                  colSpan={5}
                  icon={<FaExchangeAlt className="text-4xl text-gray-300" />}
                  title="No se encontraron transacciones."
                />
              ) : (
                filtered.map((transaction) => (
                  <Motion.tr
                    key={transaction.transactionId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={TR_ROW}
                  >
                    <td className={TD_MUTED}>
                      {new Date(transaction.transactionDate).toLocaleString("es-CL")}
                    </td>
                    <td className={TD_MUTED}>{transaction.transactionType}</td>
                    <td className={TD_MUTED}>{transaction.transactionMethod}</td>
                    <td className={TD_MUTED}>{transaction.transactionDescription}</td>
                    <td className="px-6 py-4 text-primary font-semibold text-sm whitespace-nowrap">
                      {formatMoney(transaction.transactionNewValue)}
                    </td>
                  </Motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ExpenseTableScroll>
      </ExpenseTableCard>
    </ExpensePageLayout>
  );
}
