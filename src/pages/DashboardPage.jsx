import UserNewDashboardPage from "./dashboard/UserNewDashboardPage";
import UserGuestPendient from "./users/UserGuestPendient.jsx";
import { useAuth } from "../context/authContext.jsx";
import UsersDashboardPage from "./dashboard/UsersDashboardPage.jsx";
import SubscriptionWelcomePage from "./dashboard/SubscriptionWelcomePage.jsx";
import SubscriptionExpiredPage from "./dashboard/SubscriptionExpiredPage.jsx";
import PageContainer from "../components/layout/PageContainer.jsx";
import { getSubscriptionAccessState } from "../utils/subscriptionAccess.js";

export default function DashboardPage() {
    const { hasBusiness, userGuestExists, hasActiveSubscription, subscriptions } = useAuth();
    const hasPendingInvites = Array.isArray(userGuestExists) && userGuestExists.length > 0;
    const showInvitesPanel = hasPendingInvites;
    const mainColSpan = showInvitesPanel ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12";

    if (hasBusiness && !hasActiveSubscription) {
        const access = getSubscriptionAccessState(subscriptions);
        if (access === "none") {
            return <SubscriptionWelcomePage embedded />;
        }
        return <SubscriptionExpiredPage embedded />;
    }

    return (
        <PageContainer>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`col-span-1 ${mainColSpan}`}>
                    {hasBusiness && hasActiveSubscription ? (
                        <UsersDashboardPage />
                    ) : !hasBusiness ? (
                        <UserNewDashboardPage embedded hasPendingInvites={hasPendingInvites} />
                    ) : null}
                </div>

                {showInvitesPanel && (
                    <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
                        <UserGuestPendient />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
