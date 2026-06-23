import { useAuth } from "../../context/authContext.jsx";
import { responseUserGuestRequest } from "../../api/userGuest.js";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaBuilding, FaUserCheck, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { getTenantRoleLabel } from "../../utils/tenantRoleLabels.js";
import "../../styles/AuthPage.css";

export default function PendingUserGuest() {
    const { userGuestExists, user, logout, searchUserGuestExists, reloadTenantContext } =
        useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [processingId, setProcessingId] = useState(null);

    const handleResponseClick = async (
        userGuestId,
        response,
        userGuestBusinessId,
        userGuestRole,
    ) => {
        if (processingId) return;
        setProcessingId(userGuestId);

        try {
            const payload = {
                userGuestId,
                response,
                userGuestRole,
                userBusinessBusinessId: userGuestBusinessId,
            };

            if (response === "REJECTED") {
                const res = await responseUserGuestRequest(payload);
                if (res.status === 200) {
                    toast.success("Invitación rechazada", "Has rechazado la invitación correctamente.");
                    await searchUserGuestExists();
                    setProcessingId(null);
                } else {
                    toast.error("Error", "No se pudo actualizar la invitación.");
                    setProcessingId(null);
                }
                return;
            }

            const res = await responseUserGuestRequest(payload);
            if (res.status === 200) {
                toast.success(
                    "Invitación aceptada",
                    "Tu acceso fue configurado. Inicia sesión nuevamente para entrar al negocio.",
                );
                await reloadTenantContext(user?.userId);
                setTimeout(async () => {
                    await logout();
                    navigate("/login", {
                        replace: true,
                        state: { invitationAccepted: true },
                    });
                }, 2000);
            } else {
                toast.error("Error", "No se pudo aceptar la invitación.");
                setProcessingId(null);
            }
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message ||
                "No se pudo procesar la invitación. Intenta de nuevo.";
            toast.error("Error", message);
            setProcessingId(null);
        }
    };

    if (!userGuestExists || userGuestExists.length === 0) return null;

    return (
        <div className="w-full">
            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-[#021f41] px-4 py-4 text-white shadow-lg">
                <h3 className="text-base font-bold font-display tracking-tight text-white">
                    Invitaciones pendientes
                </h3>
                <p className="text-xs text-slate-200 mt-1 font-sans">
                    Acepta o rechaza para unirte a un negocio
                </p>
            </div>

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
                                key={guest.userGuestId ?? index}
                                className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl w-full transition-all duration-300 ${
                                    isProcessing ? "ring-2 ring-primary ring-offset-2" : ""
                                }`}
                            >
                                {isProcessing && (
                                    <Motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center"
                                    >
                                        <Motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: "linear",
                                            }}
                                            className="text-primary text-3xl mb-3"
                                        >
                                            <FaSpinner />
                                        </Motion.div>
                                        <p className="text-sm font-bold text-dark">
                                            Procesando solicitud...
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 font-sans">
                                            Por favor espera un momento
                                        </p>
                                    </Motion.div>
                                )}

                                <div className="border-l-4 border-primary p-5">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2.5 rounded-full text-primary flex-shrink-0">
                                                <FaBuilding className="text-lg" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                    <h5 className="text-base font-bold text-dark font-display">
                                                        Invitación pendiente
                                                    </h5>
                                                    <span className="badge-primary text-[10px] uppercase tracking-wide">
                                                        Nueva
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-snug font-sans">
                                                    <span className="font-semibold text-dark">
                                                        {user?.userFirstName}
                                                    </span>
                                                    , únete a{" "}
                                                    <span className="font-bold text-primary">
                                                        {guest.Business?.businessName}
                                                    </span>
                                                    .
                                                </p>

                                                <div className="mt-3 flex flex-col gap-2 text-xs">
                                                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                                                        <FaUserCheck className="text-primary flex-shrink-0" />
                                                        <span className="truncate font-sans">
                                                            Rol:{" "}
                                                            <span className="font-semibold text-dark capitalize">
                                                                {getTenantRoleLabel(guest.userGuestRole)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg font-sans">
                                                        <span className="font-medium flex-shrink-0">
                                                            De:
                                                        </span>
                                                        <span className="text-dark truncate">
                                                            {guest.User?.userFirstName}{" "}
                                                            {guest.User?.userLastName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleResponseClick(
                                                        guest.userGuestId,
                                                        "REJECTED",
                                                        null,
                                                        null,
                                                    )
                                                }
                                                disabled={processingId !== null}
                                                className={`btn-ghost !text-xs !py-2 !px-3 !font-bold uppercase tracking-wide !text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-300 ${
                                                    processingId !== null
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                <FaTimes />
                                                Rechazar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleResponseClick(
                                                        guest.userGuestId,
                                                        "ACCEPTED",
                                                        guest.userGuestBusinessId,
                                                        guest.userGuestRole,
                                                    )
                                                }
                                                disabled={processingId !== null}
                                                className={`login-submit-btn !text-xs !py-2 !px-3 uppercase tracking-wide ${
                                                    processingId !== null
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
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
