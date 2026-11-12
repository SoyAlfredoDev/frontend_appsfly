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
import { isPathAvailableForBusiness, isPathDisabledForOptics } from "../components/layout/navigationConfig.js";

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
                if (!isPathAvailableForBusiness(path, business)) return false;
                if (optics && isPathDisabledForOptics(path)) return false;
                return canAccessNavPath(role, path);
            },
            canAccessRoute: (pathname) => {
                if (!isPathAvailableForBusiness(pathname, business)) return false;
                if (optics && isPathDisabledForOptics(pathname)) return false;
                return canAccessRoute(role, pathname);
            },
        }),
        [role, isTenantAdmin, optics, business],
    );
}
