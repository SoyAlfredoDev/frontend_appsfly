import InputFloatingComponent from "../../components/inputs/InputFloatingComponent";
import FloatingSelectField from "../../components/inputs/FloatingSelectField.jsx";
import { useState, useEffect } from "react";
import { createUserGuest } from "../../api/userGuest.js";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/authContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus, FaPaperPlane, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useToast } from "../../context/ToastContext.jsx";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../../components/ui/ExpensePageLayout.jsx";
import AuthAlert from "../../components/auth/AuthAlert.jsx";
import { PRIMARY_BTN } from "../../utils/expenseUiPatterns.js";
import { TENANT_ROLE_SELECT_OPTIONS } from "../../utils/tenantRoleLabels.js";

export default function UserGuestPage() {
    const { businessSelected, business } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const businessId = businessSelected?.userBusinessBusinessId;
    const businessName = business?.businessName;

    const [dataFromForm, setDataFromForm] = useState({
        userGuestId: uuidv4(),
        userGuestEmail: "",
        userGuestBusinessId: businessId ?? "",
        userGuestRole: "USER",
        userGuestStatus: "PENDIENT",
    });

    useEffect(() => {
        if (businessId) {
            setDataFromForm((prev) => ({ ...prev, userGuestBusinessId: businessId }));
        }
    }, [businessId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataFromForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!businessId) {
            setError("No hay un negocio seleccionado. Selecciona un negocio e intenta de nuevo.");
            return;
        }

        const email = dataFromForm.userGuestEmail.trim().toLowerCase();
        if (!email) {
            setError("Ingresa un correo electrónico válido.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...dataFromForm,
                userGuestEmail: email,
                userGuestBusinessId: businessId,
            };
            const response = await createUserGuest(payload);

            if (response.status === 201) {
                const emailSent = response.data?.emailSent !== false;
                if (emailSent) {
                    toast.success(
                        "Invitación enviada",
                        `Se envió un correo a ${email} para unirse${businessName ? ` a ${businessName}` : ""}.`,
                    );
                } else {
                    toast.info(
                        "Invitación creada",
                        "La invitación se registró pero no pudimos enviar el correo. Reenvíala desde Usuarios.",
                    );
                }
                navigate("/users");
                return;
            }

            setError("No se pudo crear la invitación. Intenta de nuevo.");
        } catch (submitError) {
            const message =
                submitError.response?.data?.message ||
                "Hubo un problema al crear la invitación. Por favor intenta de nuevo.";
            setError(message);
            toast.error("Error al invitar", message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!businessId) {
        return (
            <ExpensePageLayout
                title="Invitar usuario"
                subtitle="Agrega colaboradores a tu negocio"
                actions={
                    <Link to="/users" className="btn-ghost no-underline">
                        <FaArrowLeft /> Volver
                    </Link>
                }
            >
                <AuthAlert variant="info">
                    No tienes un negocio activo seleccionado. Registra o selecciona un negocio antes de
                    invitar usuarios.
                </AuthAlert>
            </ExpensePageLayout>
        );
    }

    return (
        <ExpensePageLayout
            title="Invitar usuario"
            subtitle={
                businessName
                    ? `Envía una invitación para unirse a ${businessName}`
                    : "Envía una invitación para unirte al equipo"
            }
            actions={
                <Link to="/users" className="btn-ghost no-underline">
                    <FaArrowLeft /> Volver a usuarios
                </Link>
            }
        >
            <ExpenseAnimatedSection>
                <div className="card overflow-hidden">
                    <div className="bg-[#021f41] px-6 py-5 text-white border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#01c676]/20 text-[#01c676]">
                                <FaUserPlus />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold font-display text-white">
                                    Nueva invitación
                                </h2>
                                <p className="text-xs text-slate-200 mt-0.5 font-sans">
                                    El invitado recibirá un correo con instrucciones para registrarse o
                                    iniciar sesión.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="card-body space-y-5">
                        {error && <AuthAlert variant="error">{error}</AuthAlert>}

                        <InputFloatingComponent
                            label="Correo electrónico del invitado"
                            type="email"
                            name="userGuestEmail"
                            value={dataFromForm.userGuestEmail}
                            onChange={handleChange}
                            disabled={isLoading}
                            autoComplete="off"
                        />

                        <FloatingSelectField
                            label="Rol asignado"
                            name="userGuestRole"
                            value={dataFromForm.userGuestRole}
                            onChange={handleChange}
                            disabled={isLoading}
                            options={TENANT_ROLE_SELECT_OPTIONS}
                        />

                        <p className="text-xs text-slate-500 font-sans -mt-2">
                            {dataFromForm.userGuestRole === "ADMIN"
                                ? "Acceso total a configuración y gestión del negocio."
                                : "Acceso a operaciones del negocio según permisos del rol."}
                        </p>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={isLoading ? undefined : { scale: 1.01 }}
                            whileTap={isLoading ? undefined : { scale: 0.99 }}
                            className={`${PRIMARY_BTN} w-full justify-center !py-3`}
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Enviando invitación...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    Enviar invitación
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </ExpenseAnimatedSection>
        </ExpensePageLayout>
    );
}
