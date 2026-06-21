import { Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaChartBar } from "react-icons/fa";

const TABS = [
    {
        id: "catalog",
        path: "/admin/email-campaigns",
        label: "Catálogo",
        icon: FaEnvelope,
    },
    {
        id: "history",
        path: "/admin/email-campaigns/history",
        label: "Historial de envíos",
        icon: FaChartBar,
    },
];

function isCatalogActive(pathname) {
    if (pathname === "/admin/email-campaigns" || pathname === "/admin/email-campaigns/new") {
        return true;
    }
    // Vista de campaña: /admin/email-campaigns/:id (sin /history ni /settings)
    return /^\/admin\/email-campaigns\/[^/]+$/.test(pathname);
}

function isHistoryActive(pathname) {
    return pathname === "/admin/email-campaigns/history" || pathname.endsWith("/history");
}

export default function EmailCampaignSubNav() {
    const { pathname } = useLocation();

    const isActive = (tab) => {
        if (tab.id === "catalog") return isCatalogActive(pathname);
        if (tab.id === "history") return isHistoryActive(pathname);
        return false;
    };

    return (
        <nav
            className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-1"
            aria-label="Secciones de campañas de email"
        >
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab);
                return (
                    <Link
                        key={tab.id}
                        to={tab.path}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium no-underline border-b-2 -mb-px transition-colors ${
                            active
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        }`}
                    >
                        <Icon className="text-xs" />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
