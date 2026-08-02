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
  FaCalendarAlt,
  FaCalendarCheck,
  FaFileAlt,
  FaBoxes,
  FaBullhorn,
  FaFileInvoice,
  FaCog,
  FaFlask,
  FaClipboardList,
  FaTruckLoading,
  FaFileMedical,
  FaCashRegister,
  FaUserInjured,
} from "react-icons/fa";
import { isOpticsBusiness } from "../../utils/businessModality.js";

/**
 * Rutas temporalmente deshabilitadas en modalidad Óptica
 * (ocultas del menú y bloqueadas en TenantRoleGate).
 */
export const OPTICS_DISABLED_PATH_PREFIXES = [
  "/campaigns-asmr",
  "/transactions",
];

/**
 * Ítems planos (modalidad por defecto / no óptica).
 * `hideForOptics`: no se muestran ni son accesibles en óptica.
 * `opticsOnly`: solo en óptica (en el menú plano legacy; en óptica usan el árbol).
 */
export const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: FaChartLine, permission: "dashboard:view" },
  { name: "Clientes", path: "/customers", icon: FaUsers, permission: "customers:read" },
  { name: "Citas", path: "/appointments", icon: FaCalendarAlt, permission: "appointments:manage" },
  { name: "Campaña ASMR", path: "/campaigns-asmr", icon: FaBullhorn, permission: "campaigns:manage", hideForOptics: true },
  { name: "Productos", path: "/products_services", icon: FaBoxOpen, permission: "products:read" },
  { name: "Inventario", path: "/inventory", icon: FaBoxes, permission: "inventory:read" },
  { name: "Ventas", path: "/sales", icon: FaShoppingCart, permission: "sales:read" },
  { name: "Cotizaciones", path: "/quotations", icon: FaFileAlt, permission: "quotations:read" },
  { name: "Laboratorios", path: "/laboratories", icon: FaFlask, permission: "optics:manage", opticsOnly: true },
  { name: "Órdenes de Trabajo", path: "/work-orders", icon: FaClipboardList, permission: "optics:read", opticsOnly: true },
  { name: "Despachos Lab", path: "/lab-dispatches", icon: FaTruckLoading, permission: "optics:read", opticsOnly: true },
  { name: "Certificados Compra", path: "/purchase-certificates", icon: FaFileMedical, permission: "optics:read", opticsOnly: true },
  { name: "Cierres Diarios", path: "/sales/dailySales", icon: FaCalendarCheck, permission: "daily-closures:read" },
  { name: "Compras", path: "/purchase", icon: FaTruck, permission: "purchases:manage" },
  { name: "Proveedores", path: "/providers", icon: FaStore, permission: "providers:manage" },
  { name: "Gastos", path: "/expenses", icon: FaReceipt, permission: "expenses:manage" },
  { name: "Reportes", path: "/reports", icon: FaFileAlt, permission: "reports:read" },
  { name: "Facturación", path: "/billing", icon: FaFileInvoice, permission: "billing:manage" },
  { name: "Transacciones", path: "/transactions", icon: FaExchangeAlt, permission: "transactions:read", hideForOptics: true },
  { name: "Usuarios", path: "/users", icon: FaUserFriends, permission: "users:manage" },
  { name: "Configuración", path: "/configuration", icon: FaCog, permission: "settings:manage" },
  { name: "Perfil", path: "/profile", icon: FaUserCircle, permission: "profile:view" },
];

/**
 * Árbol de navegación para modalidad Óptica (agrupado).
 * Cada grupo reduce enlaces visibles en el menú principal.
 */
export const OPTICS_NAV_TREE = [
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    icon: FaChartLine,
    permission: "dashboard:view",
  },
  {
    id: "patients",
    name: "Pacientes",
    icon: FaUserInjured,
    children: [
      { name: "Clientes", path: "/customers", icon: FaUsers, permission: "customers:read" },
      { name: "Citas", path: "/appointments", icon: FaCalendarAlt, permission: "appointments:manage" },
      { name: "Certificados de Compra", path: "/purchase-certificates", icon: FaFileMedical, permission: "optics:read" },
    ],
  },
  {
    id: "sales",
    name: "Ventas",
    icon: FaShoppingCart,
    children: [
      { name: "Ventas", path: "/sales", icon: FaShoppingCart, permission: "sales:read" },
      { name: "Cotizaciones", path: "/quotations", icon: FaFileAlt, permission: "quotations:read" },
      { name: "Facturación", path: "/billing", icon: FaFileInvoice, permission: "billing:manage" },
    ],
  },
  {
    id: "work-orders",
    name: "Órdenes de Trabajo",
    icon: FaClipboardList,
    children: [
      { name: "Órdenes de Trabajo", path: "/work-orders", icon: FaClipboardList, permission: "optics:read" },
      { name: "Laboratorios", path: "/laboratories", icon: FaFlask, permission: "optics:manage" },
      { name: "Despachos Lab", path: "/lab-dispatches", icon: FaTruckLoading, permission: "optics:read" },
    ],
  },
  {
    id: "inventory",
    name: "Inventario",
    icon: FaBoxes,
    children: [
      { name: "Productos", path: "/products_services", icon: FaBoxOpen, permission: "products:read" },
      { name: "Inventario", path: "/inventory", icon: FaBoxes, permission: "inventory:read" },
      { name: "Compras", path: "/purchase", icon: FaTruck, permission: "purchases:manage" },
      { name: "Proveedores", path: "/providers", icon: FaStore, permission: "providers:manage" },
    ],
  },
  {
    id: "cash",
    name: "Caja",
    icon: FaCashRegister,
    children: [
      { name: "Cierres Diarios", path: "/sales/dailySales", icon: FaCalendarCheck, permission: "daily-closures:read" },
      { name: "Gastos", path: "/expenses", icon: FaReceipt, permission: "expenses:manage" },
    ],
  },
  {
    id: "reports",
    name: "Reportes",
    path: "/reports",
    icon: FaFileAlt,
    permission: "reports:read",
  },
  {
    id: "settings",
    name: "Configuración",
    icon: FaCog,
    children: [
      { name: "Usuarios", path: "/users", icon: FaUserFriends, permission: "users:manage" },
      { name: "Configuración", path: "/configuration", icon: FaCog, permission: "settings:manage" },
      { name: "Perfil", path: "/profile", icon: FaUserCircle, permission: "profile:view" },
    ],
  },
];

export function isPathDisabledForOptics(pathname) {
  if (!pathname) return false;
  return OPTICS_DISABLED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * ¿La ruta actual corresponde a este ítem de menú?
 * Evita que `/sales` active también `/sales/dailySales`.
 */
export function isNavPathActive(pathname, itemPath) {
  if (!pathname || !itemPath) return false;
  if (pathname === itemPath) return true;

  if (itemPath === "/sales") {
    return (
      pathname.startsWith("/sales/") &&
      !pathname.startsWith("/sales/dailySales")
    );
  }

  return pathname.startsWith(`${itemPath}/`);
}

function filterLeaf(item, can) {
  if (!item?.path) return false;
  return !item.permission || can(item.permission);
}

function filterNavTree(nodes, can) {
  return nodes
    .map((node) => {
      if (node.children?.length) {
        const children = node.children.filter((child) => filterLeaf(child, can));
        if (children.length === 0) return null;
        return { ...node, children };
      }
      if (!filterLeaf(node, can)) return null;
      return node;
    })
    .filter(Boolean);
}

export function filterNavItemsByRole(items, can) {
  return items.filter((item) => !item.permission || can(item.permission));
}

/**
 * Filtra ítems planos por permiso y modalidad.
 */
export function filterNavItems(items, can, business) {
  const isOptics = isOpticsBusiness(business);
  return items.filter((item) => {
    if (item.opticsOnly && !isOptics) return false;
    if (item.hideForOptics && isOptics) return false;
    return !item.permission || can(item.permission);
  });
}

/**
 * Navegación según tipo de negocio.
 * Fase óptica-first: siempre menú agrupado (árbol).
 *
 * @returns {{ type: 'tree'|'flat', items: array }}
 */
export function getNavigationForBusiness(business, can) {
  void business; // reservado para cuando otras modalidades vuelvan a menú propio
  return {
    type: "tree",
    items: filterNavTree(OPTICS_NAV_TREE, can),
  };
}
