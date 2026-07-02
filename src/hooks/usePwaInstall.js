import { useCallback, useEffect, useState } from "react";

export function isStandaloneMode() {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true
    );
}

export function isIosDevice() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const isClassicIos = /iphone|ipad|ipod/i.test(ua);
    const isIpadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return isClassicIos || isIpadOs;
}

export function isMobileDevice() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return (
        /android|iphone|ipad|ipod|mobile/i.test(ua)
        || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
    );
}

export default function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
    const [isIos, setIsIos] = useState(() => isIosDevice());
    const [isMobile, setIsMobile] = useState(() => isMobileDevice());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsIos(isIosDevice());
        setIsMobile(isMobileDevice());
        setIsInstalled(isStandaloneMode());
        setIsReady(true);

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

    const canNativeInstall = Boolean(deferredPrompt);
    const showIosHint = isIos && !isInstalled;

    return {
        isInstalled,
        isIos,
        isMobile,
        isReady,
        canNativeInstall,
        showIosHint,
        promptInstall,
    };
}
