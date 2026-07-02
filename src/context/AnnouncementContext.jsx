import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuth } from "./authContext.jsx";
import usePwaInstall from "../hooks/usePwaInstall.js";
import { resolveLoginAnnouncement } from "../announcements/loginAnnouncements.js";
import {
    dismissAnnouncementForever,
    markAnnouncementSeenVersion,
} from "../announcements/announcementStorage.js";
import AnnouncementOverlay from "../components/announcements/AnnouncementOverlay.jsx";

const AnnouncementContext = createContext(null);

export function useAnnouncements() {
    const ctx = useContext(AnnouncementContext);
    if (!ctx) {
        throw new Error("useAnnouncements must be used within AnnouncementProvider");
    }
    return ctx;
}

export function AnnouncementProvider({ children }) {
    const { isAuthenticated, loadingAuth, loginSessionKey } = useAuth();
    const pwa = usePwaInstall();
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);

    useEffect(() => {
        if (loadingAuth || !isAuthenticated || loginSessionKey === 0) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            const next = resolveLoginAnnouncement({
                isPwaInstalled: pwa.isInstalled,
                canNativeInstall: pwa.canNativeInstall,
                showIosHint: pwa.showIosHint,
            });
            if (next) {
                setActiveAnnouncement(next);
            }
        }, 350);

        return () => window.clearTimeout(timer);
    }, [
        loadingAuth,
        isAuthenticated,
        loginSessionKey,
        pwa.isInstalled,
        pwa.canNativeInstall,
        pwa.showIosHint,
    ]);

    const closeAnnouncement = useCallback(() => {
        setActiveAnnouncement(null);
    }, []);

    const dismissForever = useCallback(() => {
        if (!activeAnnouncement) return;
        dismissAnnouncementForever(activeAnnouncement.id);
        if (activeAnnouncement.version) {
            markAnnouncementSeenVersion(activeAnnouncement.id, activeAnnouncement.version);
        }
        setActiveAnnouncement(null);
    }, [activeAnnouncement]);

    const handleInstall = useCallback(async () => {
        if (pwa.canNativeInstall) {
            await pwa.promptInstall();
        }
    }, [pwa]);

    const Content = activeAnnouncement?.Content ?? null;

    const value = useMemo(
        () => ({
            activeAnnouncement,
            closeAnnouncement,
            dismissForever,
            /** Para futuros anuncios disparados manualmente (videos, novedades, etc.) */
            showAnnouncement: setActiveAnnouncement,
        }),
        [activeAnnouncement, closeAnnouncement, dismissForever],
    );

    return (
        <AnnouncementContext.Provider value={value}>
            {children}
            <AnnouncementOverlay
                open={Boolean(activeAnnouncement && Content)}
                onClose={closeAnnouncement}
                onDismissForever={dismissForever}
            >
                {Content ? (
                    <Content
                        canNativeInstall={pwa.canNativeInstall}
                        showIosHint={pwa.showIosHint}
                        onInstall={handleInstall}
                    />
                ) : null}
            </AnnouncementOverlay>
        </AnnouncementContext.Provider>
    );
}
