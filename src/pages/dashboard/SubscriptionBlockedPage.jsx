import { useAuth } from "../../context/authContext.jsx";
import SubscriptionWelcomePage from "./SubscriptionWelcomePage.jsx";
import SubscriptionExpiredPage from "./SubscriptionExpiredPage.jsx";

/** @deprecated Usar SubscriptionWelcomePage o SubscriptionExpiredPage directamente */
export default function SubscriptionBlockedPage(props) {
    const { subscriptionAccess } = useAuth();
    if (subscriptionAccess === "none") {
        return <SubscriptionWelcomePage {...props} />;
    }
    return <SubscriptionExpiredPage {...props} />;
}
