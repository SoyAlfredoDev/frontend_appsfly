import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import NavBarAdminComponent from "../NavBarAdminComponent.jsx";

export default function AdminLayout() {
    return (
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
    );
}
