/**
 * Etiquetas de roles de negocio (tenant). No aplica a la vista /admin de AppsFly.
 * El valor persistido en BD para vendedor sigue siendo "USER".
 */
export function getTenantRoleLabel(role) {
    if (role === "ADMIN") return "Administrador";
    if (role === "USER") return "Vendedor";
    return role ?? "—";
}

export const TENANT_ROLE_SELECT_OPTIONS = [
    { value: "ADMIN", label: "Administrador" },
    { value: "USER", label: "Vendedor" },
];
