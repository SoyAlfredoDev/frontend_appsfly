import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { userIsPlatformOwnerRequest } from "../api/user.js";

export default function PlatformOwnerProtectedView() {
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

        const verify = async () => {
            try {
                const res = await userIsPlatformOwnerRequest();
                if (!cancelled) {
                    setIsAllowed(Boolean(res.data?.isPlatformOwner));
                }
            } catch {
                if (!cancelled) setIsAllowed(false);
            } finally {
                if (!cancelled) setChecking(false);
            }
        };

        verify();
        return () => {
            cancelled = true;
        };
    }, [loadingAuth, isAuthenticated]);

    if (loadingAuth || checking) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <motion.div
                    className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAllowed) {
        return (
            <div className="max-w-lg mx-auto py-16 px-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <FaLock className="text-xl" />
                </div>
                <h1 className="text-xl font-bold text-dark mb-2">Acceso restringido</h1>
                <p className="text-sm text-slate-600 mb-6">
                    La cola de tareas del agente solo está disponible para el propietario autorizado
                    de la plataforma.
                </p>
                <Link
                    to="/admin/dashboard"
                    className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-primary/90"
                >
                    Volver al admin
                </Link>
            </div>
        );
    }

    return <Outlet />;
}
