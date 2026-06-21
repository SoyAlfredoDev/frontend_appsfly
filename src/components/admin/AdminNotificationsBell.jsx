import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { useAdminNotifications } from "../../context/AdminNotificationsContext.jsx";

export default function AdminNotificationsBell() {
    const { unreadCount } = useAdminNotifications();

    return (
        <Link
            to="/admin/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 hover:text-white no-underline transition-colors"
            title="Notificaciones"
        >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Link>
    );
}
