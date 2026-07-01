import {
  FaChartLine,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaTruck,
  FaStore,
  FaUserFriends,
  FaUserCircle,
  FaReceipt,
  FaExchangeAlt,
  FaCalendarCheck,
  FaFileAlt,
  FaBoxes,
  FaBullhorn,
  FaFileInvoice,
  FaCog,
} from "react-icons/fa";

export const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: FaChartLine, permission: "dashboard:view" },
  { name: "Clientes", path: "/customers", icon: FaUsers, permission: "customers:read" },
  { name: "Campaña ASMR", path: "/campaigns-asmr", icon: FaBullhorn, permission: "campaigns:manage" },
  { name: "Productos", path: "/products_services", icon: FaBoxOpen, permission: "products:read" },
  { name: "Inventario", path: "/inventory", icon: FaBoxes, permission: "inventory:read" },
  { name: "Ventas", path: "/sales", icon: FaShoppingCart, permission: "sales:read" },
  { name: "Cotizaciones", path: "/quotations", icon: FaFileAlt, permission: "quotations:read" },
  { name: "Cierres Diarios", path: "/sales/dailySales", icon: FaCalendarCheck, permission: "daily-closures:read" },
  { name: "Compras", path: "/purchase", icon: FaTruck, permission: "purchases:manage" },
  { name: "Proveedores", path: "/providers", icon: FaStore, permission: "providers:manage" },
  { name: "Gastos", path: "/expenses", icon: FaReceipt, permission: "expenses:manage" },
  { name: "Reportes", path: "/reports", icon: FaFileAlt, permission: "reports:read" },
  { name: "Facturación", path: "/billing", icon: FaFileInvoice, permission: "billing:manage" },
  { name: "Transacciones", path: "/transactions", icon: FaExchangeAlt, permission: "transactions:read" },
  { name: "Usuarios", path: "/users", icon: FaUserFriends, permission: "users:manage" },
  { name: "Configuración", path: "/configuration", icon: FaCog, permission: "settings:manage" },
  { name: "Perfil", path: "/profile", icon: FaUserCircle, permission: "profile:view" },
];

export function filterNavItemsByRole(items, can) {
  return items.filter((item) => !item.permission || can(item.permission));
}
