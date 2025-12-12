import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import UserNewDashboardPage from './dashboard/UserNewDashboardPage'
import UserGuestPendient from "./users/UserGuestPendient.jsx";
import { useAuth } from "../context/authContext.jsx";
import UsersDashboardPage from "./dashboard/UsersDashboardPage.jsx";
import Subscription from "../components/Subscriptions.jsx";

export default function DashboardPage() {
    const { hasBusiness, userGuestExists, subscriptions } = useAuth();
    const hasSubscriptions = subscriptions.length > 0;
    console.log('subscriptions', subscriptions);

    // Helper to determine main content width
    // If user has no business AND has pending invitations, we need space for the sidebar
    // Otherwise full width
    const showSidebar = !hasBusiness && userGuestExists;
    const mainColSpan = showSidebar ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12";

    return (
        <ProtectedView>
            <div className="min-h-screen bg-gray-50 pb-12">
                <NavBarComponent />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-[65px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Main Content Area */}
                        <div className={`col-span-1 ${mainColSpan}`}>
                            {hasBusiness ? (
                                <>
                                    {!hasSubscriptions ? (
                                        <Subscription />
                                    ) : (
                                        <UsersDashboardPage />
                                    )}
                                </>
                            ) : (
                                <UserNewDashboardPage embedded={true} />
                            )}
                        </div>

                        {/* Sidebar Area (User Questions/Invites) */}
                        {showSidebar && (
                            <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
                                <UserGuestPendient />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedView>
    )
}
