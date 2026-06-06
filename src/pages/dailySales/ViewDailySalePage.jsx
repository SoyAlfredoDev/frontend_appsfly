import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCreditCard,
  FaReceipt,
  FaUser,
  FaClock,
} from "react-icons/fa";
import { getDailySaleDetail } from "../../api/dailySales.js";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, { ExpenseTableScroll } from "../../components/ui/ExpenseTableCard.jsx";
import {
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
  ACTION_VIEW,
  containerVariants,
  itemVariants,
} from "../../utils/expenseUiPatterns.js";
import {
  DAILY_SALE_PAYMENT_METHODS,
  formatClosureDate,
  parseDetailIncome,
  formatMoney,
} from "../../utils/dailySalesUi.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler);

export default function ViewDailySalePage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getDailySaleDetail(id);
        setDetail(res.data);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const closure = detail?.closure;
  const totals = detail?.totals;
  const sales = detail?.sales ?? [];
  const hourlySales = detail?.hourlySales ?? [];

  const detailIncome = useMemo(
    () => parseDetailIncome(closure?.dailySalesDetailIncome),
    [closure],
  );

  const paymentChart = useMemo(() => {
    const values = DAILY_SALE_PAYMENT_METHODS.map((m) => Number(detailIncome[m.id] ?? 0));
    const hasData = values.some((v) => v > 0);
    return {
      hasData,
      data: {
        labels: DAILY_SALE_PAYMENT_METHODS.map((m) => m.label),
        datasets: [
          {
            data: hasData ? values : [1],
            backgroundColor: hasData
              ? DAILY_SALE_PAYMENT_METHODS.map((m) => `${m.color}CC`)
              : ["#e5e7eb"],
            borderColor: hasData
              ? DAILY_SALE_PAYMENT_METHODS.map((m) => m.color)
              : ["#d1d5db"],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
    };
  }, [detailIncome]);

  const hourlyChart = useMemo(() => {
    const active = hourlySales.filter((h) => h.total > 0);
    const source = active.length > 0 ? active : hourlySales.slice(8, 22);
    return {
      labels: source.map((h) => h.label),
      datasets: [
        {
          label: "Ventas ($)",
          data: source.map((h) => h.total),
          backgroundColor: "rgba(1, 198, 118, 0.65)",
          borderColor: "#01c676",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [hourlySales]);

  const paidPercent =
    totals?.sales > 0 ? Math.min(100, Math.round((totals.income / totals.sales) * 100)) : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatMoney(ctx.raw)}`,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          font: { size: 10 },
          callback: (v) => `$${Number(v).toLocaleString("es-CL")}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando detalle del cierre...</p>
        </div>
      </div>
    );
  }

  if (!closure) {
    return (
      <ExpensePageLayout title="Cierre no encontrado" subtitle="El registro solicitado no existe">
        <Link to="/sales/dailySales" className="text-primary hover:underline text-sm inline-flex items-center gap-2">
          <FaArrowLeft /> Volver a cierres diarios
        </Link>
      </ExpensePageLayout>
    );
  }

  const closedBy = `${closure.user?.userFirstName ?? ""} ${closure.user?.userLastName ?? ""}`.trim();

  return (
    <ExpensePageLayout
      title="Detalle de Cierre Diario"
      subtitle={formatClosureDate(closure.dailySalesDay)}
      actions={
        <Link
          to="/sales/dailySales"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft /> Volver
        </Link>
      }
    >
      <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Meta */}
        <Motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Cierre completado
          </span>
          {closedBy && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FaUser className="text-gray-400" /> Registrado por {closedBy}
            </span>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FaClock className="text-gray-400" />
            {new Date(closure.createdAt).toLocaleString("es-CL")}
          </span>
        </Motion.div>

        {/* KPIs */}
        <Motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={KPI_CARD}>
            <div className={KPI_ICON_PRIMARY}><FaMoneyBillWave className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Total ventas</p>
              <p className={KPI_VALUE}>{formatMoney(totals?.sales)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_SECONDARY}><FaCreditCard className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Total abonado</p>
              <p className={KPI_VALUE}>{formatMoney(totals?.income)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className={KPI_ICON_AMBER}><FaReceipt className="text-xl" /></div>
            <div>
              <p className={KPI_LABEL}>Saldo pendiente</p>
              <p className={KPI_VALUE}>{formatMoney(totals?.pending)}</p>
            </div>
          </div>
          <div className={KPI_CARD}>
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <FaShoppingCart className="text-xl" />
            </div>
            <div>
              <p className={KPI_LABEL}>Transacciones</p>
              <p className={KPI_VALUE}>{totals?.transactions ?? 0}</p>
            </div>
          </div>
        </Motion.div>

        {/* Cobranza progress */}
        <Motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">Recaudación del día</p>
              <p className="text-xs text-gray-500 mt-0.5">{paidPercent}% del total vendido fue abonado</p>
            </div>
            <span className="text-sm font-bold text-primary">{paidPercent}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <Motion.div
              initial={{ width: 0 }}
              animate={{ width: `${paidPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Abonado: {formatMoney(totals?.income)}</span>
            <span>Pendiente: {formatMoney(totals?.pending)}</span>
          </div>
        </Motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Ingresos por método de pago</h3>
            <p className="text-xs text-gray-500 mb-4">Distribución de lo abonado en caja</p>
            <div className="h-[280px]">
              <Doughnut data={paymentChart.data} options={chartOptions} />
            </div>
          </Motion.div>

          <Motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Ventas por hora</h3>
            <p className="text-xs text-gray-500 mb-4">Actividad comercial durante el día</p>
            <div className="h-[280px]">
              <Bar data={hourlyChart} options={barOptions} />
            </div>
          </Motion.div>
        </div>

        {/* Payment breakdown table */}
        <Motion.div variants={itemVariants}>
          <ExpenseTableCard sectionTitle="Desglose por método de pago" recordCount={4} showSearch={false}>
            <ExpenseTableScroll>
              <table className="w-full text-left border-collapse">
                <thead className={THEAD}>
                  <tr>
                    <th className={TH}>Método</th>
                    <th className={TH}>Monto abonado</th>
                    <th className={TH}>% del total</th>
                  </tr>
                </thead>
                <tbody className={TBODY}>
                  {DAILY_SALE_PAYMENT_METHODS.map((method) => {
                    const amount = Number(detailIncome[method.id] ?? 0);
                    const pct = totals?.income > 0 ? Math.round((amount / totals.income) * 100) : 0;
                    return (
                      <tr key={method.id} className={TR_ROW}>
                        <td className={TD_MUTED}>
                          <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${method.bg} ${method.text}`}>
                            {method.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-primary font-semibold text-sm">{formatMoney(amount)}</td>
                        <td className={TD_MUTED}>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: method.color }} />
                            </div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ExpenseTableScroll>
          </ExpenseTableCard>
        </Motion.div>

        {/* Sales of the day */}
        <Motion.div variants={itemVariants}>
          <ExpenseTableCard
            sectionTitle="Ventas del día"
            recordCount={sales.length}
            showSearch={false}
          >
            <ExpenseTableScroll>
              <table className="w-full text-left border-collapse">
                <thead className={THEAD}>
                  <tr>
                    <th className={TH}>Hora</th>
                    <th className={TH}>N° Venta</th>
                    <th className={TH}>Cliente</th>
                    <th className={TH}>Items</th>
                    <th className={TH}>Total</th>
                    <th className={TH}>Abonado</th>
                    <th className={TH}>Pendiente</th>
                    <th className={`${TH} text-center`}>Ver</th>
                  </tr>
                </thead>
                <tbody className={TBODY}>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                        No hay ventas registradas para este día.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <Motion.tr
                        key={sale.saleId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={TR_ROW}
                      >
                        <td className={TD_MUTED}>
                          {new Date(sale.createdAt).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{sale.saleNumber ?? "—"}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium text-sm">{sale.customerName || "—"}</td>
                        <td className={TD_MUTED}>{sale.itemsCount}</td>
                        <td className="px-6 py-4 text-primary font-semibold text-sm">{formatMoney(sale.saleTotal)}</td>
                        <td className="px-6 py-4 text-blue-600 font-semibold text-sm">{formatMoney(sale.paid)}</td>
                        <td className={`px-6 py-4 text-sm font-semibold ${sale.pending > 0 ? "text-red-500" : "text-gray-400"}`}>
                          {formatMoney(sale.pending)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Link to={`/sales/view/${sale.saleId}`} className={ACTION_VIEW} title="Ver venta">
                              <FaReceipt />
                            </Link>
                          </div>
                        </td>
                      </Motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </ExpenseTableScroll>
          </ExpenseTableCard>
        </Motion.div>
      </Motion.div>
    </ExpensePageLayout>
  );
}
