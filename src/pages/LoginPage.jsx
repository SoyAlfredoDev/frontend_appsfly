import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import { useAuth } from "../context/authContext.jsx";
import logoappsfly from "../../public/logoappsfly.png";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        try {
            const res = await signin(formData);
            if (!res) {
                setError('Credenciales incorrectas');
                setLoading(false);
                return;
            }
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
            setError('Error al iniciar sesión');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
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
                    <h2 className="text-xl font-bold text-slate-800">Bienvenido</h2>
                    <p className="text-slate-500 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md mb-4 text-xs font-medium border border-red-100 flex items-center gap-2">
                         <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleOnSubmit} className="space-y-3">
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
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2 space-y-2">
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
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                        
                        <Link 
                            to="/" 
                            className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </form>
                
                <div className="mt-6 text-center text-xs text-slate-500">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                        Regístrate aquí
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
