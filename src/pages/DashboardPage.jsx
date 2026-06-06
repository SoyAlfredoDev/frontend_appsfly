import UserNewDashboardPage from './dashboard/UserNewDashboardPage'
import UserGuestPendient from "./users/UserGuestPendient.jsx";
import { useAuth } from "../context/authContext.jsx";
import UsersDashboardPage from "./dashboard/UsersDashboardPage.jsx";
import Subscription from "../components/Subscriptions.jsx";
import PageContainer from "../components/layout/PageContainer.jsx";

export default function DashboardPage() {
    const { hasBusiness, userGuestExists, subscriptions } = useAuth();
    const hasSubscriptions = subscriptions.length > 0;
    const showSidebar = !hasBusiness && userGuestExists;
    const mainColSpan = showSidebar ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12";

    return (
        <PageContainer>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`col-span-1 ${mainColSpan}`}>
                    {hasBusiness ? (
                        !hasSubscriptions ? (
                            <Subscription />
                        ) : (
                            <UsersDashboardPage />
                        )
                    ) : (
                        <UserNewDashboardPage embedded={true} />
                    )}
                </div>

                {showSidebar && (
                    <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
                        <UserGuestPendient />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
