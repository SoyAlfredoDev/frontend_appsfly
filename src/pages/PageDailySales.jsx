import { useState, useMemo, useCallback } from "react";
import axios from "../api/axios.js";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../components/ui/ExpensePageLayout.jsx";
import { getClosureStatus, closeAllPendingClosures } from "../api/dailySales.js";
import { useToast } from "../context/ToastContext.jsx";
import { useConfirm } from "../context/ConfirmationContext.jsx";
import { useAbortEffect, isAbortError } from "../hooks/useAbortEffect.js";
import {
  FaEye,
  FaLock,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaChartLine,
  FaReceipt,
} from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../components/ui/ExpenseTableCard.jsx";
import {
  PRIMARY_BTN,
  KPI_CARD,
  KPI_ICON_PRIMARY,
  KPI_ICON_SECONDARY,
  KPI_ICON_AMBER,
  KPI_LABEL,
  KPI_VALUE,
  THEAD,
  TH,
  TBODY,
  TR_ROW,
  TD_MUTED,
  TD_AMOUNT,
  ACTION_VIEW,
} from "../utils/expenseUiPatterns.js";
import { formatClosureDate, formatMoney, isDailySalesDayInCurrentMonth } from "../utils/dailySalesUi.js";

export default function PageDailySales() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pendingClosure, setPendingClosure] = useState(null);
  const [pendingDates, setPendingDates] = useState([]);
  const [closingAll, setClosingAll] = useState(false);

  const applyClosureStatus = useCallback((data) => {
    const dates = data?.fechasPendientes ?? [];
    setPendingDates(dates);
    setPendingClosure(data?.error === "BLOQUEO_CIERRE_PENDIENTE" ? data : null);
  }, []);

  /** Una sola petición paralela — evita doble round-trip al montar. */
  const refreshPageData = useCallback(async (signal, { showTableLoading = false } = {}) => {
    if (showTableLoading) setLoading(true);
    try {
      const [listRes, statusRes] = await Promise.all([
        axios.get("/dailySales", { signal }),
        getClosureStatus({ signal }),
      ]);
      setDailySales(listRes.data || []);
      applyClosureStatus(statusRes.data);
    } catch (error) {
      if (!isAbortError(error)) console.error(error);
    } finally {
      if (showTableLoading) setLoading(false);
    }
  }, [applyClosureStatus]);

  useAbortEffect((signal) => {
    refreshPageData(signal, { showTableLoading: true });
  }, [refreshPageData]);

  const runCloseAllPending = async () => {
    const dates = pendingDates;
    if (dates.length === 0) {
      toast.info("Sin pendientes", "No hay cierres diarios pendientes por procesar.");
      return;
    }

    const isConfirmed = await confirm({
      title: "¿Cerrar todos los días pendientes?",
      message: `Se generarán ${dates.length} cierre(s) diario(s) en orden cronológico.`,
      variant: "success",
      confirmText: "Sí, cerrar todos",
      cancelText: "Cancelar",
    });
    if (!isConfirmed) return;

    try {
      setClosingAll(true);
      const res = await closeAllPendingClosures();
      const { closedCount = 0, closed = [] } = res.data ?? {};
      if (closedCount > 0) {
        toast.success(
          "Cierres completados",
          `Se registraron ${closedCount} cierre(s): ${closed.map((c) => c.dailySalesDay).join(", ")}.`,
        );
      } else {
        toast.info("Sin pendientes", res.data?.message ?? "No había cierres pendientes.");
      }
      await refreshPageData(undefined, { showTableLoading: false });
    } catch (error) {
      console.error(error);
      toast.error("Error", "No se pudieron procesar todos los cierres pendientes.");
    } finally {
      setClosingAll(false);
    }
  };

  const submitDailyClose = async (day) => {
    try {
      await axios.post("/dailySales", {
        dailySalesId: uuidv4(),
        dailySalesDay: day,
      });
      toast.success("Cierre realizado", `Cierre diario del ${formatClosureDate(day)} registrado correctamente.`);
      await refreshPageData(undefined, { showTableLoading: false });
    } catch (error) {
      if (error.response?.data?.type === "DUPLICATE_DATE") {
        toast.info("Cierre existente", "Ya existe un cierre registrado para esa fecha.");
      } else if (error.response?.data?.type === "NO_SALES") {
        toast.info("Sin ventas", error.response?.data?.message ?? "No hay ventas ese día para generar cierre.");
      } else {
        toast.error("Error", "No se pudo realizar el cierre. Intente nuevamente.");
      }
    }
  };

  const handleCreateCloseForDate = async (day) => {
    const isConfirmed = await confirm({
      title: "¿Realizar cierre diario?",
      message: `Se generará el cierre para el día ${formatClosureDate(day)}.`,
      variant: "success",
      confirmText: "Sí, cerrar caja",
      cancelText: "Cancelar",
    });
    if (isConfirmed) await submitDailyClose(day);
  };

  const handleCreateClose = async () => {
    const today = new Date().toLocaleDateString("en-CA");
    await handleCreateCloseForDate(today);
  };

  const monthlyDailySales = useMemo(
    () => dailySales.filter((row) => isDailySalesDayInCurrentMonth(row.dailySalesDay)),
    [dailySales]
  );

  const summary = useMemo(() => {
    const totalSales = monthlyDailySales.reduce(
      (acc, d) => acc + Number(d.dailySalesTotalSales ?? 0),
      0
    );
    const totalIncome = monthlyDailySales.reduce(
      (acc, d) => acc + Number(d.dailySalesTotalIncome ?? 0),
      0
    );
    const totalTx = monthlyDailySales.reduce(
      (acc, d) => acc + Number(d.dailySalesNumberOfSales ?? 0),
      0
    );
    return { totalSales, totalIncome, totalTx, count: monthlyDailySales.length };
  }, [monthlyDailySales]);

  const trendData = useMemo(() => {
    return [...dailySales]
      .sort((a, b) => a.dailySalesDay.localeCompare(b.dailySalesDay))
      .slice(-10)
      .map((d) => ({
        date: d.dailySalesDay.slice(5),
        ventas: Number(d.dailySalesTotalSales ?? 0),
        abonado: Number(d.dailySalesTotalIncome ?? 0),
      }));
  }, [dailySales]);

  const columns = [
    {
      header: "Fecha",
      accessorKey: "dailySalesDay",
      cell: (info) => (
        <span className="text-gray-800 font-medium">
          {formatClosureDate(info.getValue())}
        </span>
      ),
    },
    {
      header: "N° Ventas",
      accessorKey: "dailySalesNumberOfSales",
      cell: (info) => <span className="text-gray-600 font-mono text-sm">{info.getValue()}</span>,
    },
    {
      header: "Total Ventas",
      accessorKey: "dailySalesTotalSales",
      cell: (info) => (
        <span className={TD_AMOUNT.replace("px-6 py-4 ", "")}>
          {formatMoney(info.getValue())}
        </span>
      ),
    },
    {
      header: "Total Abonado",
      accessorKey: "dailySalesTotalIncome",
      cell: (info) => (
        <span className="text-blue-600 font-semibold text-sm">{formatMoney(info.getValue())}</span>
      ),
    },
    {
      header: "Pendiente",
      accessorFn: (row) =>
        Number(row.dailySalesTotalSales ?? 0) - Number(row.dailySalesTotalIncome ?? 0),
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className={`text-sm font-semibold ${val > 0 ? "text-red-500" : "text-gray-400"}`}>
            {formatMoney(val)}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      accessorKey: "dailySalesId",
      cell: (info) => (
        <div className="flex items-center justify-center">
          <Link
            to={`/sales/dailySales/view/${info.getValue()}`}
            className={ACTION_VIEW}
            title="Ver detalle completo"
          >
            <FaEye />
          </Link>
        </div>
      ),
    },
  ];

  const filtered = dailySales.filter((row) => {
    if (!globalFilter.trim()) return true;
    return row.dailySalesDay?.includes(globalFilter);
  });

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ExpensePageLayout
      title="Cierres Diarios"
      subtitle="Historial, análisis y gestión de cierres de caja"
      actions={
        <div className="flex flex-wrap gap-2">
          {pendingDates.length > 0 && (
            <button
              type="button"
              onClick={runCloseAllPending}
              disabled={closingAll}
              className={PRIMARY_BTN}
            >
              <FaLock /> {closingAll ? "Cerrando..." : `Cerrar todos (${pendingDates.length})`}
            </button>
          )}
          {pendingClosure?.fechaPendiente && pendingDates.length <= 1 ? (
            <button
              type="button"
              onClick={() => handleCreateCloseForDate(pendingClosure.fechaPendiente)}
              className={PRIMARY_BTN}
              disabled={closingAll}
            >
              <FaLock /> Cerrar día pendiente
            </button>
          ) : (
            <button type="button" onClick={handleCreateClose} className={PRIMARY_BTN} disabled={closingAll}>
              <FaLock /> Realizar Cierre Diario
            </button>
          )}
        </div>
      }
    >
      <AnimatePresence>
        {(pendingClosure?.fechaPendiente || pendingDates.length > 0) && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-start gap-4"
          >
            <div className="flex items-start gap-3 flex-1">
              <FaExclamationTriangle className="text-amber-600 text-lg shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Cierres pendientes detectados</p>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingDates.length > 1
                    ? `${pendingDates.length} días requieren cierre antes de registrar nuevas ventas.`
                    : `Cierra el día ${formatClosureDate(pendingClosure?.fechaPendiente ?? pendingDates[0])} para habilitar ventas.`}
                </p>
              </div>
            </div>
            {pendingDates.length > 0 && !closingAll && (
              <button type="button" onClick={runCloseAllPending} className={`${PRIMARY_BTN} shrink-0`}>
                <FaLock /> Cerrar todos
              </button>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      <ExpenseAnimatedSection className="space-y-6">
        {/* KPI resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={KPI_CARD}>
            <div className={KPI_ICON_PRIMARY}><FaCalendarCheck className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Cierres del mes</p>
              <p className={KPI_VALUE}>{summary.count}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_PRIMARY}><FaMoneyBillWave className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Ventas del mes</p>
              <p className={KPI_VALUE}>{formatMoney(summary.totalSales)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_SECONDARY}><FaChartLine className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Abonado del mes</p>
              <p className={KPI_VALUE}>{formatMoney(summary.totalIncome)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_AMBER}><FaReceipt className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Transacciones del mes</p>
              <p className={KPI_VALUE}>{summary.totalTx}</p>
            </div>
          </div>
        </div>

        {/* Gráfico tendencia */}
        {trendData.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Tendencia de cierres</h3>
            <p className="text-xs text-gray-500 mb-4">Ventas vs. abonado — últimos {trendData.length} cierres</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#01c676" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#01c676" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="abonadoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#094fd1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#094fd1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#9ca3af"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    labelFormatter={(label) => `Día ${label}`}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#01c676" fill="url(#ventasGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="abonado" name="Abonado" stroke="#094fd1" fill="url(#abonadoGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <ExpenseTableCard
          sectionTitle="Historial de cierres"
          recordCount={filtered.length}
          loading={loading}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder="Buscar por fecha..."
        >
          <ExpenseTableScroll>
            <table className="w-full text-left border-collapse">
              <thead className={THEAD}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={header.id === "dailySalesId" ? `${TH} text-center` : TH}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className={TBODY}>
                {loading ? (
                  <ExpenseTableLoading colSpan={columns.length} message="Cargando registros..." />
                ) : filtered.length === 0 ? (
                  <ExpenseTableEmpty
                    colSpan={columns.length}
                    icon={<FaCalendarCheck className="text-4xl text-gray-300" />}
                    title="No hay cierres registrados."
                    hint='Usa "Realizar Cierre Diario" para generar el primero.'
                  />
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${TR_ROW} cursor-pointer`}
                      onClick={() => navigate(`/sales/dailySales/view/${row.original.dailySalesId}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className={TD_MUTED}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </Motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </ExpenseTableScroll>
        </ExpenseTableCard>
      </ExpenseAnimatedSection>
    </ExpensePageLayout>
  );
}
