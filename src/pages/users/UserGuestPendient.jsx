import { useAuth } from "../../context/authContext.jsx";
import { responseUserGuestRequest } from "../../api/userGuest.js";
import { createUserBusinessRequest } from "../../api/userBusiness.js";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaBuilding, FaUserCheck, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { useState } from "react";

const MySwal = withReactContent(Swal);

export default function PendingUserGuest() {
    const { userGuestExists, user } = useAuth();
    const navigate = useNavigate();
    const [processingId, setProcessingId] = useState(null);

    const data = {
        userBusinessId: uuidv4(),
    };

    // Function to handle user response (accept/reject invitation)
    const handleResponseClick = async (
        userGuestId,
        response,
        userGuestBusinessId,
        userGuestRole,
        userBusinessRole
    ) => {
        if (processingId) return; // Prevent multiple clicks globally
        setProcessingId(userGuestId);

        try {
            data.userGuestId = userGuestId;
            data.response = response;

            // --- If rejected ---
            if (response === "REJECTED") {
                try {
                    const res = await responseUserGuestRequest(data);
                    if (res.status === 200) {

                        showAlert(
                            "Invitación rechazada",
                            "Has rechazado la invitación correctamente",
                            "success"
                        );
                        // Refresh the list of pending invitations after a short delay in 3 seconds
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    } else {
                        showAlert("Error", "No se pudo actualizar la invitación", "error");
                        setProcessingId(null);
                    }
                    return;
                } catch (error) {
                    console.error(error);
                    showAlert("Error", "No se pudo actualizar la invitación", "error");
                    setProcessingId(null);
                    return;
                }
            }

            // --- If accepted ---
            try {
                data.userBusinessBusinessId = userGuestBusinessId;
                data.userGuestRole = userGuestRole;
                data.userBusinessRole = userGuestRole;
                const res = await responseUserGuestRequest(data);
                if (res.status === 200) {
                    console.log("Data to create user-business relation:", data);

                    const createRes = await createUserBusinessRequest(data);
                    if (createRes.status === 201) {
                        showAlert(
                            "Invitacion aceptada",
                            "La invitación ha sido actualizada, debe ingresar nuevamente al sistema",
                            "success"
                        );
                        setTimeout(() => {
                            navigate("/logout");
                        }, 5000);
                    } else {
                        showAlert(
                            "Error",
                            "No se pudo crear la relación con el negocio",
                            "error"
                        );
                        setProcessingId(null);
                    }
                } else {
                    showAlert("Error", "No se pudo actualizar la invitación", "error");
                    setProcessingId(null);
                }
            } catch (error) {
                console.error("Error:", error);
                showAlert("Error", "No se pudo crear la relación con el negocio", "error");
                setProcessingId(null);
            }
        } catch (error) {
            console.error(error);
            setProcessingId(null);
        }
    };

    // SweetAlert helper
    const showAlert = (title, text, icon) => {
        MySwal.fire({
            title: <p className="text-lg font-bold text-gray-800">{title}</p>,
            html: <p className="text-gray-600">{text}</p>,
            icon,
            confirmButtonColor: icon === 'success' ? '#10b981' : '#ef4444',
            confirmButtonText: "OK",
        });
    };

    if (!userGuestExists || userGuestExists.length === 0) return null;

    return (
        <div className="w-full">
            <div className="space-y-4">
                <AnimatePresence>
                    {userGuestExists.map((guest, index) => {
                        const isProcessing = processingId === guest.userGuestId;
                        
                        return (
                            <Motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                key={index}
                                className={`relative bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 overflow-hidden w-full transition-all duration-300 ${isProcessing ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                            >
                                {/* Processing Overlay */}
                                {isProcessing && (
                                    <Motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center"
                                    >
                                        <Motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="text-emerald-500 text-3xl mb-3"
                                        >
                                            <FaSpinner />
                                        </Motion.div>
                                        <p className="text-sm font-bold text-gray-700">Procesando solicitud...</p>
                                        <p className="text-xs text-gray-500 mt-1">Por favor espera un momento</p>
                                    </Motion.div>
                                )}

                                <div className="p-5">
                                    <div className="flex flex-col gap-4">
                                        
                                        {/* Header / Icon */}
                                        <div className="flex items-start gap-3">
                                            <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600 flex-shrink-0">
                                                <FaBuilding className="text-lg" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                    <h5 className="text-base font-bold text-gray-800">
                                                        Invitación Pendiente
                                                    </h5>
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                        Nueva
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-snug">
                                                    <span className="font-semibold text-gray-800">{user?.userFirstName}</span>, 
                                                    únete a <span className="font-bold text-emerald-700">{guest.Business?.businessName}</span>.
                                                </p>
                                                
                                                <div className="mt-3 flex flex-col gap-2 text-xs">
                                                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-md">
                                                        <FaUserCheck className="text-emerald-500 flex-shrink-0" />
                                                        <span className="truncate">
                                                            Rol: <span className="font-semibold text-gray-700 capitalize">{guest.userGuestRole === "ADMIN" ? "Admin" : "Usuario"}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-md">
                                                        <span className="font-medium flex-shrink-0">De:</span>
                                                        <span className="text-gray-700 truncate">
                                                            {guest.User?.userFirstName} {guest.User?.userLastName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <button
                                                onClick={() =>
                                                    handleResponseClick(guest.userGuestId, "REJECTED", null, null)
                                                }
                                                disabled={processingId !== null}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide
                                                    ${processingId !== null 
                                                        ? 'opacity-50 cursor-not-allowed bg-red-50' 
                                                        : 'hover:bg-red-50 hover:border-red-300'}`}
                                            >
                                                <FaTimes />
                                                Rechazar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleResponseClick(
                                                        guest.userGuestId,
                                                        "ACCEPTED",
                                                        guest.userGuestBusinessId,
                                                        guest.userGuestRole
                                                    )
                                                }
                                                disabled={processingId !== null}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wide shadow-sm
                                                    ${processingId !== null 
                                                        ? 'opacity-50 cursor-not-allowed' 
                                                        : 'hover:bg-emerald-700 hover:shadow-md'}`}
                                            >
                                                <FaCheck />
                                                Aceptar
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </Motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
