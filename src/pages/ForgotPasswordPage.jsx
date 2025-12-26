import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent.jsx";
import logoappsfly from "../../public/logo_appsfly.png";
import {forgotPasswordRequest} from "../api/user.js";

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
            // Usar la instancia de axios configurada o axios directo
            // Asumiendo que hay un interceptor o configuración base, si no, usar URL completa
            await forgotPasswordRequest(email);
            setMessage("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
        } catch (err) {
            console.error(err);
            // Mensaje genérico para no revelar existencia de usuarios, o manejo de error de red
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
                    <h2 className="text-xl font-bold text-slate-800">Recuperar contraseña</h2>
                    <p className="text-slate-500 text-sm mt-1">Ingresa tu correo para recibir un enlace de recuperación</p>
                </div>

                {message && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-md mb-6 text-sm border border-emerald-100">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Enviando...</span>
                            </>
                        ) : (
                            'Enviar enlace'
                        )}
                    </button>

                    <Link 
                        to="/login" 
                        className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                    >
                        Volver al Login
                    </Link>
                </form>
            </motion.div>
        </div>
    );
}
