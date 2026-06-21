import {
    FaChartLine,
    FaBuilding,
    FaTicketAlt,
    FaLayerGroup,
    FaArrowLeft,
    FaCog,
    FaCreditCard,
    FaUsers,
    FaMoneyBillWave,
    FaEnvelope,
    FaBell,
    FaRobot,
} from "react-icons/fa";

export const ADMIN_NAV_ITEMS = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaChartLine },
    { name: "Notificaciones", path: "/admin/notifications", icon: FaBell },
    { name: "Tareas agente", path: "/admin/agent-tasks", icon: FaRobot, ownerOnly: true },
    { name: "Usuarios", path: "/admin/users", icon: FaUsers },
    { name: "Pagos", path: "/admin/payments", icon: FaMoneyBillWave },
    { name: "Suscripciones", path: "/admin/subscriptions", icon: FaCreditCard },
    { name: "Campañas email", path: "/admin/email-campaigns", icon: FaEnvelope },
    { name: "Prospectos email", path: "/admin/email-prospects", icon: FaUsers },
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
