import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaSearch,
    FaUsers,
    FaUserCheck,
    FaUserPlus,
    FaBuilding,
    FaUserShield,
} from "react-icons/fa";
import { getAdminUsers } from "../../api/admin.js";
import formatDate from "../../utils/formatDate.js";
import PageContainer, { PageHeader } from "../../components/layout/PageContainer.jsx";
import KpiComponent from "../../components/KpiComponent.jsx";
import SelectFloatingComponent from "../../components/inputs/SelectFloatingComponent.jsx";
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

const EMAIL_FILTER_OPTIONS = [
    { value: "ALL", label: "Todos los estados" },
    { value: "CONFIRMED", label: "Email confirmado" },
    { value: "PENDING", label: "Email pendiente" },
];

function formatDateTime(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isNewThisMonth(dateValue) {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const now = new Date();
    return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

function EmailStatusBadge({ confirmed }) {
    if (confirmed) {
        return (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Confirmado
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Pendiente
        </span>
    );
}

function BusinessesCell({ businesses }) {
    if (!businesses?.length) {
        return <span className="text-slate-400 text-sm">Sin empresas</span>;
    }

    const [first, ...rest] = businesses;

    return (
        <div className="space-y-1">
            <Link
                to={`/admin/businesses/${first.businessId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-secondary/80 no-underline"
            >
                <FaBuilding className="text-xs shrink-0" />
                {first.businessName}
            </Link>
            {rest.length > 0 && (
                <p className="text-xs text-slate-400">+{rest.length} empresa{rest.length > 1 ? "s" : ""} más</p>
            )}
        </div>
    );
}

export default function UsersAdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [emailFilter, setEmailFilter] = useState("ALL");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminUsers();
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("[UsersAdmin]", err);
            setError("No se pudieron cargar los usuarios globales.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const metrics = useMemo(() => {
        const newThisMonth = users.filter((u) => isNewThisMonth(u.createdAt)).length;
        const confirmedCount = users.filter((u) => u.userConfirmEmail).length;
        const withBusinesses = users.filter((u) => u.businesses?.length > 0).length;

        return {
            total: users.length,
            newThisMonth,
            confirmedCount,
            withBusinesses,
        };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return users.filter((user) => {
            if (emailFilter === "CONFIRMED" && !user.userConfirmEmail) return false;
            if (emailFilter === "PENDING" && user.userConfirmEmail) return false;

            if (!query) return true;

            const haystack = [
                user.userFirstName,
                user.userLastName,
                user.userEmail,
                user.userPhone,
                ...(user.businesses ?? []).map((b) => b.businessName),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [users, searchQuery, emailFilter]);

    return (
        <PageContainer className="!bg-transparent">
            <div className="space-y-6">
                <PageHeader
                    title="Usuarios globales"
                    subtitle="Cuentas registradas en la plataforma — membresías y estado de verificación"
                />

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiComponent
                        title="Total usuarios"
                        icon={<FaUsers />}
                        value={loading ? null : metrics.total}
                        footer="Cuentas en GeneralDB"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Nuevos este mes"
                        icon={<FaUserPlus />}
                        value={loading ? null : metrics.newThisMonth}
                        footer="Registros del mes en curso"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        title="Email confirmado"
                        icon={<FaUserCheck />}
                        value={loading ? null : metrics.confirmedCount}
                        footer="Cuentas verificadas"
                        loading={loading}
                        isCurrency={false}
                    />
                    <KpiComponent
                        to="/admin/businesses"
                        title="Con empresas"
                        icon={<FaBuilding />}
                        value={loading ? null : metrics.withBusinesses}
                        footer="Vinculados a al menos un tenant"
                        loading={loading}
                        isCurrency={false}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={TABLE_WRAPPER}
                >
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Directorio de usuarios</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatRecordCount(filteredUsers.length, loading)}
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto lg:items-end">
                            <div className="relative flex-1 min-w-[220px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por nombre, correo o empresa…"
                                    className="input-field pl-10 h-11 w-full"
                                    aria-label="Buscar usuarios"
                                />
                            </div>
                            <div className="w-full sm:w-52">
                                <SelectFloatingComponent
                                    label="Email"
                                    name="emailFilter"
                                    value={emailFilter}
                                    onChange={(e) => setEmailFilter(e.target.value)}
                                    options={EMAIL_FILTER_OPTIONS}
                                    required={false}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Usuario</th>
                                    <th className={TH}>Correo</th>
                                    <th className={TH}>Teléfono</th>
                                    <th className={TH}>Empresas</th>
                                    <th className={TH}>Registro</th>
                                    <th className={TH}>Última conexión</th>
                                    <th className={TH}>Estado</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center">
                                            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                                Cargando usuarios…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                                            No hay usuarios que coincidan con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.userId}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={TR_ROW}
                                        >
                                            <td className={TD}>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
                                                        {user.isSuperAdmin ? (
                                                            <FaUserShield className="text-sm" title="Super Admin" />
                                                        ) : (
                                                            <FaUsers className="text-sm" />
                                                        )}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-dark">
                                                            {user.userFirstName} {user.userLastName}
                                                        </p>
                                                        {user.isSuperAdmin && (
                                                            <p className="text-xs text-amber-600 font-medium">
                                                                Super Admin
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TD}>{user.userEmail}</td>
                                            <td className={TD}>{user.userPhone ?? "—"}</td>
                                            <td className={TD}>
                                                <BusinessesCell businesses={user.businesses} />
                                            </td>
                                            <td className={TD}>{formatDate(user.createdAt)}</td>
                                            <td className={TD}>{formatDateTime(user.userLastConnection)}</td>
                                            <td className={TD}>
                                                <EmailStatusBadge confirmed={user.userConfirmEmail} />
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </PageContainer>
    );
}
