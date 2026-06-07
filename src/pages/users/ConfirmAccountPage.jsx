import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion as Motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import AuthPageLayout from "../../components/auth/AuthPageLayout.jsx";
import AuthPageCard from "../../components/auth/AuthPageCard.jsx";

export default function ConfirmAccountPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Validando tu cuenta...");
    const baseURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const confirmAccount = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1500));

                const response = await axios.put(`${baseURL}/users/${id}/confirm-email`);
                if (response.status === 200) {
                    setStatus("success");
                    setMessage("¡Tu cuenta ha sido confirmada exitosamente!");

                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                }
            } catch (error) {
                console.error(error);
                setStatus("error");
                setMessage(
                    "Hubo un error al confirmar tu cuenta. El enlace podría haber expirado o ser inválido.",
                );
            }
        };

        confirmAccount();
    }, [id, baseURL, navigate]);

    const statusTitle =
        status === "loading"
            ? "Verificando..."
            : status === "success"
              ? "¡Todo listo!"
              : "Algo salió mal";

    return (
        <AuthPageLayout
            brandTagline="Confirmación de cuenta"
            brandTitle={
                <>
                    Un paso más.
                    <span className="block text-primary mt-1">Cuenta verificada.</span>
                </>
            }
            brandDescription="Estamos validando tu correo para activar tu acceso seguro a AppsFly."
        >
            <AuthPageCard headerSpacing="mb-4">
                <div className="login-status-icon">
                    {status === "loading" && (
                        <Motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="login-status-icon__circle login-status-icon__circle--loading"
                        >
                            <FaSpinner />
                        </Motion.div>
                    )}
                    {status === "success" && (
                        <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="login-status-icon__circle login-status-icon__circle--success"
                        >
                            <FaCheckCircle />
                        </Motion.div>
                    )}
                    {status === "error" && (
                        <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="login-status-icon__circle login-status-icon__circle--error"
                        >
                            <FaTimesCircle />
                        </Motion.div>
                    )}
                </div>

                <div className="text-center mb-6">
                    <h2
                        className={`text-2xl font-bold font-display tracking-tight mb-3 ${
                            status === "error" ? "text-red-600" : "text-dark"
                        }`}
                    >
                        {statusTitle}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-sans">{message}</p>
                </div>

                {status === "success" && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 font-sans">
                            <FaSpinner className="animate-spin" />
                            <span>Redirigiendo al login...</span>
                        </div>
                        <Link to="/login" className="login-submit-btn">
                            Ir al login ahora
                        </Link>
                    </Motion.div>
                )}

                {status === "error" && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        <Link to="/login" className="login-submit-btn">
                            Ir al login
                        </Link>
                        <Link to="/" className="login-ghost-btn">
                            Volver al inicio
                        </Link>
                    </Motion.div>
                )}
            </AuthPageCard>
        </AuthPageLayout>
    );
}
