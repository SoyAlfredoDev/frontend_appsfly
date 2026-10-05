import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveSeoForPath } from "../../config/seoConfig.js";
import { applySeo } from "../../utils/applySeo.js";

/**
 * Sincroniza SEO / OG / robots según la ruta activa del SPA.
 */
export default function RouteSeo() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === "/registarcita" || pathname.startsWith("/registarcita/")) return;
        const seo = resolveSeoForPath(pathname, {
            hostname: typeof window !== "undefined" ? window.location.hostname : "",
        });
        applySeo(seo);
    }, [pathname]);

    return null;
}
