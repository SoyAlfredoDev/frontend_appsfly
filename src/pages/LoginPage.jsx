import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import { useAuth } from "../context/authContext.jsx";
import logoappsfly from "../../public/logo_appsfly.png";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(false);

    const [formData, setFormData] = useState({
        userEmail: '',
        userPassword: ''
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
        setError(null);
        setServerError(false);
        setLoading(true);

        try {
            const res = await signin(formData);
            if (!res) {
                setError('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
                setLoading(false);
                return;
            }
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            // Detectar error de red o servidor caído
            if (!error.response) {
                setServerError(true);
            } else {
                setError('Error al iniciar sesión. Intenta nuevamente.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface px-4">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-sm border border-slate-100"
            >
                <div className="text-center mb-8">
                    <Link to="/">
                        <img
                            src={logoappsfly}
                            className="h-12 mx-auto mb-5 object-contain"
                            alt="AppsFly"
                        />
                    </Link>
                    <h2 className="text-2xl font-bold text-dark font-display">Bienvenido</h2>
                    <p className="text-slate-500 text-sm mt-2">Ingresa a tu cuenta para continuar</p>
                </div>

                {serverError && (
                    <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm font-medium border border-amber-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <span className="font-bold">Falla temporal en el sistema</span>
                        </div>
                        <p className="pl-7 text-xs opacity-90">
                            Estamos teniendo problemas de conexión. Por favor intenta nuevamente más tarde. Disculpa las molestias.
                        </p>
                    </div>
                )}

                {error && !serverError && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
                         <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleOnSubmit} className="space-y-5">
                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                    />

                    <div className="space-y-1">
                        <InputFloatingComponent
                            label="Contraseña"
                            type="password"
                            name="userPassword"
                            value={formData.userPassword}
                            onChange={handleInputChange}
                            autoComplete="current-password"
                        />
                        <div className="flex justify-end mt-1">
                            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-emerald-700 transition-colors focus:outline-none focus:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                        
                        <Link 
                            to="/" 
                            className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center text-sm focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </form>
                
                <div className="mt-8 text-center text-xs text-slate-500">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="font-bold text-primary hover:text-emerald-700 transition-colors">
                        Regístrate aquí
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
