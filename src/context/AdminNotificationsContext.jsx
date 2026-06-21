import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { getAdminNotificationsUnreadCountRequest } from "../api/adminNotifications.js";

const AdminNotificationsContext = createContext(null);

export function useAdminNotifications() {
    const ctx = useContext(AdminNotificationsContext);
    if (!ctx) {
        throw new Error("useAdminNotifications debe usarse dentro de AdminNotificationsProvider");
    }
    return ctx;
}

export function AdminNotificationsProvider({ children }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const res = await getAdminNotificationsUnreadCountRequest();
            setUnreadCount(res.data?.unreadCount ?? 0);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        refreshUnreadCount();
        const interval = setInterval(refreshUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [refreshUnreadCount]);

    const value = useMemo(
        () => ({
            unreadCount,
            setUnreadCount,
            refreshUnreadCount,
        }),
        [unreadCount, refreshUnreadCount],
    );

    return (
        <AdminNotificationsContext.Provider value={value}>
            {children}
        </AdminNotificationsContext.Provider>
    );
}
