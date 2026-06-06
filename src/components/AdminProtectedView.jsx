import { useEffect, useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/authContext.jsx";
import { userIsSuperAdminRequest } from "../api/user.js";

export default function AdminProtectedView() {
    const { loadingAuth, isAuthenticated } = useAuth();
    const [checking, setChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        if (loadingAuth) return;

        if (!isAuthenticated) {
            setChecking(false);
            setIsAllowed(false);
            return;
        }

        let cancelled = false;

        const verifySuperAdmin = async () => {
            try {
                const res = await userIsSuperAdminRequest();
                if (!cancelled) {
                    setIsAllowed(Boolean(res.data?.isSuperAdmin));
                }
            } catch {
                if (!cancelled) {
                    setIsAllowed(false);
                }
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        };

        verifySuperAdmin();
        return () => {
            cancelled = true;
        };
    }, [loadingAuth, isAuthenticated]);

    if (loadingAuth || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-slate-400 text-sm font-medium tracking-wide">
                        Verificando permisos de administración…
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark px-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full rounded-xl border border-white/10 bg-dark-muted p-8 text-center shadow-2xl"
                >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                        <FaLock className="text-xl" />
                    </div>
                    <h1 className="text-xl font-bold font-display text-white mb-2">
                        Acceso denegado
                    </h1>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        Esta sección está reservada para administradores principales de AppsFly.
                        Si crees que es un error, contacta al equipo de soporte.
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary-hover transition-colors"
                    >
                        <FaArrowLeft className="text-xs" />
                        Volver al panel del negocio
                    </Link>
                </motion.div>
            </div>
        );
    }

    return <Outlet />;
}
