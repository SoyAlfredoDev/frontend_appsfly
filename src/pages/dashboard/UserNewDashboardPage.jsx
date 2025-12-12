import { Link } from "react-router-dom";
import { renderToStaticMarkup } from 'react-dom/server';
import { sendEmailRequest } from '../../api/email.js';
import { RegisterEmail } from '../../email-models/RegisterEmail';
import { useAuth } from "../../context/authContext.jsx";
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaBuilding, FaRocket, FaExclamationTriangle, FaEnvelope } from "react-icons/fa";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function UserNewDashboardPage({ embedded = false }) {
    const { user } = useAuth();
    const [btnConfirmEmail, setBtnConfirmEmail] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const handleConfirmEmail = async () => {
        setSendingEmail(true);
        try {
            const baseURL = import.meta.env.VITE_FRONTEND_URL;
            const emailData = {
                to: user.userEmail,
                subject: 'Confirmación de registro - AppsFly',
                html: renderToStaticMarkup(<RegisterEmail firstName={user.userFirstName} lastName={user.userLastName} confirmationLink={`${baseURL}/users/${user.userId}/confirm-email`} />),
            };
            
            await sendEmailRequest(emailData);
            setBtnConfirmEmail(true);
            
            MySwal.fire({
                icon: 'success',
                title: '¡Correo enviado!',
                text: 'Se ha enviado un correo de confirmación. Importante: revisa tu carpeta de spam.',
                confirmButtonColor: '#10b981',
            });
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al enviar el correo. Por favor intenta más tarde.',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setSendingEmail(false);
        }
    }

    return (
        <div className={embedded ? "w-full" : "min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6"}>
            <Motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${embedded ? 'h-full' : 'max-w-lg'}`}
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white" >
                    <div className="bg-white/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 text-3xl shadow-inner backdrop-blur-sm">
                        <FaRocket />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">¡Bienvenido a AppsFly!</h1>
                    <p className="text-emerald-50 text-sm font-medium opacity-90">Tu plataforma de gestión empresarial</p>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                         <p className="text-gray-600 leading-relaxed">
                            Hola <span className="font-semibold text-gray-800">{user.userFirstName}</span>, notamos que aún no tienes un negocio asociado a tu cuenta.
                        </p>
                        <p className="text-gray-500 text-sm">
                            Para comenzar a utilizar las herramientas, registra tu negocio ahora.
                        </p>
                    </div>

                    {/* Email Verification Alert */}
                    {!user.userConfirmEmail && (
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-start gap-3">
                                <FaExclamationTriangle className="text-amber-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800">Verifica tu correo electrónico</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Para mantener tu cuenta activa y segura, necesitamos confirmar tu email.
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleConfirmEmail}
                                disabled={btnConfirmEmail || sendingEmail}
                                className={`w-full py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                                    ${btnConfirmEmail 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                            >
                                {sendingEmail ? (
                                    <>Enviando...</>
                                ) : btnConfirmEmail ? (
                                    <>Correo Enviado</>
                                ) : (
                                    <>
                                        <FaEnvelope /> Confirmar Correo Ahora
                                    </>
                                )}
                            </button>
                        </Motion.div>
                    )}

                    {/* Action Button */}
                    <Link
                        to="/business/register"
                        className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <FaBuilding className="text-emerald-200 group-hover:text-white transition-colors" />
                        Registrar mi Negocio
                    </Link>

                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-400">
                            ¿Necesitas unirte a un negocio existente? <span className="text-gray-500">Contacta a tu administrador.</span>
                        </p>
                    </div>
                </div>
            </Motion.div>

            {/* Footer / Copyright */}
            <div className="mt-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} AppsFly Technologies
            </div>
        </div>
    );
}
