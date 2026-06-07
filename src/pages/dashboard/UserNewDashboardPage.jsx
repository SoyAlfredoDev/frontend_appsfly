import { Link } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { sendEmailRequest } from "../../api/email.js";
import { RegisterEmail } from "../../emails/users/auth/RegisterEmail.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { useState } from "react";
import { FaBuilding, FaRocket, FaExclamationTriangle, FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";

const MySwal = withReactContent(Swal);

export default function UserNewDashboardPage({ embedded = false, hasPendingInvites = false }) {
    const { user } = useAuth();
    const [btnConfirmEmail, setBtnConfirmEmail] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const handleConfirmEmail = async () => {
        setSendingEmail(true);
        try {
            const baseURL = import.meta.env.VITE_FRONTEND_URL;
            const emailData = {
                to: user.userEmail,
                subject: "Confirmación de registro - AppsFly",
                html: renderToStaticMarkup(
                    <RegisterEmail
                        firstName={user.userFirstName}
                        lastName={user.userLastName}
                        confirmationLink={`${baseURL}/users/${user.userId}/confirm-email`}
                    />,
                ),
            };

            await sendEmailRequest(emailData);
            setBtnConfirmEmail(true);

            MySwal.fire({
                icon: "success",
                title: "¡Correo enviado!",
                text: "Se ha enviado un correo de confirmación. Importante: revisa tu carpeta de spam.",
                confirmButtonColor: "#01c676",
            });
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al enviar el correo. Por favor intenta más tarde.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className={embedded ? "mx-auto w-full max-w-lg" : undefined}>
            <RestrictedAccessShell
                icon={FaRocket}
                title="¡Bienvenido a AppsFly!"
                subtitle="Tu plataforma de gestión empresarial"
                headerClassName="bg-gradient-to-br from-[#021f41] via-[#0a2d52] to-[#01c676]/80"
                embedded={embedded}
                maxWidthClass="max-w-lg"
            >
            <div className="space-y-5">
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Hola{" "}
                        <span className="font-semibold text-dark">{user?.userFirstName}</span>, notamos
                        que aún no tienes un negocio asociado a tu cuenta.
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5">
                        Para comenzar a utilizar las herramientas, registra tu negocio ahora.
                    </p>
                </div>

                {!user?.userConfirmEmail && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0 text-sm" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">
                                    Verifica tu correo electrónico
                                </h4>
                                <p className="text-xs text-amber-800/90 mt-1 leading-snug">
                                    Para mantener tu cuenta activa y segura, necesitamos confirmar tu
                                    email.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleConfirmEmail}
                            disabled={btnConfirmEmail || sendingEmail}
                            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all
                                ${
                                    btnConfirmEmail
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                                }`}
                        >
                            {sendingEmail ? (
                                "Enviando..."
                            ) : btnConfirmEmail ? (
                                "Correo enviado"
                            ) : (
                                <>
                                    <FaEnvelope />
                                    Confirmar correo ahora
                                </>
                            )}
                        </button>
                    </div>
                )}

                <Link
                    to="/business/register"
                    className="btn-primary w-full justify-center no-underline !py-3 !text-base"
                >
                    <FaBuilding className="text-base" />
                    Registrar mi negocio
                </Link>

                <p className="text-center text-xs text-slate-400 leading-relaxed">
                    {hasPendingInvites ? (
                        <>
                            Tienes invitaciones pendientes a la derecha. Acéptalas para unirte a un
                            negocio existente.
                        </>
                    ) : (
                        <>
                            ¿Necesitas unirte a un negocio existente?{" "}
                            <span className="text-slate-500">
                                Pide a tu administrador que te invite por correo.
                            </span>
                        </>
                    )}
                </p>
            </div>
        </RestrictedAccessShell>
        </div>
    );
}
