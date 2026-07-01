import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import ProtectedView from "../ProtectedView.jsx";
import SidebarNavigation from "./SidebarNavigation.jsx";
import AssistantPanel from "../assistant/AssistantPanel.jsx";

export default function AppLayout() {
    return (
        <ProtectedView>
            <div className="min-h-screen bg-surface">
                <SidebarNavigation />
                <motion.main
                    className="app-main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <Outlet />
                </motion.main>
                <AssistantPanel />
            </div>
        </ProtectedView>
    );
}
