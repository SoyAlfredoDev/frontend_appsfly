export const TENANT_ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
};

/** Permisos atómicos por rol de negocio */
const ROLE_PERMISSIONS = {
    ADMIN: [
        "dashboard:view",
        "customers:read",
        "customers:write",
        "customers:delete",
        "sales:read",
        "sales:create",
        "products:read",
        "products:write",
        "inventory:read",
        "inventory:adjust",
        "daily-closures:read",
        "daily-closures:execute",
        "purchases:manage",
        "providers:manage",
        "expenses:manage",
        "transactions:read",
        "reports:read",
        "campaigns:manage",
        "users:manage",
        "profile:view",
        "subscription:read",
        "subscription:manage",
        "support:view",
        "assistant:use",
        "finance:view",
    ],
    USER: [
        "dashboard:view",
        "customers:read",
        "customers:write",
        "sales:read",
        "sales:create",
        "products:read",
        "inventory:read",
        "profile:view",
        "subscription:read",
        "support:view",
    ],
};

/** Rutas del menú → permiso requerido para ver el ítem */
export const NAV_PERMISSION_BY_PATH = {
    "/dashboard": "dashboard:view",
    "/customers": "customers:read",
    "/campaigns-asmr": "campaigns:manage",
    "/products_services": "products:read",
    "/inventory": "inventory:read",
    "/sales": "sales:read",
    "/sales/dailySales": "daily-closures:read",
    "/purchase": "purchases:manage",
    "/providers": "providers:manage",
    "/expenses": "expenses:manage",
    "/reports": "reports:read",
    "/transactions": "transactions:read",
    "/users": "users:manage",
    "/profile": "profile:view",
};

/** Prefijos de ruta restringidos (solo ADMIN) */
const ADMIN_ROUTE_PREFIXES = [
    "/users",
    "/expenses",
    "/purchase",
    "/providers",
    "/transactions",
    "/reports",
    "/finance",
    "/campaigns-asmr",
    "/sales/dailySales",
];

export function normalizeTenantRole(role) {
    return role === TENANT_ROLES.ADMIN ? TENANT_ROLES.ADMIN : TENANT_ROLES.USER;
}

export function hasTenantPermission(role, permission) {
    const normalized = normalizeTenantRole(role);
    const allowed = ROLE_PERMISSIONS[normalized] ?? [];
    return allowed.includes(permission);
}

export function canAccessNavPath(role, path) {
    const permission = NAV_PERMISSION_BY_PATH[path];
    if (!permission) return true;
    return hasTenantPermission(role, permission);
}

export function isAdminRoute(pathname) {
    return ADMIN_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
}

export function canAccessRoute(role, pathname) {
    if (pathname === "/profile" || pathname.startsWith("/profile/")) {
        return hasTenantPermission(role, "profile:view");
    }
    if (pathname === "/support" || pathname.startsWith("/support/")) {
        return hasTenantPermission(role, "support:view");
    }
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        return hasTenantPermission(role, "dashboard:view");
    }
    if (pathname.startsWith("/customers")) {
        return hasTenantPermission(role, "customers:read");
    }
    if (pathname.startsWith("/sales/register") || pathname.startsWith("/sales/view")) {
        return hasTenantPermission(role, "sales:read");
    }
    if (pathname === "/sales" || pathname.startsWith("/sales/")) {
        if (pathname.startsWith("/sales/dailySales")) {
            return hasTenantPermission(role, "daily-closures:read");
        }
        return hasTenantPermission(role, "sales:read");
    }
    if (pathname.startsWith("/products") || pathname.startsWith("/products_services")) {
        return hasTenantPermission(role, "products:read");
    }
    if (pathname.startsWith("/inventory")) {
        return hasTenantPermission(role, "inventory:read");
    }
    if (isAdminRoute(pathname)) {
        return normalizeTenantRole(role) === TENANT_ROLES.ADMIN;
    }
    return true;
}
