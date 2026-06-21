import { useMemo } from "react";
import { useAuth } from "../context/authContext.jsx";
import {
    canAccessNavPath,
    canAccessRoute,
    hasTenantPermission,
    normalizeTenantRole,
    TENANT_ROLES,
} from "../utils/tenantPermissions.js";

export default function useTenantPermissions() {
    const { businessSelected } = useAuth();
    const role = normalizeTenantRole(businessSelected?.userBusinessRole);
    const isTenantAdmin = role === TENANT_ROLES.ADMIN;

    return useMemo(
        () => ({
            role,
            isTenantAdmin,
            isTenantUser: !isTenantAdmin,
            can: (permission) => hasTenantPermission(role, permission),
            canAccessNav: (path) => canAccessNavPath(role, path),
            canAccessRoute: (pathname) => canAccessRoute(role, pathname),
        }),
        [role, isTenantAdmin],
    );
}
