import NavBarComponent from "../components/NavBarComponent";
import UserNewDashboardPage from './dashboard/UserNewDashboardPage'
import UserGuestPendient from "./users/UserGuestPendient.jsx";
import { useAuth } from "../context/authContext.jsx";
import UsersDashboardPage from "./dashboard/UsersDashboardPage.jsx";

export default function DashboardAdminPage() {
    const { hasBusiness } = useAuth();

    return (
        <>
            <NavBarComponent />
            <div className="customer-container">
                <div className="container-fluid">
                    {
                        hasBusiness ? <UsersDashboardPage /> : <UserNewDashboardPage />
                    }
                    <UserGuestPendient />
                </div>
            </div>
        </>
    )
}
