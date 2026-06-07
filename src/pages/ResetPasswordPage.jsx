import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent.jsx";
import AuthPageLayout from "../components/auth/AuthPageLayout.jsx";
import AuthPageCard from "../components/auth/AuthPageCard.jsx";
import AuthAlert from "../components/auth/AuthAlert.jsx";
import { resetPasswordRequest } from "../api/user.js";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        setLoading(true);

        try {
            const newPassword = formData.newPassword;
            await resetPasswordRequest(token, newPassword);
            setMessage("Contraseña actualizada correctamente. Redirigiendo al login...");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Error al restablecer la contraseña. El enlace puede haber expirado.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageLayout
            brandTagline="Seguridad de cuenta"
            brandTitle={
                <>
                    Nueva contraseña.
                    <span className="block text-primary mt-1">Acceso renovado.</span>
                </>
            }
            brandDescription="Elige una contraseña segura para proteger tu cuenta corporativa en AppsFly."
        >
            <AuthPageCard
                title="Nueva contraseña"
                subtitle="Ingresa y confirma tu nueva contraseña"
                headerSpacing="mb-6"
            >
                {message && <AuthAlert variant="success">{message}</AuthAlert>}
                {error && <AuthAlert variant="error">{error}</AuthAlert>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputFloatingComponent
                        label="Nueva contraseña"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                        showPasswordToggle
                        disabled={loading}
                    />

                    <InputFloatingComponent
                        label="Repetir contraseña"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                        showPasswordToggle
                        disabled={loading}
                    />

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={loading ? undefined : { scale: 1.02 }}
                        whileTap={loading ? undefined : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                        className="login-submit-btn mt-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin h-4 w-4" aria-hidden="true" />
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            "Actualizar contraseña"
                        )}
                    </motion.button>

                    <Link to="/login" className="login-ghost-btn">
                        Volver al login
                    </Link>
                </form>
            </AuthPageCard>
        </AuthPageLayout>
    );
}
