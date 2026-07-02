import {
    isAnnouncementDismissedForever,
} from "./announcementStorage.js";
import PwaInstallAnnouncementContent from "../components/announcements/content/PwaInstallAnnouncementContent.jsx";

/**
 * Anuncios que se evalúan tras cada inicio de sesión exitoso.
 * Orden: menor priority = se muestra primero.
 *
 * Futuros tipos: video (Content con iframe), novedades, onboarding, etc.
 */
export const LOGIN_ANNOUNCEMENTS = [
    {
        id: "pwa-install-v2",
        version: "2",
        priority: 10,
        trigger: "login",
        shouldShow: ({ isPwaInstalled }) => !isPwaInstalled,
        Content: PwaInstallAnnouncementContent,
    },
];

export function resolveLoginAnnouncement(context = {}) {
    const eligible = LOGIN_ANNOUNCEMENTS
        .filter((item) => item.trigger === "login")
        .filter((item) => !isAnnouncementDismissedForever(item.id))
        .filter((item) => {
            try {
                return item.shouldShow(context) !== false;
            } catch {
                return false;
            }
        })
        .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

    return eligible[0] ?? null;
}
