import { useMemo } from "react";
import { useAuth } from "../context/authContext.jsx";
import {
    canAccessNavPath,
    canAccessRoute,
    hasTenantPermission,
    normalizeTenantRole,
    TENANT_ROLES,
} from "../utils/tenantPermissions.js";
import { isOpticsBusiness } from "../utils/businessModality.js";
import { isPathDisabledForOptics } from "../components/layout/navigationConfig.js";

export default function useTenantPermissions() {
    const { businessSelected, business } = useAuth();
    const role = normalizeTenantRole(businessSelected?.userBusinessRole);
    const isTenantAdmin = role === TENANT_ROLES.ADMIN;
    const optics = isOpticsBusiness(business);

    return useMemo(
        () => ({
            role,
            isTenantAdmin,
            isTenantUser: !isTenantAdmin,
            can: (permission) => hasTenantPermission(role, permission),
            canAccessNav: (path) => {
                if (optics && isPathDisabledForOptics(path)) return false;
                return canAccessNavPath(role, path);
            },
            canAccessRoute: (pathname) => {
                if (optics && isPathDisabledForOptics(pathname)) return false;
                return canAccessRoute(role, pathname);
            },
        }),
        [role, isTenantAdmin, optics],
    );
}
