import {
    FaChartLine,
    FaBuilding,
    FaTicketAlt,
    FaLayerGroup,
    FaArrowLeft,
    FaCog,
    FaCreditCard,
} from "react-icons/fa";

export const ADMIN_NAV_ITEMS = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaChartLine },
    { name: "Suscripciones", path: "/admin/subscriptions", icon: FaCreditCard },
    { name: "Tickets globales", path: "/admin/tickets", icon: FaTicketAlt },
    { name: "Empresas", path: "/admin/businesses", icon: FaBuilding },
    { name: "Planes", path: "/admin/plans", icon: FaLayerGroup },
    { name: "Configuración", path: "/admin/settings", icon: FaCog, disabled: true },
];

export const ADMIN_EXIT_ITEM = {
    name: "Panel del negocio",
    path: "/dashboard",
    icon: FaArrowLeft,
};
