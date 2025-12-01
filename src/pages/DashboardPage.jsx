import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import UserNewDashboardPage from './dashboard/UserNewDashboardPage'
import UserGuestPendient from "./users/UserGuestPendient.jsx";
import { useAuth } from "../context/authContext.jsx";
import UsersDashboardPage from "./dashboard/UsersDashboardPage.jsx";
import Subscription from "../components/Subscriptions.jsx";

export default function DashboardAdminPage() {
    const { hasBusiness, userGuestExists, subscriptions } = useAuth();
    const hasSubscriptions = subscriptions.length > 0;
    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="customer-container">
                <div className="container-fluid">
                    <div className="row">
                        <div className={hasBusiness ? "col-12" : userGuestExists ? "col-12 col-md-7 col-lg-9" : "col-12"}>
                            {/* valida que el usuario tenga una business asociada, si no la tiene le muestra el dasboard para crear un nuevo negocio*/}
                            {
                                hasBusiness ? (
                                    <>
                                        {
                                            /*valida que el negocio tenga alguna suscripcion activa , si no tiene le permite seleccionar una */
                                        }
                                        {
                                            !hasSubscriptions ? (
                                                <Subscription />
                                            ) : (
                                                <UsersDashboardPage />
                                            )
                                        }

                                    </>
                                ) :
                                    <UserNewDashboardPage />
                            }
                        </div>
                        <div className={hasBusiness ? "d-none" : "col-12 col-md-5 col-lg-3"}>
                            <UserGuestPendient />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedView>
    )
}
