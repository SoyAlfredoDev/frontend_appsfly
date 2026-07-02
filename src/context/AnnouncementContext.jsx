import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./authContext.jsx";
import usePwaInstall, { isStandaloneMode } from "../hooks/usePwaInstall.js";
import { resolveLoginAnnouncement } from "../announcements/loginAnnouncements.js";
import {
    dismissAnnouncementForever,
    markAnnouncementSeenVersion,
} from "../announcements/announcementStorage.js";
import {
    consumeLoginAnnouncementsPending,
    hasLoginAnnouncementsPending,
} from "../announcements/announcementTriggers.js";
import AnnouncementOverlay from "../components/announcements/AnnouncementOverlay.jsx";

const AnnouncementContext = createContext(null);

export function useAnnouncements() {
    const ctx = useContext(AnnouncementContext);
    if (!ctx) {
        throw new Error("useAnnouncements must be used within AnnouncementProvider");
    }
    return ctx;
}

function getAnnouncementDelayMs() {
    if (typeof window === "undefined") return 400;
    const ua = navigator.userAgent || "";
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    return isMobile ? 700 : 400;
}

export function AnnouncementProvider({ children }) {
    const { isAuthenticated, loadingAuth, loginSessionKey } = useAuth();
    const location = useLocation();
    const pwa = usePwaInstall();
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);
    const shownForLoginKeyRef = useRef(0);
    const timerRef = useRef(null);

    const tryShowLoginAnnouncement = useCallback(() => {
        const next = resolveLoginAnnouncement({
            isPwaInstalled: isStandaloneMode(),
        });
        if (next) {
            setActiveAnnouncement(next);
            return true;
        }
        return false;
    }, []);

    const scheduleLoginAnnouncement = useCallback((loginKey) => {
        if (shownForLoginKeyRef.current >= loginKey) {
            return;
        }

        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        const delay = getAnnouncementDelayMs();
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            if (shownForLoginKeyRef.current >= loginKey) {
                return;
            }
            const shown = tryShowLoginAnnouncement();
            if (shown) {
                shownForLoginKeyRef.current = loginKey;
                consumeLoginAnnouncementsPending();
            }
        }, delay);
    }, [tryShowLoginAnnouncement]);

    useEffect(() => {
        if (loadingAuth || !isAuthenticated) {
            return undefined;
        }

        const pendingFromSignin = hasLoginAnnouncementsPending();
        const shouldEvaluate = loginSessionKey > 0 || pendingFromSignin;

        if (!shouldEvaluate) {
            return undefined;
        }

        const loginKey = loginSessionKey > 0 ? loginSessionKey : Date.now();
        scheduleLoginAnnouncement(loginKey);

        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        loadingAuth,
        isAuthenticated,
        loginSessionKey,
        location.pathname,
        scheduleLoginAnnouncement,
    ]);

    useEffect(() => {
        if (!pwa.isReady || loadingAuth || !isAuthenticated) {
            return;
        }

        if (activeAnnouncement || shownForLoginKeyRef.current >= loginSessionKey) {
            return;
        }

        if (!hasLoginAnnouncementsPending() && loginSessionKey === 0) {
            return;
        }

        const loginKey = loginSessionKey > 0 ? loginSessionKey : Date.now();
        scheduleLoginAnnouncement(loginKey);
    }, [
        pwa.isReady,
        loadingAuth,
        isAuthenticated,
        loginSessionKey,
        activeAnnouncement,
        scheduleLoginAnnouncement,
    ]);

    const closeAnnouncement = useCallback(() => {
        setActiveAnnouncement(null);
        consumeLoginAnnouncementsPending();
    }, []);

    const dismissForever = useCallback(() => {
        if (!activeAnnouncement) return;
        dismissAnnouncementForever(activeAnnouncement.id);
        if (activeAnnouncement.version) {
            markAnnouncementSeenVersion(activeAnnouncement.id, activeAnnouncement.version);
        }
        setActiveAnnouncement(null);
        consumeLoginAnnouncementsPending();
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
