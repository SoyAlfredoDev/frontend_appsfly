import { Link } from "react-router-dom";
import {
    FaExclamationTriangle,
    FaCreditCard,
    FaCalendarTimes,
    FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import formatDate from "../../utils/formatDate.js";
import { getLatestSubscription } from "../../utils/subscriptionAccess.js";
import Subscription from "../../components/Subscriptions.jsx";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";

/**
 * Escenario B: negocio con historial de suscripción vencida/suspendida.
 * Solo plan comercial de pago — sin promoción P001.
 */
export default function SubscriptionExpiredPage({ embedded = false, fullScreen = false }) {
    const { user, business, subscriptions } = useAuth();
    const latest = getLatestSubscription(subscriptions);

    return (
        <RestrictedAccessShell
            icon={FaCalendarTimes}
            title="Suscripción vencida"
            subtitle="Contrata un plan comercial para recuperar ventas, inventario y reportes."
            headerClassName="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700"
            embedded={embedded}
            fullScreen={fullScreen}
            compact={fullScreen}
        >
            <div className="flex flex-col flex-1 min-h-0 gap-2.5">
                <div className="shrink-0 space-y-2">
                    <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 flex gap-2">
                        <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0 text-xs" />
                        <p className="text-[11px] sm:text-xs text-amber-800/90 leading-snug">
                            <span className="font-bold text-amber-900">Acceso operativo suspendido.</span>{" "}
                            Hola <span className="font-semibold">{user?.userFirstName}</span>,{" "}
                            <span className="font-semibold">{business?.businessName ?? "tu negocio"}</span>{" "}
                            requiere renovación de pago. La promoción gratuita no aplica. Solo{" "}
                            <Link to="/profile" className="text-secondary font-semibold no-underline">
                                Mi perfil
                            </Link>{" "}
                            está disponible.
                        </p>
                    </div>

                    {latest?.subscriptionEndDate && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] sm:text-xs text-slate-600">
                            <span>
                                <span className="uppercase tracking-wide text-slate-400 text-[10px] mr-1">
                                    Vencimiento
                                </span>
                                <span className="font-semibold text-dark">
                                    {formatDate(latest.subscriptionEndDate)}
                                </span>
                            </span>
                            <span className="hidden sm:inline text-slate-300">·</span>
                            <span>
                                <span className="uppercase tracking-wide text-slate-400 text-[10px] mr-1">
                                    Plan anterior
                                </span>
                                <span className="font-semibold text-dark">
                                    {latest.plan?.planName ?? latest.subscriptionPlanId ?? "—"}
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                <div
                    id="renovar-plan"
                    className="flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50/40"
                >
                    <Subscription embedded compact offerType="paid" />
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2 pt-0.5">
                    <a
                        href="#renovar-plan"
                        className="btn-primary flex-1 justify-center no-underline !py-2.5 !text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("renovar-plan")?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <FaCreditCard className="text-sm" />
                        Contratar plan comercial
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
