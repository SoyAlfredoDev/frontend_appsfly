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
import { resolveLoginAnnouncement } from "../announcements/loginAnnouncements.ts";
import {
    dismissAnnouncementForever,
    markAnnouncementSeenVersion,
} from "../announcements/announcementStorage.ts";
import {
    consumeLoginAnnouncementsPending,
    getLoginAnnouncementKey,
    getPendingLoginStamp,
    hasLoginAnnouncementsPending,
} from "../announcements/announcementTriggers.ts";
import AnnouncementOverlay from "../components/announcements/AnnouncementOverlay.tsx";

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

function readLoginKey(loginSessionKey) {
    return getLoginAnnouncementKey(
        loginSessionKey,
        hasLoginAnnouncementsPending() ? getPendingLoginStamp() : null,
    );
}

export function AnnouncementProvider({ children }) {
    const { isAuthenticated, loadingAuth, loginSessionKey } = useAuth();
    const location = useLocation();
    const pwa = usePwaInstall();
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);
    const activeAnnouncementRef = useRef(null);
    const shownForLoginKeyRef = useRef(null);
    const timerRef = useRef(null);

    activeAnnouncementRef.current = activeAnnouncement;

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
        if (shownForLoginKeyRef.current === loginKey) {
            return;
        }

        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        const delay = getAnnouncementDelayMs();
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            if (shownForLoginKeyRef.current === loginKey) {
                return;
            }
            shownForLoginKeyRef.current = loginKey;
            consumeLoginAnnouncementsPending();
            tryShowLoginAnnouncement();
        }, delay);
    }, [tryShowLoginAnnouncement]);

    useEffect(() => {
        if (loadingAuth || !isAuthenticated) {
            return undefined;
        }

        const loginKey = readLoginKey(loginSessionKey);
        if (loginKey == null) {
            return undefined;
        }

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

        const loginKey = readLoginKey(loginSessionKey);
        if (loginKey == null || activeAnnouncement || shownForLoginKeyRef.current === loginKey) {
            return;
        }

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
        const loginKey = readLoginKey(loginSessionKey);
        if (loginKey != null) {
            shownForLoginKeyRef.current = loginKey;
        }
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setActiveAnnouncement(null);
        consumeLoginAnnouncementsPending();
    }, [loginSessionKey]);

    const dismissForever = useCallback(() => {
        const current = activeAnnouncementRef.current;
        if (!current) return;
        const keys = current.dismissalKeys?.length ? current.dismissalKeys : [current.id];
        keys.forEach((key) => {
            dismissAnnouncementForever(key);
        });
        if (current.version) {
            markAnnouncementSeenVersion(current.id, current.version);
        }
        const loginKey = readLoginKey(loginSessionKey);
        if (loginKey != null) {
            shownForLoginKeyRef.current = loginKey;
        }
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setActiveAnnouncement(null);
        consumeLoginAnnouncementsPending();
    }, [loginSessionKey]);

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
                imageSrc={activeAnnouncement?.imageSrc}
                imageAlt={activeAnnouncement?.imageAlt}
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
