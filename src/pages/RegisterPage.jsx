import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import SelectFloatingComponent from "../components/inputs/SelectFloatingComponent";
import AuthPageLayout from "../components/auth/AuthPageLayout.jsx";
import AuthPageCard from "../components/auth/AuthPageCard.jsx";
import AuthAlert from "../components/auth/AuthAlert.jsx";
import validateRut from "../libs/validateRut.js";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { v4 as uuidv4 } from "uuid";
import { getInvitePreviewRequest } from "../api/userGuest.js";

const validateForm = (data) => ({
    userFirstName: data.userFirstName.trim() !== "",
    userLastName: data.userLastName.trim() !== "",
    userEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail.trim()),
    userPassword: data.userPassword.length >= 8,
    userPasswordConfirmation:
        data.userPasswordConfirmation === data.userPassword &&
        data.userPasswordConfirmation.length > 0,
    userDocumentType: !!data.userDocumentType?.trim(),
    userDocumentNumber: data.userDocumentNumber.trim().length > 0,
    userCodePhoneNumber: data.userCodePhoneNumber.trim().startsWith("+"),
    userPhoneNumber: /^\d{7,15}$/.test(data.userPhoneNumber.trim()),
});

export default function RegisterPage() {
    const { signup, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [invitationContext, setInvitationContext] = useState(null);
    const [formData, setFormData] = useState({
        userId: uuidv4(),
        userFirstName: "",
        userLastName: "",
        userEmail: "",
        userPassword: "",
        userPasswordConfirmation: "",
        userDocumentType: "rut",
        userDocumentNumber: "",
        userCodePhoneNumber: "+56",
        userPhoneNumber: "",
    });
    const [validations, setValidations] = useState({});
    const [error, setError] = useState(null);
    const countryCodes = [
        { id: "+56", name: "Chile" },
        { id: "+54", name: "Argentina" },
        { id: "+61", name: "Australia" },
        { id: "+32", name: "Bélgica" },
        { id: "+591", name: "Bolivia" },
        { id: "+55", name: "Brasil" },
        { id: "+57", name: "Colombia" },
        { id: "+506", name: "Costa Rica" },
        { id: "+593", name: "Ecuador" },
        { id: "+34", name: "España" },
        { id: "+33", name: "Francia" },
        { id: "+49", name: "Alemania" },
        { id: "+39", name: "Italia" },
        { id: "+81", name: "Japón" },
        { id: "+52", name: "México" },
        { id: "+51", name: "Perú" },
        { id: "+44", name: "Reino Unido" },
        { id: "+1", name: "Estados Unidos" },
        { id: "+598", name: "Uruguay" },
        { id: "+58", name: "Venezuela" },
    ];

    useEffect(() => {
        const inviteId = searchParams.get("invite");
        const emailParam = searchParams.get("email")?.trim().toLowerCase() || null;

        if (!inviteId && !emailParam) return;

        const applyInvitationEmail = (email, meta = {}) => {
            setFormData((prev) => ({ ...prev, userEmail: email }));
            setInvitationContext({
                email,
                userGuestId: meta.userGuestId ?? inviteId ?? null,
                businessName: meta.businessName ?? null,
            });
        };

        if (inviteId) {
            setInviteLoading(true);
            getInvitePreviewRequest(inviteId)
                .then((res) => {
                    applyInvitationEmail(res.data.userGuestEmail, res.data);
                })
                .catch(() => {
                    if (emailParam) {
                        applyInvitationEmail(emailParam, { userGuestId: inviteId });
                    } else {
                        setError("No se pudo validar la invitación. Verifica el enlace del correo.");
                    }
                })
                .finally(() => setInviteLoading(false));
            return;
        }

        if (emailParam) {
            applyInvitationEmail(emailParam);
        }
    }, [searchParams]);

    const isEmailLocked = Boolean(invitationContext?.email);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "userEmail" && isEmailLocked) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOnBlur = () => {};

    const validatePassword = (pwd) => {
        const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(pwd);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const newValidation = validateForm(formData);
        setValidations(newValidation);

        const rutFormated = validateRut(formData.userDocumentNumber);
        const passwordValidated = validatePassword(formData.userPassword);
        if (rutFormated === false && formData.userDocumentType === "rut") {
            setValidations((prev) => ({ ...prev, userDocumentNumber: false }));
            setError("Por favor, ingrese un rut válido ej:(12345678-K)");
            setIsLoading(false);
            return;
        }

        if (!passwordValidated) {
            setValidations((prev) => ({
                ...prev,
                userPassword: false,
                userPasswordConfirmation: false,
            }));
            setError(
                "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula y al menos un número.",
            );
            setIsLoading(false);
            return;
        }
        if (Object.values(newValidation).some((v) => v === false)) {
            setError("Por favor, corrige los campos inválidos.");
            setIsLoading(false);
            return;
        }
        setError(null);
        try {
            const payload = {
                ...formData,
                userGuestId: invitationContext?.userGuestId ?? undefined,
            };
            const res = await signup(payload);
            if (res.error === 1) {
                setValidations((prev) => ({ ...prev, userEmail: false }));
                setError("El correo electrónico ya está en uso.");
                setIsLoading(false);
                return;
            } else if (res?.error === 2) {
                setValidations((prev) => ({
                    ...prev,
                    userPassword: false,
                    userPasswordConfirmation: false,
                }));
                setError("Las contraseñas no coinciden.");
                setIsLoading(false);
                return;
            } else if (res?.error === 3) {
                setError("La invitación no es válida o ya expiró.");
                setIsLoading(false);
                return;
            } else if (res?.error === 4) {
                setValidations((prev) => ({ ...prev, userEmail: false }));
                setError("Debes registrarte con el correo al que se envió la invitación.");
                setIsLoading(false);
                return;
            }
            if (res.userId) {
                if (res.emailSent === false) {
                    toast.info(
                        "Cuenta creada",
                        "No pudimos enviar el correo de confirmación. Puedes reenviarlo desde el panel tras iniciar sesión.",
                    );
                } else {
                    toast.success(
                        "Su registro se completó exitosamente",
                        "Revisa tu correo y luego inicia sesión",
                    );
                }
                await logout();
                navigate("/login", { replace: true, state: { registered: true } });
            } else {
                toast.error("Hubo un error al registrarse.", "Por favor, intente de nuevo.");
                setIsLoading(false);
                setError(res?.data?.message || "Hubo un error al registrarse.");
            }
        } catch (err) {
            console.log(err);
            setError("Hubo un error al registrarse.");
            setIsLoading(false);
        }
    };

    return (
        <AuthPageLayout
            brandTagline="Alta de cuenta"
            brandTitle={
                <>
                    Comienza hoy.
                    <span className="block text-primary mt-1">Gestiona tu negocio.</span>
                </>
            }
            brandDescription="Crea tu cuenta corporativa y accede a ventas, inventario, gastos y reportes en un solo lugar."
        >
            <AuthPageCard
                wide
                title={invitationContext ? "Crear cuenta con invitación" : "Crear cuenta nueva"}
                subtitle={
                    invitationContext?.businessName
                        ? `Regístrate para unirte a ${invitationContext.businessName}`
                        : "Gestiona tu negocio de forma simple"
                }
                headerSpacing="mb-6"
                footer={
                    <p className="mt-6 text-center text-xs text-slate-500 font-sans">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            to={
                                invitationContext?.email
                                    ? `/login?email=${encodeURIComponent(invitationContext.email)}`
                                    : "/login"
                            }
                            className="login-link text-xs focus:outline-none focus-visible:underline"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                }
            >
                {error && <AuthAlert variant="error">{error}</AuthAlert>}

                {invitationContext && (
                    <AuthAlert variant="info">
                        Tu correo está fijado por la invitación recibida
                        {invitationContext.businessName
                            ? ` para unirte a ${invitationContext.businessName}`
                            : ""}
                        . Debes registrarte con ese email para aceptar la invitación.
                    </AuthAlert>
                )}

                <form onSubmit={handleOnSubmit} className="space-y-3" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputFloatingComponent
                            label="Nombre"
                            name="userFirstName"
                            value={formData.userFirstName}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="given-name"
                            isValid={validations.userFirstName}
                            disabled={isLoading}
                        />
                        <InputFloatingComponent
                            label="Apellido"
                            name="userLastName"
                            value={formData.userLastName}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="family-name"
                            isValid={validations.userLastName}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <SelectFloatingComponent
                                label="Tipo Documento"
                                name="userDocumentType"
                                value={formData.userDocumentType}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userDocumentType}
                                options={[
                                    { value: "rut", label: "RUT" },
                                    { value: "passport", label: "Pasaporte" },
                                    { value: "other", label: "Otro" },
                                ]}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <InputFloatingComponent
                                label="Número de documento"
                                name="userDocumentNumber"
                                value={formData.userDocumentNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userDocumentNumber}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <SelectFloatingComponent
                                label="Código"
                                name="userCodePhoneNumber"
                                value={formData.userCodePhoneNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userCodePhoneNumber}
                                options={countryCodes.map((c) => ({
                                    value: c.id,
                                    label: `${c.name} (${c.id})`,
                                }))}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <InputFloatingComponent
                                label="Número de Teléfono"
                                type="number"
                                name="userPhoneNumber"
                                value={formData.userPhoneNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userPhoneNumber}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        onBlur={handleOnBlur}
                        autoComplete="email"
                        isValid={validations.userEmail}
                        readOnly={isEmailLocked}
                        disabled={isLoading || inviteLoading || isEmailLocked}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputFloatingComponent
                            label="Contraseña"
                            type="password"
                            name="userPassword"
                            value={formData.userPassword}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="new-password"
                            isValid={validations.userPassword}
                            disabled={isLoading}
                        />
                        <InputFloatingComponent
                            label="Confirmar contraseña"
                            type="password"
                            name="userPasswordConfirmation"
                            value={formData.userPasswordConfirmation}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="new-password"
                            isValid={validations.userPasswordConfirmation}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-2 mb-2 font-sans">
                        Al hacer clic en <strong className="text-slate-700">Regístrarme</strong>, acepto
                        los{" "}
                        <a
                            href="/terminos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="login-link text-xs"
                        >
                            términos y condiciones
                        </a>{" "}
                        y las{" "}
                        <a
                            href="/politicas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="login-link text-xs"
                        >
                            políticas de privacidad
                        </a>{" "}
                        de AppsFly.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={isLoading ? undefined : { scale: 1.02 }}
                            whileTap={isLoading ? undefined : { scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 24 }}
                            className="login-submit-btn"
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin h-4 w-4" aria-hidden="true" />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                "Regístrarme"
                            )}
                        </motion.button>
                        <Link to="/" className="login-ghost-btn">
                            <FaArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Volver
                        </Link>
                    </div>
                </form>
            </AuthPageCard>
        </AuthPageLayout>
    );
}
