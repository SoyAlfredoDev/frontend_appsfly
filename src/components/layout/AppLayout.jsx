import { Outlet } from "react-router-dom";
import ProtectedView from "../ProtectedView.jsx";
import SidebarNavigation from "./SidebarNavigation.jsx";
import AssistantPanel from "../assistant/AssistantPanel.jsx";
import { useAuth } from "../../context/authContext.jsx";

export default function AppLayout() {
    const { user, activeBusinessId, loginSessionKey } = useAuth();
    // Discard all mounted tenant data, including sidebar and assistant state.
    const tenantSessionKey = JSON.stringify([user?.userId, activeBusinessId, loginSessionKey]);
    return (
        <ProtectedView>
            <div key={tenantSessionKey} className="min-h-screen bg-surface">
                <SidebarNavigation />
                <main className="app-main">
                    <Outlet />
                </main>
                <AssistantPanel />
            </div>
        </ProtectedView>
    );
}
