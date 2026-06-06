import { flexRender } from "@tanstack/react-table";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
  THEAD,
  TH,
  TBODY,
  TR_ROW,
  TD_MUTED,
  TD,
} from "../../utils/expenseUiPatterns.js";

export function ExpenseTableHead({ table, centerColumns = [] }) {
  return (
    <thead className={THEAD}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const centered =
              centerColumns.includes(header.column.id) || header.id === "actions";
            const canSort = header.column.getCanSort?.() !== false && header.id !== "actions";
            return (
              <th
                key={header.id}
                className={`${TH} ${centered ? "text-center" : ""} ${canSort ? "cursor-pointer select-none hover:bg-gray-100/80" : ""}`}
                onClick={canSort ? header.column.getToggleSortingHandler?.() : undefined}
              >
                <div className={`flex items-center gap-2 ${centered ? "justify-center" : ""}`}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="text-gray-400">
                      {{
                        asc: <FaSortUp className="text-primary" />,
                        desc: <FaSortDown className="text-primary" />,
                      }[header.column.getIsSorted()] ?? <FaSort size={12} />}
                    </span>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export function ExpenseTableBody({
  table,
  isLoading,
  loadingRow,
  emptyRow,
}) {
  const rows = table.getRowModel().rows;

  return (
    <tbody className={TBODY}>
      <AnimatePresence mode="wait">
        {isLoading
          ? loadingRow
          : rows.length === 0
            ? emptyRow
            : rows.map((row) => (
                <Motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={TR_ROW}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cell.column.id === "actions" ? TD : TD_MUTED}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </Motion.tr>
              ))}
      </AnimatePresence>
    </tbody>
  );
}
