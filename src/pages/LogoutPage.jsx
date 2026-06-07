import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

/** Cierra sesión y redirige a login (ruta utilitaria post-registro / invitación). */
export default function LogoutPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await logout();
            if (!cancelled) {
                navigate("/login", { replace: true });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [logout, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-slate-500">
            Cerrando sesión…
        </div>
    );
}
