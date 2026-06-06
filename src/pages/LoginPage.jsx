import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getLoginErrorMessage, isServerUnavailableError } from "../utils/apiErrors.js";
import "./LoginPage.css";

const LOGO_SRC = "/logo_appsfly.png";

export default function LoginPage() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

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
        <div className="login-page">
            <div className="login-page__ambient" aria-hidden="true" />

            <div className="login-page__grid">
                <aside className="login-brand-panel" aria-hidden="true">
                    <Link to="/" className="inline-block">
                        <img
                            src="/logo-appsfly-white.png"
                            alt=""
                            className="h-9 w-auto object-contain opacity-95"
                        />
                    </Link>

                    <div className="max-w-sm">
                        <div className="login-brand-panel__accent-line" />
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            Plataforma B2B
                        </p>
                        <h1 className="text-3xl xl:text-[2rem] font-bold font-display text-white leading-tight">
                            Operaciones claras.
                            <span className="block text-primary mt-1">Decisiones rápidas.</span>
                        </h1>
                        <p className="mt-4 text-sm text-white/70 leading-relaxed font-sans">
                            Ventas, inventario, gastos y reportes en un solo ecosistema.
                            Accede con tu cuenta corporativa.
                        </p>
                    </div>

                    <p className="text-xs text-white/40 font-sans">
                        © {new Date().getFullYear()} AppsFly. Todos los derechos reservados.
                    </p>
                </aside>

                <main className="login-form-column">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full flex justify-center"
                    >
                        <div className="login-card">
                            <div className="login-card__logo-wrap">
                                <Link to="/" className="inline-block">
                                    <img
                                        src={LOGO_SRC}
                                        className="login-card__logo"
                                        alt="AppsFly"
                                    />
                                </Link>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-dark font-display tracking-tight">
                                    Bienvenido
                                </h2>
                                <p className="text-slate-500 text-sm mt-2 font-sans">
                                    Ingresa a tu cuenta para continuar
                                </p>
                            </div>

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

                            <p className="mt-8 text-center text-xs text-slate-500 font-sans">
                                ¿No tienes una cuenta?{" "}
                                <Link
                                    to="/register"
                                    className="login-link text-xs focus:outline-none focus-visible:underline"
                                >
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
