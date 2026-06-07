import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaClock, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { confirmSubscriptionPayment } from "../../api/mercadopago/mpService.js";
import { MP_CHECKOUT_STATUS } from "../../api/mercadopago/constants.js";

/**
 * Feedback transaccional tras retorno de Checkout Pro Mercado Pago Chile.
 */
export default function PaymentReturnFeedback({ onApproved }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState({
        phase: "loading",
        message: "Verificando pago con Mercado Pago...",
    });

    useEffect(() => {
        const run = async () => {
            const status = searchParams.get("status") || searchParams.get("collection_status");
            const mpPaymentId =
                searchParams.get("payment_id") || searchParams.get("collection_id");
            const externalReference = searchParams.get("external_reference");

            if (!mpPaymentId) {
                setState({
                    phase: "error",
                    message: "No se recibió el identificador del pago desde Mercado Pago.",
                });
                return;
            }

            if (
                status === MP_CHECKOUT_STATUS.FAILURE
                || status === MP_CHECKOUT_STATUS.REJECTED
            ) {
                setState({
                    phase: "error",
                    message: "El pago fue rechazado o cancelado en Mercado Pago.",
                });
                return;
            }

            if (!externalReference) {
                setState({
                    phase: "pending",
                    message: "Pago recibido. La confirmación puede tardar unos segundos.",
                });
                return;
            }

            try {
                const res = await confirmSubscriptionPayment(externalReference, mpPaymentId);

                if (res.data?.payment?.status === "APPROVED") {
                    await onApproved?.();
                    setState({
                        phase: "success",
                        message: "Pago aprobado. Tu suscripción ha sido activada correctamente.",
                    });
                    setTimeout(() => navigate("/dashboard", { replace: true }), 2500);
                    return;
                }

                if (res.data?.payment?.status === "PENDING") {
                    setState({
                        phase: "pending",
                        message: "Pago pendiente de confirmación. Te avisaremos cuando se acredite.",
                    });
                    return;
                }

                setState({
                    phase: "error",
                    message: "No fue posible confirmar el pago. Contacta a soporte si el cargo fue realizado.",
                });
            } catch (error) {
                console.error("[PaymentReturnFeedback]", error);
                setState({
                    phase: "error",
                    message:
                        error.response?.data?.message
                        || "Error al confirmar el pago. Intenta nuevamente o contacta soporte.",
                });
            }
        };

        run();
    }, [searchParams, navigate, onApproved]);

    const iconMap = {
        loading: <FaSpinner className="animate-spin text-3xl text-secondary" />,
        success: <FaCheckCircle className="text-3xl text-primary" />,
        pending: <FaClock className="text-3xl text-amber-500" />,
        error: <FaTimesCircle className="text-3xl text-red-500" />,
    };

    const titleMap = {
        success: "Pago confirmado",
        pending: "Pago pendiente",
        error: "Pago no completado",
        loading: "Procesando pago",
    };

    return (
        <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex justify-center">{iconMap[state.phase]}</div>
            <h1 className="text-xl font-bold font-display text-dark mb-2">
                {titleMap[state.phase]}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{state.message}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link to="/dashboard" className="btn-primary no-underline justify-center">
                    Ir al dashboard
                </Link>
                {state.phase === "error" && (
                    <Link
                        to="/dashboard"
                        className="btn-ghost no-underline justify-center border-slate-200"
                    >
                        Reintentar más tarde
                    </Link>
                )}
            </div>
        </div>
    );
}
