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
        const seo = resolveSeoForPath(pathname);
        applySeo(seo);
    }, [pathname]);

    return null;
}
