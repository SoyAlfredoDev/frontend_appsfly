import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import SubscriptionBillingCard from "../../components/profile/SubscriptionBillingCard.jsx";

export default function SubscriptionSettingsPage() {
    const { business, businessSelected } = useAuth();
    const { isTenantAdmin } = useTenantPermissions();

    const businessId =
        businessSelected?.userBusinessBusinessId
        ?? businessSelected?.businessId
        ?? business?.businessId
        ?? null;

    if (!isTenantAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <ExpensePageLayout
            title="Suscripción"
            subtitle="Plan del negocio, vigencia y mejora del plan"
        >
            <SubscriptionBillingCard businessId={businessId} isAdmin />
        </ExpensePageLayout>
    );
}
