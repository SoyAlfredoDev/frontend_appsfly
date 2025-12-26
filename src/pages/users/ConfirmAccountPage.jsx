// src/pages/ConfirmAccountPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaRocket } from 'react-icons/fa';
import { useAuth } from '../../context/authContext.jsx';

export default function ConfirmAccountPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Validando tu cuenta...');
    const baseURL = import.meta.env.VITE_API_URL;
    const { user, setUser } = useAuth();
   


    useEffect(() => {
        const confirmAccount = async () => {
            try {
                // Artificial delay for better UX (so the loader is visible)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const response = await axios.put(`${baseURL}/users/${id}/confirm-email`);
                if(response.status === 200 ){
                    setStatus('success');
                    setMessage('¡Tu cuenta ha sido confirmada exitosamente!');
                    
                    // Auto-redirect after 3 seconds
                    setTimeout(() => {                       
                        navigate('/login');
                    }, 3000);
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('Hubo un error al confirmar tu cuenta. El enlace podría haber expirado o ser inválido.');
            }
        };

        confirmAccount();
    }, [id, baseURL, navigate]);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
            <Motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8"
            >
                {/* Header Icon */}
                <div className="mb-6 flex justify-center">
                    {status === 'loading' && (
                        <Motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="bg-emerald-50 p-4 rounded-full text-emerald-600 text-4xl"
                        >
                            <FaSpinner />
                        </Motion.div>
                    )}
                    {status === 'success' && (
                        <Motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            type="spring"
                            stiffness={200}
                            className="bg-green-100 p-4 rounded-full text-green-600 text-4xl"
                        >
                            <FaCheckCircle />
                        </Motion.div>
                    )}
                    {status === 'error' && (
                        <Motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-red-100 p-4 rounded-full text-red-600 text-4xl"
                        >
                            <FaTimesCircle />
                        </Motion.div>
                    )}
                </div>

                {/* Status Message */}
                <h2 className={`text-2xl font-bold mb-3 ${
                    status === 'success' ? 'text-gray-800' : 
                    status === 'error' ? 'text-red-600' : 'text-gray-700'
                }`}>
                    {status === 'loading' ? 'Verificando...' : 
                     status === 'success' ? '¡Todo listo!' : 'Algo salió mal'}
                </h2>
                
                <p className="text-gray-500 mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Actions / Redirect Info */}
                {status === 'success' && (
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <FaSpinner className="animate-spin" />
                            <span>Redirigiendo al inicio...</span>
                        </div>
                        <Link 
                            to="/" 
                            className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Ir al Inicio Ahora
                        </Link>
                    </Motion.div>
                )}

                {status === 'error' && (
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Link 
                            to="/" 
                            className="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-all shadow-md"
                        >
                            Volver al Inicio
                        </Link>
                    </Motion.div>
                )}
            </Motion.div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} AppsFly Technologies
            </div>
        </div>
    );
};