import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import MercadoPagoProvider from "../components/mercadopago/MercadoPagoProvider.jsx";
import PaymentModalComponent from "../components/mercadopago/PaymentModalComponent.jsx";
import useMercadoPagoCheckout from "../hooks/mercadopago/useMercadoPagoCheckout.js";

const PaymentModalContext = createContext(null);

const SUCCESS_DISPLAY_MS = 2200;

export function usePaymentModal() {
    const ctx = useContext(PaymentModalContext);
    if (!ctx) {
        throw new Error("usePaymentModal debe usarse dentro de PaymentModalProvider");
    }
    return ctx;
}

/**
 * Host del modal de pago en nivel App — no se desmonta cuando TenantContentGate desbloquea.
 */
export function PaymentModalProvider({ children }) {
    const navigate = useNavigate();
    const checkout = useMercadoPagoCheckout();

    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionPlan, setSessionPlan] = useState(null);
    const callbacksRef = useRef({});

    const closeModal = useCallback(() => {
        if (processing && !success) return;
        setOpen(false);
        setSuccess(false);
        setProcessing(false);
        setSessionPlan(null);
        checkout.clearCheckout();
    }, [processing, success, checkout]);

    const openCheckoutModal = useCallback(
        async ({ plan, businessId, onSuccess, onError, refreshSubscriptions }) => {
            if (open || checkout.loading) return;

            callbacksRef.current = { onSuccess, onError, refreshSubscriptions };
            setSessionPlan(plan);
            checkout.clearCheckout();
            setSuccess(false);
            setProcessing(false);
            setOpen(true);

            try {
                await checkout.startCheckout({
                    subscriptionId: uuidv4(),
                    subscriptionBusinessId: businessId,
                    subscriptionPlanId: plan.planId,
                });
            } catch (err) {
                setOpen(false);
                setSessionPlan(null);
                onError?.(err);
            }
        },
        [open, checkout],
    );

    const handleApproved = useCallback(async (result) => {
        setSuccess(true);
        setProcessing(false);

        await new Promise((resolve) => {
            setTimeout(resolve, SUCCESS_DISPLAY_MS);
        });

        try {
            await callbacksRef.current.refreshSubscriptions?.();
        } catch (err) {
            callbacksRef.current.onError?.(err);
            setSuccess(false);
            return;
        }

        setOpen(false);
        setSuccess(false);
        setSessionPlan(null);
        checkout.clearCheckout();

        callbacksRef.current.onSuccess?.(result);
        navigate("/dashboard", { replace: true });
    }, [checkout, navigate]);

    const handleError = useCallback((err) => {
        setProcessing(false);
        callbacksRef.current.onError?.(err);
    }, []);

    const handleProcessingStart = useCallback(() => {
        setProcessing(true);
    }, []);

    const value = useMemo(
        () => ({ openCheckoutModal, isPaymentModalOpen: open }),
        [openCheckoutModal, open],
    );

    return (
        <PaymentModalContext.Provider value={value}>
            {children}
            <MercadoPagoProvider>
                <PaymentModalComponent
                    open={open}
                    success={success}
                    onClose={closeModal}
                    loading={checkout.loading}
                    processing={processing}
                    planName={checkout.planName ?? sessionPlan?.planName}
                    amount={checkout.amount ?? sessionPlan?.planPrice}
                    currency={checkout.currency ?? "CLP"}
                    preferenceId={checkout.preferenceId}
                    paymentId={checkout.paymentId}
                    onApproved={handleApproved}
                    onError={handleError}
                    onProcessingStart={handleProcessingStart}
                />
            </MercadoPagoProvider>
        </PaymentModalContext.Provider>
    );
}
