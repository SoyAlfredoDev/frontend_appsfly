import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import AuthPageLayout from "../components/auth/AuthPageLayout.jsx";
import AuthPageCard from "../components/auth/AuthPageCard.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getLoginErrorMessage, isServerUnavailableError } from "../utils/apiErrors.js";

export default function LoginPage() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.registered) {
            toast.success(
                "Registro completado",
                "Inicia sesión con tu correo y contraseña. Revisa tu bandeja para confirmar el email.",
            );
            navigate(location.pathname, { replace: true, state: {} });
        }
        if (location.state?.invitationAccepted) {
            toast.success(
                "Invitación aceptada",
                "Inicia sesión nuevamente para acceder al negocio.",
            );
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, toast]);

    useEffect(() => {
        const emailParam = searchParams.get("email")?.trim().toLowerCase();
        if (emailParam) {
            setFormData((prev) => ({ ...prev, userEmail: emailParam }));
        }
    }, [searchParams]);

    const [formData, setFormData] = useState({
        userEmail: "",
        userPassword: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const payload = {
            userEmail: formData.userEmail.trim().toLowerCase(),
            userPassword: formData.userPassword,
        };

        if (!payload.userEmail || !payload.userPassword) {
            toast.error("Campos incompletos", "Completa correo y contraseña.");
            return;
        }

        setLoading(true);

        try {
            await signin(payload);
            navigate("/dashboard");
        } catch (submitError) {
            console.error(submitError);

            if (isServerUnavailableError(submitError)) {
                toast.error(
                    "Servicio no disponible",
                    getLoginErrorMessage(submitError),
                );
            } else {
                toast.error(
                    "Error al iniciar sesión",
                    getLoginErrorMessage(submitError),
                );
            }
            setLoading(false);
        }
    };

    return (
        <AuthPageLayout>
            <AuthPageCard
                title="Bienvenido"
                subtitle="Ingresa a tu cuenta para continuar"
                footer={
                    <p className="mt-8 text-center text-xs text-slate-500 font-sans">
                        ¿No tienes una cuenta?{" "}
                        <Link
                            to="/register"
                            className="login-link text-xs focus:outline-none focus-visible:underline"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                }
            >
                <form onSubmit={handleOnSubmit} className="space-y-6">
                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={254}
                        disabled={loading}
                    />

                    <div className="space-y-2">
                        <InputFloatingComponent
                            label="Contraseña"
                            type="password"
                            name="userPassword"
                            value={formData.userPassword}
                            onChange={handleInputChange}
                            required
                            autoComplete="current-password"
                            showPasswordToggle
                            maxLength={128}
                            disabled={loading}
                        />
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="login-link text-xs focus:outline-none focus-visible:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-3 pt-1">
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={loading ? undefined : { scale: 1.02 }}
                            whileTap={loading ? undefined : { scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 24 }}
                            className="login-submit-btn"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin h-4 w-4" aria-hidden="true" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                "Iniciar sesión"
                            )}
                        </motion.button>

                        <Link to="/" className="login-ghost-btn">
                            <FaArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Volver al inicio
                        </Link>
                    </div>
                </form>
            </AuthPageCard>
        </AuthPageLayout>
    );
}
