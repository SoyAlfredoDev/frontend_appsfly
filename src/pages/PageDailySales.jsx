import { useState, useMemo, useCallback, useRef } from "react";
import axios from "../api/axios.js";
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
import DataErrorPanel from "../components/ui/DataErrorPanel.tsx";
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
import {
  closureDayKey,
  closureRowsFromPayload,
  formatClosureDate,
  formatMoney,
  isDailySalesDayInCurrentMonth,
} from "../utils/dailySalesUi.js";
import { getTodayBusinessDate, resolveBusinessTimezone } from "../utils/businessTime.js";
import { useAuth } from "../context/authContext.jsx";

export default function PageDailySales() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { business } = useAuth();
  const businessTimezone = resolveBusinessTimezone(business);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dayClosed, setDayClosed] = useState(false);
  const [pendingDates, setPendingDates] = useState([]);
  const [saving, setSaving] = useState(false);
  const closureInProgress = useRef(false);
  const [arqueoDay, setArqueoDay] = useState(null);
  const [countedCash, setCountedCash] = useState("");
  const [loadError, setLoadError] = useState("");

  const applyClosureStatus = useCallback((data) => {
    const dates = Array.isArray(data?.fechasPendientes) ? data.fechasPendientes : [];
    if (dates.length === 0 && data?.error === "BLOQUEO_CIERRE_PENDIENTE" && data.fechaPendiente) {
      setPendingDates([data.fechaPendiente]);
    } else {
      setPendingDates(dates);
    }
    setDayClosed(data?.error === "DAY_CLOSED");
  }, []);

  /** Una sola petición paralela — evita doble round-trip al montar. */
  const refreshPageData = useCallback(async (signal, { showTableLoading = false } = {}) => {
    if (showTableLoading) setLoading(true);
    try {
      const [listRes, statusRes] = await Promise.all([
        axios.get("/dailySales", { signal }),
        getClosureStatus({ signal }),
      ]);
      const rows = closureRowsFromPayload(listRes.data);
      if (rows) {
        setDailySales(rows);
        setLoadError("");
      } else {
        setLoadError("No se pudo leer el historial de cierres.");
      }
      applyClosureStatus(statusRes.data);
    } catch (error) {
      if (!isAbortError(error)) {
        console.error(error);
        setLoadError("No se pudo actualizar los cierres diarios.");
      }
    } finally {
      if (showTableLoading && !signal?.aborted) setLoading(false);
    }
  }, [applyClosureStatus]);

  useAbortEffect((signal) => {
    refreshPageData(signal, { showTableLoading: true });
  }, [refreshPageData]);

  const runClosure = async (action) => {
    if (closureInProgress.current) return;
    closureInProgress.current = true;
    setSaving(true);
    try {
      await action();
    } finally {
      closureInProgress.current = false;
      setSaving(false);
    }
  };

  const handleCreateClose = () => {
    if (pendingDates.length <= 1) {
      setCountedCash("");
      setArqueoDay(pendingDates[0] ?? getTodayBusinessDate(businessTimezone));
      return;
    }

    return runClosure(async () => {
      const isConfirmed = await confirm({
        title: "¿Cerrar los días pendientes?",
        message: `Se registrarán ${pendingDates.length} cierres en orden cronológico. Estos cierres quedarán sin conteo de efectivo.`,
        variant: "success",
        confirmText: "Cerrar días pendientes",
        cancelText: "Cancelar",
      });
      if (!isConfirmed) return;

      try {
        const { data } = await closeAllPendingClosures();
        if (data?.closedCount > 0) {
          toast.success("Cierres completados", `Se registraron ${data.closedCount} cierres.`);
        } else {
          toast.info("Sin pendientes", data?.message ?? "No había cierres pendientes.");
        }
      } catch (error) {
        toast.error("Error", error.response?.data?.message ?? "No se pudieron procesar los cierres pendientes.");
      } finally {
        await refreshPageData();
      }
    });
  };

  const confirmArqueo = () => {
    const amount = Number(countedCash);
    if (!/^\d+$/.test(countedCash.trim()) || amount > 2_147_483_647) {
      toast.info("Conteo requerido", "Ingresa el efectivo contado, en pesos, sin decimales.");
      return;
    }

    return runClosure(async () => {
      try {
        const { data: created } = await axios.post("/dailySales", {
          dailySalesDay: arqueoDay,
          countedCash: amount,
        });
        if (created?.dailySalesId) {
          setDailySales((rows) => [created, ...rows.filter((row) => row.dailySalesId !== created.dailySalesId)]);
        }
        toast.success("Cierre realizado", `Cierre diario del ${formatClosureDate(arqueoDay)} registrado correctamente.`);
        setArqueoDay(null);
        await refreshPageData();
      } catch (error) {
        const data = error.response?.data;
        const code = data?.code ?? data?.type;
        if (code === "DUPLICATE_DATE") {
          toast.info("Cierre existente", "Ya existe un cierre registrado para esa fecha.");
          setArqueoDay(null);
          await refreshPageData();
        } else if (code === "NO_SALES" || code === "CLOSURE_COUNT_INVALID") {
          toast.info(code === "NO_SALES" ? "Sin ventas" : "Conteo inválido", data?.message);
        } else {
          toast.error("Error", data?.message ?? "No se pudo realizar el cierre. Intenta nuevamente.");
        }
      }
    });
  };

  const closureRows = dailySales;

  const monthlyDailySales = useMemo(
    () =>
      closureRows.filter((row) =>
        isDailySalesDayInCurrentMonth(row?.dailySalesDay, new Date(), businessTimezone),
      ),
    [closureRows, businessTimezone]
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
    return [...closureRows]
      .filter((row) => closureDayKey(row?.dailySalesDay))
      .sort((a, b) => closureDayKey(a.dailySalesDay).localeCompare(closureDayKey(b.dailySalesDay)))
      .slice(-10)
      .map((row) => ({
        date: closureDayKey(row.dailySalesDay).slice(5),
        ventas: Number(row.dailySalesTotalSales ?? 0),
        abonado: Number(row.dailySalesTotalIncome ?? 0),
      }));
  }, [closureRows]);

  const columns = useMemo(() => [
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
            aria-label="Ver detalle completo"
          >
            <FaEye />
          </Link>
        </div>
      ),
    },
  ], []);

  const filtered = useMemo(() => {
    const query = globalFilter.trim();
    return query
      ? closureRows.filter((row) => closureDayKey(row?.dailySalesDay).includes(query))
      : closureRows;
  }, [closureRows, globalFilter]);

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
        !arqueoDay && (
          <button
            type="button"
            onClick={handleCreateClose}
            className={PRIMARY_BTN}
            disabled={saving || loading || Boolean(loadError) || (dayClosed && pendingDates.length === 0)}
          >
            <FaLock />
            {saving ? "Cerrando…" : dayClosed && pendingDates.length === 0 ? "Día cerrado" : "Realizar cierre diario"}
          </button>
        )
      }
    >
      <AnimatePresence>
        {pendingDates.length > 0 && (
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
                    : `Cierra el día ${formatClosureDate(pendingDates[0])} para habilitar ventas.`}
                </p>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <DataErrorPanel
          message={loadError}
          onRetry={() => refreshPageData(undefined, { showTableLoading: true })}
        />
      )}

      {arqueoDay && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Arqueo de {formatClosureDate(arqueoDay)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Cuenta el efectivo del cajón. El esperado es el saldo del libro hasta el final de ese día.
            </p>
            <label className="block text-xs text-gray-500 mt-3">
              Efectivo contado
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={countedCash}
                onChange={(event) => setCountedCash(event.target.value)}
                className="mt-1 w-full sm:w-56 h-10 px-3 border border-gray-200 rounded-lg text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setArqueoDay(null)} disabled={saving} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
              Cancelar
            </button>
            <button type="button" onClick={confirmArqueo} disabled={saving} className={PRIMARY_BTN}>
              <FaLock /> {saving ? "Guardando…" : "Guardar cierre"}
            </button>
          </div>
        </div>
      )}

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
                    tickFormatter={(value) => {
                      const amount = Number(value);
                      if (!Number.isFinite(amount)) return "$0";
                      return `$${Math.round(amount / 1000)}k`;
                    }}
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
                ) : filtered.length === 0 && !loadError ? (
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
