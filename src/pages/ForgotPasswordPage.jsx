import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent.jsx";
import AuthPageLayout from "../components/auth/AuthPageLayout.jsx";
import AuthPageCard from "../components/auth/AuthPageCard.jsx";
import AuthAlert from "../components/auth/AuthAlert.jsx";
import { forgotPasswordRequest } from "../api/user.js";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await forgotPasswordRequest(email);
            setMessage("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
        } catch (err) {
            console.error(err);
            if (!err.response) {
                setError("No se pudo conectar con el servidor. Por favor intenta más tarde.");
            } else {
                setMessage("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageLayout
            brandTagline="Recuperación de acceso"
            brandTitle={
                <>
                    ¿Olvidaste tu contraseña?
                    <span className="block text-primary mt-1">Te ayudamos a volver.</span>
                </>
            }
            brandDescription="Ingresa tu correo corporativo y te enviaremos un enlace seguro para restablecer tu acceso."
        >
            <AuthPageCard
                title="Recuperar contraseña"
                subtitle="Ingresa tu correo para recibir un enlace de recuperación"
                headerSpacing="mb-6"
            >
                {message && <AuthAlert variant="success">{message}</AuthAlert>}
                {error && <AuthAlert variant="error">{error}</AuthAlert>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        disabled={loading}
                    />

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
                                <span>Enviando...</span>
                            </>
                        ) : (
                            "Enviar enlace"
                        )}
                    </motion.button>

                    <Link to="/login" className="login-ghost-btn">
                        <FaArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Volver al login
                    </Link>
                </form>
            </AuthPageCard>
        </AuthPageLayout>
    );
}
