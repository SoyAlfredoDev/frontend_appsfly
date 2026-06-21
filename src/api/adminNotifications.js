import axios from "./axios.js";

export const getAdminNotificationsRequest = (unreadOnly = false) =>
    axios.get("/admin/notifications", {
        params: unreadOnly ? { unreadOnly: true } : undefined,
    });

export const getAdminNotificationsUnreadCountRequest = () =>
    axios.get("/admin/notifications/unread-count");

export const markAdminNotificationReadRequest = (notificationId) =>
    axios.patch(`/admin/notifications/${notificationId}/read`);

export const markAllAdminNotificationsReadRequest = () =>
    axios.post("/admin/notifications/mark-all-read");

export const clearAdminNotificationsRequest = (mode = "read") =>
    axios.post("/admin/notifications/clear", { mode });
