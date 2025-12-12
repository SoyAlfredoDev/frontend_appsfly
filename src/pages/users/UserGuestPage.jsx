import NavBarComponent from "../../components/NavBarComponent";
import InputFloatingComponent from '../../components/inputs/InputFloatingComponent';
import { useState } from "react";
import { createUserGuest } from '../../api/userGuest.js';
import { sendEmailRequest } from '../../api/email.js';
import { getInvitationEmailHtml } from '../../email-models/invitationTemplate.js';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "../../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus, FaEnvelope, FaUserTag, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ProtectedView from "../../components/ProtectedView";

const MySwal = withReactContent(Swal);

export default function UserGuestPage() {
    const { businessSelected } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [dataFromForm, setDataFromForm] = useState({
        userGuestId: uuidv4(),
        userGuestEmail: '',
        userGuestBusinessId: businessSelected.userBusinessBusinessId,
        userGuestRole: 'ADMIN',
        userGuestStatus: 'PENDIENT'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataFromForm((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const createNewUserGuest = async () => {
        setIsLoading(true);
        try {
            // 1. Create the guest user in the database
            const response = await createUserGuest(dataFromForm);
            console.log('Usuario invitado creado:', response);

            if (response.status === 201) {
                // 2. Prepare and send the email
                const emailHtml = getInvitationEmailHtml(dataFromForm.userGuestRole);
                
                try {
                    await sendEmailRequest({
                        to: dataFromForm.userGuestEmail,
                        subject: 'Invitación a AppsFly - Bienvenido al Equipo',
                        html: emailHtml
                    });
                    
                    // 3. Success: Invitation created AND email sent
                    await MySwal.fire({
                        icon: 'success',
                        title: '¡Invitación Enviada!',
                        html: `
                            <p class="text-gray-600 mb-2">El usuario ha sido invitado correctamente.</p>
                            <p class="text-sm text-emerald-600 font-semibold">Correo de invitación enviado a ${dataFromForm.userGuestEmail}</p>
                        `,
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Aceptar'
                    });
                } catch (emailError) {
                    console.error('Error enviando email:', emailError);
                    // 3b. Partial Success: Invitation created but email failed
                    await MySwal.fire({
                        icon: 'warning',
                        title: 'Invitación creada, pero hubo un error',
                        text: 'El usuario fue registrado, pero no se pudo enviar el correo automático. Por favor contacta al usuario manualmente.',
                        confirmButtonColor: '#f59e0b',
                        confirmButtonText: 'Entendido'
                    });
                }
                
                navigate('/users');
            } else {
                throw new Error('Estado de respuesta inesperado');
            }
        } catch (error) {
            console.error('Error al crear usuario invitado:', error);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al crear la invitación. Por favor intenta de nuevo.',
                confirmButtonColor: '#ef4444' // red-500
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createNewUserGuest();
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    {/* Content Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Email Input */}
                            <div className="relative">
                                <InputFloatingComponent
                                    label="Correo Electrónico"
                                    type="email"
                                    name='userGuestEmail'
                                    value={dataFromForm.userGuestEmail}
                                    onChange={handleChange}
                                    className="mb-0"
                                />
                                <div className="absolute right-3 top-4 text-gray-400 pointer-events-none">
                                    <FaEnvelope />
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                                    Rol Asignado
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <FaUserTag className="text-gray-400" />
                                    </div>
                                    <select
                                        name='userGuestRole'
                                        value={dataFromForm.userGuestRole}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-10 py-3 text-sm border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer hover:border-emerald-300 bg-gray-50/50"
                                        required
                                    >
                                        <option value="ADMIN">Administrador</option>
                                        <option value="USER">Usuario</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 ml-1">
                                    {dataFromForm.userGuestRole === 'ADMIN' 
                                        ? 'Acceso total a la configuración y gestión del sistema.' 
                                        : 'Acceso limitado a funcionalidades básicas.'}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="mr-2" />
                                            Enviar Invitación
                                        </>
                                    )}
                                </motion.button>
                            </div>

                        </form>
                    </div>
                     {/* Header Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaUserPlus className="text-emerald-600" />
                                Invitar Usuario
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Envía una invitación para unirte al equipo.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/users')}
                            className="flex items-center justify-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            <FaArrowLeft />
                            Volver
                        </button>
                    </div>
                </motion.div>
            </div>
        </ProtectedView>
    );
}
