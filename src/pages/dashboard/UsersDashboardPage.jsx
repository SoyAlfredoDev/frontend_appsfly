import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getMonthlySalesNow,
  getDaySales,
  countSalesMonthRequest,
} from "../../api/sale.js";
import { calculateTotalAvailableByPaymentMethod } from "../../utils/financeUtils.js";
import { useAuth } from "../../context/authContext.jsx";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import KpiComponent from "../../components/KpiComponent.jsx";
import DashboardSalesDetailModal from "../../components/dashboard/DashboardSalesDetailModal.jsx";
import { PageHeader } from "../../components/layout/PageContainer.jsx";
import {
  FaChartLine,
  FaCalendarDay,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaStar,
  FaPlus,
  FaCalendarAlt,
  FaExchangeAlt,
  FaReceipt,
  FaHeadset,
  FaKey,
} from "react-icons/fa";

export default function UsersDashboardPage() {
  const { isSuperAdmin } = useAuth();
  const { isTenantAdmin, can } = useTenantPermissions();

  const [monthlySales, setMonthlySales] = useState(null);
  const [salePendingAmount, setSalePendingAmount] = useState(null);
  const [daySales, setDaySales] = useState(null);
  const [cashAvailable, setCashAvailable] = useState(null);
  const [countSalesMonth, setCountSalesMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesDetail, setSalesDetail] = useState(null);

  const openSalesDetail = (key) => setSalesDetail(DASHBOARD_SALES_VIEWS[key]);
  const closeSalesDetail = () => setSalesDetail(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const day = new Date().getDate();

      try {
        const resDay = await getDaySales(day, month, year);
        setDaySales(resDay.data);
      } catch (error) {
        console.error("Error al obtener las ventas del dia:", error);
      }
      if (isTenantAdmin) {
        try {
          const resMonth = await getMonthlySalesNow();
          setMonthlySales(resMonth.data.saleTotal);
          setSalePendingAmount(resMonth.data.salePendingAmount);
        } catch (error) {
          console.error("Error al obtener las ventas mensuales:", error);
        }
        try {
          const totalCash = await calculateTotalAvailableByPaymentMethod(2);
          setCashAvailable(totalCash);
        } catch (error) {
          console.error("Error al obtener el total de efectivo disponible:", error);
        }
        try {
          const countRes = await countSalesMonthRequest(month, year);
          setCountSalesMonth(countRes.data);
        } catch (error) {
          console.error("Error al obtener el conteo de ventas mensuales:", error);
        }
      } else {
        try {
          const resMonth = await getMonthlySalesNow();
          setMonthlySales(resMonth.data.saleTotal);
        } catch (error) {
          console.error("Error al obtener las ventas mensuales:", error);
        }
        try {
          const countRes = await countSalesMonthRequest(month, year);
          setCountSalesMonth(countRes.data);
        } catch (error) {
          console.error("Error al obtener el conteo de ventas mensuales:", error);
        }
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Dashboard"
          subtitle={
            isTenantAdmin
              ? "Resumen de ventas, caja y accesos rápidos"
              : "Resumen operativo de ventas del día"
          }
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <KpiComponent
          title="Ventas del Día"
          icon={<FaCalendarDay />}
          value={daySales}
          footer="Ventas realizadas hoy · Ver detalle"
          loading={loading}
          onClick={() => openSalesDetail("daySales")}
        />
        <KpiComponent
          title="Ingresos del Día"
          icon={<FaChartLine />}
          value={daySales}
          footer="Ingresos de hoy · Ver detalle"
          loading={loading}
          onClick={() => openSalesDetail("dayIncome")}
        />
        <KpiComponent
          title="Ventas del Mes"
          icon={<FaChartLine />}
          value={monthlySales}
          footer="Acumulado mensual · Ver detalle"
          loading={loading}
          onClick={() => openSalesDetail("monthSales")}
        />
        {isTenantAdmin && (
          <>
            <KpiComponent
              title="Por Cobrar"
              icon={<FaHandHoldingUsd />}
              value={salePendingAmount}
              footer="Pendientes de pago · Ver detalle"
              loading={loading}
              onClick={() => openSalesDetail("pending")}
            />
            <KpiComponent
              title="Efectivo Disponible"
              icon={<FaMoneyBillWave />}
              value={cashAvailable}
              footer="Caja disponible · Ver transacciones"
              loading={loading}
              to="/transactions"
            />
          </>
        )}
        <KpiComponent
          title="Nº de Ventas"
          icon={<FaStar />}
          value={countSalesMonth}
          footer="Ventas del mes actual · Ver detalle"
          loading={loading}
          isCurrency={false}
          onClick={() => openSalesDetail("salesCount")}
        />
      </motion.div>

      <DashboardSalesDetailModal
        isOpen={Boolean(salesDetail)}
        onClose={closeSalesDetail}
        title={salesDetail?.title}
        subtitle={salesDetail?.subtitle}
        filterView={salesDetail?.filterView}
      />

      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-dark mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickAccessLink
            to="/sales/register"
            label="Nueva Venta"
            icon={<FaPlus />}
            tone="primary"
          />
          {can("daily-closures:read") && (
            <QuickAccessLink
              to="/sales/dailySales"
              label="Cierre Diario"
              icon={<FaCalendarAlt />}
              tone="secondary"
            />
          )}
          {can("transactions:read") && (
            <QuickAccessLink
              to="/transactions"
              label="Transacciones"
              icon={<FaExchangeAlt />}
              tone="secondary"
            />
          )}
          {can("expenses:manage") && (
            <QuickAccessLink
              to="/expenses"
              label="Gastos"
              icon={<FaReceipt />}
              tone="neutral"
            />
          )}
          <QuickAccessLink
            to="/support"
            label="Soporte"
            icon={<FaHeadset />}
            tone="neutral"
          />
        </div>
      </motion.div>

      {isSuperAdmin && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-dark mb-4">Super Admin</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAccessLink
              to="/admin/dashboard"
              label="Administración"
              icon={<FaKey />}
              tone="dark"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const DASHBOARD_SALES_VIEWS = {
  daySales: {
    title: "Ventas del día",
    subtitle: "Todas las ventas registradas hoy",
    filterView: "today",
  },
  dayIncome: {
    title: "Ingresos del día",
    subtitle: "Ventas de hoy que generaron ingresos",
    filterView: "today",
  },
  monthSales: {
    title: "Ventas del mes",
    subtitle: "Todas las ventas del mes en curso",
    filterView: "month",
  },
  pending: {
    title: "Por cobrar",
    subtitle: "Ventas del mes con saldo pendiente",
    filterView: "pending",
  },
  salesCount: {
    title: "Nº de ventas del mes",
    subtitle: "Listado de ventas del mes en curso",
    filterView: "month",
  },
};

const toneStyles = {
  primary:
    "bg-primary text-white border-primary hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-secondary border-slate-200 hover:border-secondary/35 hover:shadow-md",
  neutral:
    "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md",
  dark: "bg-white text-dark border-slate-200 hover:border-dark/25 shadow-sm hover:shadow-md",
};

function QuickAccessLink({ to, label, icon, tone = "neutral" }) {
  return (
    <Link to={to} className="no-underline">
      <motion.div
        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center h-full ${toneStyles[tone]}`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-2xl">{icon}</div>
        <span className="font-semibold text-sm">{label}</span>
      </motion.div>
    </Link>
  );
}
