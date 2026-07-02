import { useCallback, useEffect, useState } from "react";

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

export default function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(isStandaloneMode);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        setIsIos(isIosDevice());
        setIsInstalled(isStandaloneMode());

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
        canNativeInstall,
        showIosHint,
        promptInstall,
    };
}
