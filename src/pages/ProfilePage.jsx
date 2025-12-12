import { useAuth } from "../context/authContext";
import { renderToStaticMarkup } from 'react-dom/server';
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import { FcOk } from "react-icons/fc";
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaIdCard, FaWhatsapp, FaMapMarkerAlt, FaBriefcase, FaUserCircle } from "react-icons/fa";
import { sendEmailRequest } from '../api/email.js';
import { RegisterEmail } from '../email-models/RegisterEmail';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
    const { user, business, businessSelected } = useAuth();
    const [btnConfirmEmail, setBtnConfirmEmail] = useState(false);

    useEffect(() => {
        console.log('businessSelected', business);
    }, []);

    const handleConfirmEmail = () => {
        const baseURL = import.meta.env.VITE_FRONTEND_URL;
        const emailData = {
            to: user.userEmail,
            subject: 'Confirmación de registro - AppsFly',
            html: renderToStaticMarkup(<RegisterEmail firstName={user.userFirstName} lastName={user.userLastName} confirmationLink={`${baseURL}/users/${user.userId}/confirm-email`} />),
        };
        sendEmailRequest(emailData);
        setBtnConfirmEmail(true);
        alert('Se ha enviado un correo de confirmación. Importante: revisa tu carpeta de spam.');
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <div className="min-h-screen bg-gray-50/50">
                <NavBarComponent />
                <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={containerVariants}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* --- TARJETA DE USUARIO --- */}
                        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm">
                                        <FaUser size={20} />
                                    </div>
                                    <h5 className="text-lg font-bold text-white tracking-wide">Información Personal</h5>
                                </div>
                            </div>
                            <div className="p-5 flex-grow">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-1.5 rounded-md">
                                            <FaUserCircle size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nombre Completo</span>
                                            <p className="text-sm font-bold text-gray-800">
                                                {user?.userFirstName} {user?.userLastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-1.5 rounded-md">
                                            <FaIdCard size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Documento</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{user?.userDocumentType}</span>
                                                <span className="text-sm font-bold text-gray-800">{user?.userDocumentNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-1.5 rounded-md">
                                            <FaEnvelope size={18} />
                                        </div>
                                        <div className="flex-grow">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Correo Electrónico</span>
                                            <div className="flex items-center flex-wrap gap-2">
                                                <span className="text-sm font-bold text-gray-800">{user?.userEmail}</span>
                                                {user?.userConfirmEmail ? (
                                                    <span title="Verificado" className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                        <FcOk /> Aprobado
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={handleConfirmEmail}
                                                        disabled={btnConfirmEmail}
                                                        className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {btnConfirmEmail ? 'Enviado...' : 'Verificar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-1.5 rounded-md">
                                            <FaPhone size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Teléfono</span>
                                            <p className="text-sm font-bold text-gray-800">
                                                {user?.userCodePhoneNumber} {user?.userPhoneNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- TARJETA DE NEGOCIO --- */}
                        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm">
                                            <FaBuilding size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-lg font-bold text-white tracking-wide">Mi Negocio</h5>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${business?.businessStatus === 'ACTIVE' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                                                    <span className={`w-1 h-1 rounded-full mr-1 ${business?.businessStatus === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    {business?.businessStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider backdrop-blur-sm">
                                        {businessSelected?.userBusinessRole === 'ADMIN' && 'ADMIN'}
                                        {businessSelected?.userBusinessRole === 'USER' && 'USER'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-grow">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-slate-100 text-slate-600 p-1.5 rounded-md">
                                            <FaBuilding size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Razón Social</span>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">
                                                {business?.businessName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-slate-100 text-slate-600 p-1.5 rounded-md">
                                            <FaIdCard size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">NIT / RUT</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{business?.businessDocumentType || 'ID'}</span>
                                                <span className="text-sm font-bold text-gray-800">{business?.businessDocumentNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-slate-100 text-slate-600 p-1.5 rounded-md">
                                            <FaBriefcase size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rubro</span>
                                            <p className="text-sm font-medium text-gray-800 capitalize">
                                                {business?.businessType}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-green-50 text-green-600 p-1.5 rounded-md">
                                            <FaWhatsapp size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">WhatsApp Business</span>
                                            <div className="">
                                                <a 
                                                    target="_blank" 
                                                    href={`https://wa.me/${business?.businessCodeWhatsappNumber}${business?.businessWhatsappNumber}`} 
                                                    className="text-sm font-bold text-gray-800 hover:text-green-600 transition-colors inline-flex items-center gap-1"
                                                    rel="noreferrer"
                                                >
                                                    {business?.businessCodeWhatsappNumber} {business?.businessWhatsappNumber}
                                                    <span className="text-[10px] text-gray-400 font-normal ml-0.5">↗</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-slate-100 text-slate-600 p-1.5 rounded-md">
                                            <FaEnvelope size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email de Contacto</span>
                                            <p className="text-sm font-medium text-gray-800">
                                                {business?.businessEmail}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="mt-0.5 bg-slate-100 text-slate-600 p-1.5 rounded-md">
                                            <FaMapMarkerAlt size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">País</span>
                                            <p className="text-sm font-medium text-gray-800 capitalize">
                                                {business?.businessCountry}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </ProtectedView>
    );
}