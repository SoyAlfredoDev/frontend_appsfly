import { Outlet } from "react-router-dom";
import ProtectedView from "../ProtectedView.jsx";
import SidebarNavigation from "./SidebarNavigation.jsx";
import AssistantPanel from "../assistant/AssistantPanel.jsx";

export default function AppLayout() {
    return (
        <ProtectedView>
            <div className="min-h-screen bg-surface">
                <SidebarNavigation />
                <main className="app-main">
                    <Outlet />
                </main>
                <AssistantPanel />
            </div>
        </ProtectedView>
    );
}
