import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
    FaUsers,
    FaBuilding,
    FaTicketAlt,
    FaMoneyBillWave,
    FaCheckCircle,
    FaExclamationCircle,
} from "react-icons/fa";
import { getAdminKpis } from "../../api/admin";
import { getBusiness } from "../../api/business.js";
import formatName from "../../utils/formatName.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import {
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    THEAD,
    TH,
    TBODY,
    TD,
    TR_ROW,
    formatRecordCount,
} from "../../utils/expenseUiPatterns.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
);

export default function DashboardAdminPage() {
    const [kpis, setKpis] = useState(null);
    const [business, setBusiness] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [kpiRes, businessRes] = await Promise.all([
                getAdminKpis(),
                getBusiness(),
            ]);
            setKpis(kpiRes.data);
            setBusiness(Array.isArray(businessRes.data) ? businessRes.data : []);
        } catch (err) {
            console.error("[DashboardAdmin]", err);
            setError("No se pudieron cargar las métricas globales de la plataforma.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const salesData = useMemo(
        () => ({
            labels: kpis?.salesSeries?.map((item) => item.date) || [],
            datasets: [
                {
                    label: "Ingresos ($)",
                    data: kpis?.salesSeries?.map((item) => item.amount) || [],
                    borderColor: "#01c676",
                    backgroundColor: "rgba(1, 198, 118, 0.12)",
                    tension: 0.4,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#01c676",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                },
            ],
        }),
        [kpis],
    );

    const ticketData = useMemo(
        () => ({
            labels: ["Pendientes", "Resueltos"],
            datasets: [
                {
                    data: [kpis?.pendingTickets || 0, kpis?.resolvedTickets || 0],
                    backgroundColor: ["#fbbf24", "#01c676"],
                    borderColor: ["#ffffff", "#ffffff"],
                    borderWidth: 2,
                },
            ],
        }),
        [kpis],
    );

    const recentBusiness = useMemo(() => business.slice(0, 8), [business]);

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title="Panel de administración"
                    subtitle="Monitoreo global de la plataforma AppsFly — empresas, usuarios, ingresos y soporte"
                />

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiComponent
                        to="/admin/businesses"
                        title="Empresas registradas"
                        icon={<FaBuilding />}
                        value={loading ? null : (kpis?.totalBusinesses ?? 0)}
                        footer="Tenants activos en plataforma"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        to="/admin/users"
                        title="Usuarios globales"
                        icon={<FaUsers />}
                        value={loading ? null : (kpis?.totalUsers ?? 0)}
                        footer={
                            loading
                                ? "Cargando…"
                                : `+${kpis?.newUsers ?? 0} nuevos este mes`
                        }
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        to="/admin/payments"
                        title="Ingresos del mes"
                        icon={<FaMoneyBillWave />}
                        value={loading ? null : (kpis?.monthlyRevenue ?? 0)}
                        footer="MRR estimado del SaaS"
                        loading={loading}
                        isCurrency
                    />
                    <KpiComponent
                        to="/admin/tickets"
                        title="Tickets abiertos"
                        icon={<FaTicketAlt />}
                        value={loading ? null : (kpis?.pendingTickets ?? 0)}
                        footer={
                            loading
                                ? "Cargando…"
                                : `${kpis?.totalTickets ?? 0} tickets en total`
                        }
                        loading={loading}
                        isCurrency={false}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-2 card"
                    >
                        <div className="card-header">
                            <h3 className="font-display text-lg font-bold text-dark">
                                Tendencia de ingresos
                            </h3>
                        </div>
                        <div className="card-body h-80">
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                </div>
                            ) : (
                                <Line
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: "#f3f4f6" },
                                            },
                                            x: { grid: { display: false } },
                                        },
                                        plugins: {
                                            legend: {
                                                position: "top",
                                                align: "end",
                                                labels: { usePointStyle: true, boxWidth: 8 },
                                            },
                                        },
                                    }}
                                    data={salesData}
                                />
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="card-header">
                            <h3 className="font-display text-lg font-bold text-dark">
                                Estado de tickets
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="relative flex h-64 items-center justify-center">
                                {loading ? (
                                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                ) : (
                                    <>
                                        <Doughnut
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                cutout: "70%",
                                                plugins: { legend: { position: "bottom" } },
                                            }}
                                            data={ticketData}
                                        />
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-display text-3xl font-bold text-dark">
                                                {kpis?.totalTickets || 0}
                                            </span>
                                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Total
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className={TABLE_WRAPPER}>
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Empresas en plataforma</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatRecordCount(recentBusiness.length, loading)}
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Empresa</th>
                                    <th className={TH}>País</th>
                                    <th className={TH}>Tipo</th>
                                    <th className={TH}>Estado</th>
                                    <th className={`${TH} text-center`}>Setup</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                                Cargando empresas…
                                            </div>
                                        </td>
                                    </tr>
                                ) : recentBusiness.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-500">
                                            No hay empresas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    recentBusiness.map((biz) => {
                                        const setupComplete =
                                            biz?.businessProcess?.createdBusiness &&
                                            biz?.businessProcess?.createdDBneon &&
                                            biz?.businessProcess?.stringConnectionDB &&
                                            biz?.businessProcess?.createdUserBusiness;

                                        return (
                                            <tr key={biz.businessId} className={TR_ROW}>
                                                <td className={`${TD} font-semibold text-dark`}>
                                                    {biz?.businessName}
                                                </td>
                                                <td className={TD}>{formatName(biz?.businessCountry)}</td>
                                                <td className={TD}>
                                                    {biz?.businessType === "optics" && "Óptica"}
                                                    {biz?.businessType === "cafe" && "Cafetería"}
                                                    {biz?.businessType === "veterinary" && "Veterinaria"}
                                                    {biz?.businessType === "hair_salon" && "Peluquería"}
                                                    {biz?.businessType === "clothing_store" && "Tienda"}
                                                    {biz?.businessType === "minimarket" && "Minimarket"}
                                                </td>
                                                <td className={TD}>
                                                    {biz?.businessStatus === "ACTIVE" && (
                                                        <span className="badge-primary">Activo</span>
                                                    )}
                                                    {biz?.businessStatus === "INACTIVE" && (
                                                        <span className="badge bg-slate-100 text-slate-600">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                    {biz?.businessStatus === "PENDING" && (
                                                        <span className="badge bg-amber-100 text-amber-700">
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`${TD} text-center`}>
                                                    {setupComplete ? (
                                                        <FaCheckCircle className="inline text-secondary" title="Configuración completa" />
                                                    ) : (
                                                        <FaExclamationCircle className="inline text-red-400" title="Pendiente configuración" />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
