import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useTenantPermissions from "../hooks/useTenantPermissions.js";
import { useAuth } from "../context/authContext.jsx";

export default function TenantRoleGate() {
    const location = useLocation();
    const { loadingAuth, tenantAccessReady } = useAuth();
    const { canAccessRoute, isTenantAdmin } = useTenantPermissions();

    if (loadingAuth || !tenantAccessReady) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Verificando permisos…
                </div>
            </div>
        );
    }

    if (!canAccessRoute(location.pathname)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
                >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <FaLock className="text-xl" />
                    </div>
                    <h1 className="text-xl font-bold text-dark mb-2">Acceso restringido</h1>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {isTenantAdmin
                            ? "No tienes permiso para acceder a esta sección."
                            : "Esta sección está reservada para administradores del negocio. Contacta al administrador si necesitas acceso."}
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors no-underline"
                    >
                        <FaArrowLeft className="text-xs" />
                        Volver al dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    return <Outlet />;
}
