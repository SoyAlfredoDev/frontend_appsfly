import { useAuth } from "../context/authContext.jsx";
import { sendConfirmEmailRequest } from "../api/user.js";
import { FcOk } from "react-icons/fc";
import {
    FaUser,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaWhatsapp,
    FaMapMarkerAlt,
    FaBriefcase,
    FaUserCircle,
    FaShieldAlt,
} from "react-icons/fa";
import { useState } from "react";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../components/ui/ExpensePageLayout.jsx";
import ProfileSectionCard, { ProfileFieldRow } from "../components/profile/ProfileSectionCard.jsx";
import SubscriptionBillingCard from "../components/profile/SubscriptionBillingCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getTenantRoleLabel } from "../utils/tenantRoleLabels.js";

function RoleBadge({ role }) {
    const isAdmin = role === "ADMIN";
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isAdmin
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
        >
            {isAdmin && <FaShieldAlt className="text-[10px]" />}
            {getTenantRoleLabel(role)}
        </span>
    );
}

function BusinessStatusBadge({ status }) {
    const active = status === "ACTIVE";
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-red-50 text-red-600 border border-red-100"
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary" : "bg-red-500"}`} />
            {active ? "Activo" : "Inactivo"}
        </span>
    );
}

export default function ProfilePage() {
    const { user, business, businessSelected } = useAuth();
    const toast = useToast();
    const [btnConfirmEmail, setBtnConfirmEmail] = useState(false);

    const isAdmin = businessSelected?.userBusinessRole === "ADMIN";
    const businessId = businessSelected?.userBusinessBusinessId ?? business?.businessId;

    const handleConfirmEmail = async () => {
        try {
            await sendConfirmEmailRequest(user.userId);
            setBtnConfirmEmail(true);
            toast.success(
                "Correo enviado",
                "Revisa tu bandeja de entrada y la carpeta de spam para confirmar tu email.",
            );
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo enviar el correo de confirmación. Intenta más tarde.");
        }
    };

    return (
        <ExpensePageLayout
            title="Mi perfil"
            subtitle="Datos personales, negocio y suscripción AppsFly"
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ExpenseAnimatedSection>
                    <ProfileSectionCard
                        title="Información personal"
                        subtitle="Datos de tu cuenta en AppsFly"
                        icon={FaUserCircle}
                    >
                        <ProfileFieldRow icon={FaUser} label="Nombre completo">
                            {user?.userFirstName} {user?.userLastName}
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaIdCard} label="Documento">
                            <span className="inline-flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {user?.userDocumentType}
                                </span>
                                <span>{user?.userDocumentNumber}</span>
                            </span>
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaEnvelope} label="Correo electrónico">
                            <div className="flex flex-wrap items-center gap-2">
                                <span>{user?.userEmail}</span>
                                {user?.userConfirmEmail ? (
                                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                                        <FcOk /> Verificado
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConfirmEmail}
                                        disabled={btnConfirmEmail}
                                        className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                                    >
                                        {btnConfirmEmail ? "Enviado…" : "Verificar email"}
                                    </button>
                                )}
                            </div>
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaPhone} label="Teléfono">
                            {user?.userCodePhoneNumber} {user?.userPhoneNumber}
                        </ProfileFieldRow>
                    </ProfileSectionCard>
                </ExpenseAnimatedSection>

                <ExpenseAnimatedSection>
                    <ProfileSectionCard
                        title="Mi negocio"
                        subtitle={business?.businessName ?? "Negocio asociado"}
                        icon={FaBuilding}
                        badge={
                            <div className="flex flex-wrap items-center gap-2">
                                <BusinessStatusBadge status={business?.businessStatus} />
                                <RoleBadge role={businessSelected?.userBusinessRole} />
                            </div>
                        }
                    >
                        <ProfileFieldRow icon={FaBuilding} label="Razón social">
                            {business?.businessName ?? "—"}
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaIdCard} label="NIT / RUT">
                            <span className="inline-flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {business?.businessDocumentType || "ID"}
                                </span>
                                <span>{business?.businessDocumentNumber ?? "—"}</span>
                            </span>
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaBriefcase} label="Rubro">
                            <span className="capitalize">{business?.businessType ?? "—"}</span>
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaWhatsapp} label="WhatsApp Business">
                            {business?.businessCodeWhatsappNumber && business?.businessWhatsappNumber ? (
                                <a
                                    target="_blank"
                                    href={`https://wa.me/${business.businessCodeWhatsappNumber}${business.businessWhatsappNumber}`}
                                    className="text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                                    rel="noreferrer"
                                >
                                    {business.businessCodeWhatsappNumber} {business.businessWhatsappNumber}
                                </a>
                            ) : (
                                "—"
                            )}
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaEnvelope} label="Email de contacto">
                            {business?.businessEmail ?? "—"}
                        </ProfileFieldRow>

                        <ProfileFieldRow icon={FaMapMarkerAlt} label="País">
                            <span className="capitalize">{business?.businessCountry ?? "—"}</span>
                        </ProfileFieldRow>
                    </ProfileSectionCard>
                </ExpenseAnimatedSection>
            </div>

            <ExpenseAnimatedSection>
                <SubscriptionBillingCard businessId={businessId} isAdmin={isAdmin} />
            </ExpenseAnimatedSection>
        </ExpensePageLayout>
    );
}
