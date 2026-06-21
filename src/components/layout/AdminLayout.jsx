import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import NavBarAdminComponent from "../NavBarAdminComponent.jsx";
import { AdminNotificationsProvider } from "../../context/AdminNotificationsContext.jsx";

export default function AdminLayout() {
    return (
        <AdminNotificationsProvider>
            <div className="min-h-screen bg-surface">
                <NavBarAdminComponent />
                <motion.main
                    className="admin-main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <Outlet />
                </motion.main>
            </div>
        </AdminNotificationsProvider>
    );
}
