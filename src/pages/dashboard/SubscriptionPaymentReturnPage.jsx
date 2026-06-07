import { useAuth } from "../../context/authContext.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import { PaymentReturnFeedback } from "../../components/mercadopago/index.js";

export default function SubscriptionPaymentReturnPage() {
    const { refreshSubscriptions } = useAuth();

    return (
        <PageContainer>
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <PaymentReturnFeedback onApproved={refreshSubscriptions} />
            </div>
        </PageContainer>
    );
}
