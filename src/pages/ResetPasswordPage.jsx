import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent.jsx";
import logoappsfly from "../../public/logo_appsfly.png";
import {resetPasswordRequest} from '../api/user.js'

// Configurar axios base URL si no está configurado globalmente

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();    
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al restablecer la contraseña. El enlace puede haber expirado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-slate-200"
            >
                <div className="text-center mb-6">
                    <Link to="/">
                        <img
                            src={logoappsfly}
                            className="h-10 mx-auto mb-4 object-contain"
                            alt="AppsFly"
                        />
                    </Link>
                    <h2 className="text-xl font-bold text-slate-800">Nueva contraseña</h2>
                    <p className="text-slate-500 text-sm mt-1">Ingresa tu nueva contraseña</p>
                </div>

                {message && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-md mb-6 text-sm border border-emerald-100">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 text-sm border border-red-100 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputFloatingComponent
                        label="Nueva contraseña"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                    />

                    <InputFloatingComponent
                        label="Repetir contraseña"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            'Actualizar contraseña'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
