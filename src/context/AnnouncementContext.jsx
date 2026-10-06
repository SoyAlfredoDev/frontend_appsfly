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
    hydrateServerDismissals,
    markAnnouncementSeenVersion,
} from "../announcements/announcementStorage.ts";
import {
    consumeLoginAnnouncementsPending,
    getLoginAnnouncementKey,
    getPendingLoginStamp,
    hasLoginAnnouncementsPending,
} from "../announcements/announcementTriggers.ts";
import {
    dismissAnnouncementOnServerRequest,
    fetchDismissedAnnouncementsRequest,
} from "../api/announcementDismissals.ts";
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

function buildAnnouncementScope(userId) {
    const normalized = userId?.trim();
    return normalized ? { userId: normalized } : undefined;
}

export function AnnouncementProvider({ children }) {
    const { isAuthenticated, loadingAuth, loginSessionKey, user } = useAuth();
    const location = useLocation();
    const pwa = usePwaInstall();
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);
    const [dismissalsReady, setDismissalsReady] = useState(false);
    const activeAnnouncementRef = useRef(null);
    const shownForLoginKeyRef = useRef(null);
    const timerRef = useRef(null);

    const announcementScope = useMemo(
        () => buildAnnouncementScope(user?.userId),
        [user?.userId],
    );

    activeAnnouncementRef.current = activeAnnouncement;

    useEffect(() => {
        if (!isAuthenticated || !announcementScope?.userId) {
            setDismissalsReady(false);
            return undefined;
        }

        let cancelled = false;
        setDismissalsReady(false);

        (async () => {
            try {
                const ids = await fetchDismissedAnnouncementsRequest();
                if (!cancelled) {
                    hydrateServerDismissals(announcementScope.userId, ids);
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.warn("[AppsFly announcements] No se pudieron cargar descartes del servidor:", error);
                }
            } finally {
                if (!cancelled) {
                    setDismissalsReady(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, announcementScope?.userId]);

    useEffect(() => {
        if (!isAuthenticated) {
            shownForLoginKeyRef.current = null;
            setActiveAnnouncement(null);
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isAuthenticated]);

    const tryShowLoginAnnouncement = useCallback(() => {
        const next = resolveLoginAnnouncement(
            {
                isPwaInstalled: isStandaloneMode(),
            },
            announcementScope,
        );
        if (next) {
            setActiveAnnouncement(next);
            return true;
        }
        return false;
    }, [announcementScope]);

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

    const shouldWaitForDismissals = isAuthenticated && Boolean(announcementScope?.userId);

    useEffect(() => {
        if (loadingAuth || !isAuthenticated) {
            return undefined;
        }
        if (shouldWaitForDismissals && !dismissalsReady) {
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
        dismissalsReady,
        shouldWaitForDismissals,
    ]);

    useEffect(() => {
        if (!pwa.isReady || loadingAuth || !isAuthenticated) {
            return;
        }
        if (shouldWaitForDismissals && !dismissalsReady) {
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
        dismissalsReady,
        shouldWaitForDismissals,
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
            dismissAnnouncementForever(key, announcementScope);
        });
        if (current.version) {
            markAnnouncementSeenVersion(current.id, current.version, announcementScope);
        }

        if (announcementScope?.userId) {
            dismissAnnouncementOnServerRequest(keys)
                .then((ids) => {
                    hydrateServerDismissals(announcementScope.userId, ids);
                })
                .catch((error) => {
                    if (import.meta.env.DEV) {
                        console.warn("[AppsFly announcements] No se pudo guardar el descarte en el servidor:", error);
                    }
                });
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
    }, [announcementScope, loginSessionKey]);

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
