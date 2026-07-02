import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "appsfly_pwa_install_dismissed_until";
const DISMISS_DAYS = 14;

function isStandaloneMode() {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true
    );
}

function isIosDevice() {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isDismissed() {
    try {
        const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
        return until > Date.now();
    } catch {
        return false;
    }
}

export function dismissPwaInstallPrompt() {
    try {
        const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(DISMISS_KEY, String(until));
    } catch {
        // ignore
    }
}

export default function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(isStandaloneMode);
    const [isIos, setIsIos] = useState(false);
    const [dismissed, setDismissed] = useState(isDismissed);

    useEffect(() => {
        setIsIos(isIosDevice());
        setIsInstalled(isStandaloneMode());
        setDismissed(isDismissed());

        const onBeforeInstall = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        const onInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        const onDisplayMode = () => {
            setIsInstalled(isStandaloneMode());
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstall);
        window.addEventListener("appinstalled", onInstalled);
        window.matchMedia("(display-mode: standalone)").addEventListener("change", onDisplayMode);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstall);
            window.removeEventListener("appinstalled", onInstalled);
            window.matchMedia("(display-mode: standalone)").removeEventListener("change", onDisplayMode);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return { outcome: "unavailable" };
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (choice.outcome === "accepted") {
            setIsInstalled(true);
        }
        return choice;
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        dismissPwaInstallPrompt();
        setDismissed(true);
    }, []);

    const canNativeInstall = Boolean(deferredPrompt);
    const showIosHint = isIos && !isInstalled;
    const shouldShowPrompt = !isInstalled && !dismissed && (canNativeInstall || showIosHint);

    return {
        isInstalled,
        isIos,
        canNativeInstall,
        showIosHint,
        shouldShowPrompt,
        promptInstall,
        dismiss,
    };
}
