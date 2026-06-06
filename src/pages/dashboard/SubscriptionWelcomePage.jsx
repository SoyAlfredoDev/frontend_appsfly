import { Link } from "react-router-dom";
import { FaRocket, FaUserCircle, FaGift } from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import Subscription from "../../components/Subscriptions.jsx";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";

/**
 * Escenario A: negocio nuevo sin historial de suscripción.
 * Oferta promocional P001 — 2 meses gratis.
 */
export default function SubscriptionWelcomePage({ embedded = false, fullScreen = false }) {
    const { user, business } = useAuth();

    return (
        <RestrictedAccessShell
            icon={FaRocket}
            title="¡Bienvenido a AppsFly!"
            subtitle="Activa tu prueba gratuita de 2 meses y desbloquea todas las herramientas."
            headerClassName="bg-gradient-to-br from-[#021f41] via-[#0a2d52] to-[#01c676]/80"
            embedded={embedded}
            fullScreen={fullScreen}
            compact={fullScreen}
        >
            <div className="flex flex-col flex-1 min-h-0 gap-2.5">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 flex gap-2">
                    <FaGift className="text-primary mt-0.5 shrink-0 text-xs" />
                    <p className="text-[11px] sm:text-xs text-slate-700 leading-snug">
                        Hola <span className="font-semibold">{user?.userFirstName}</span>,{" "}
                        <span className="font-semibold">{business?.businessName ?? "tu negocio"}</span>{" "}
                        califica para la promoción de lanzamiento. Activa el Plan Básico sin costo por 2
                        meses. Mientras tanto, solo{" "}
                        <Link to="/profile" className="text-secondary font-semibold no-underline">
                            Mi perfil
                        </Link>{" "}
                        está disponible.
                    </p>
                </div>

                <div
                    id="activar-plan"
                    className="flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50/40"
                >
                    <Subscription embedded compact offerType="trial" />
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2 pt-0.5">
                    <a
                        href="#activar-plan"
                        className="btn-primary flex-1 justify-center no-underline !py-2.5 !text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("activar-plan")?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <FaGift className="text-sm" />
                        Activar 2 meses gratis
                    </a>
                    <Link
                        to="/profile"
                        className="btn-ghost flex-1 justify-center no-underline border-slate-200 !py-2.5 !text-sm"
                    >
                        <FaUserCircle className="text-sm" />
                        Ir a mi perfil
                    </Link>
                </div>
            </div>
        </RestrictedAccessShell>
    );
}
