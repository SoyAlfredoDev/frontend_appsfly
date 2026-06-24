import { useContext, useState, createContext, useEffect, useMemo, useCallback } from "react";
import { registerRequest, loginRequest, logoutRequest, authVerifyRequest } from "../api/auth.js";
import { getMyPendingInvitesRequest } from "../api/userGuest.js";
import { getUserBusinessById } from '../api/userBusiness.js';
import { getUserByIdRequest, userIsSuperAdminRequest } from "../api/user.js";
import { getSubscriptionsByBusinessIdRequest } from "../api/subscription.js";
import { getBusinessByIdRequest } from "../api/business.js";
import {
    getSubscriptionAccessState,
    hasActiveSubscription as checkActiveSubscription,
    hasSubscriptionHistory as checkSubscriptionHistory,
    canClaimFreeTrial as checkCanClaimFreeTrial,
    isFirstTimeSubscriber as checkFirstTimeSubscriber,
    isExpiredSubscriber as checkExpiredSubscriber,
} from "../utils/subscriptionAccess.js";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userGuestExists, setUserGuestExists] = useState(false);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [businessSelected, setBusinessSelected] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [tenantAccessReady, setTenantAccessReady] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [business, setBusiness] = useState(null);

    useEffect(() => {
        const businessId =
            businessSelected?.userBusinessBusinessId ??
            businessSelected?.businessId ??
            null;
        if (businessId) {
            sessionStorage.setItem("appsfly_business_id", businessId);
        } else {
            sessionStorage.removeItem("appsfly_business_id");
        }
    }, [businessSelected]);

    const subscriptionAccess = useMemo(
        () => getSubscriptionAccessState(subscriptions),
        [subscriptions],
    );

    const hasActiveSubscription = useMemo(
        () => checkActiveSubscription(subscriptions),
        [subscriptions],
    );

    const hasSubscriptionHistory = useMemo(
        () => checkSubscriptionHistory(subscriptions),
        [subscriptions],
    );

    const canClaimFreeTrial = useMemo(
        () => checkCanClaimFreeTrial(subscriptions),
        [subscriptions],
    );

    const isFirstTimeSubscriber = useMemo(
        () => checkFirstTimeSubscriber(subscriptions),
        [subscriptions],
    );

    const isExpiredSubscriber = useMemo(
        () => checkExpiredSubscriber(subscriptions),
        [subscriptions],
    );

    const refreshSubscriptions = useCallback(async (overrideBusinessId) => {
        const businessId =
            overrideBusinessId ??
            businessSelected?.userBusinessBusinessId ??
            businessSelected?.businessId;
        if (!businessId) {
            setSubscriptions([]);
            return [];
        }
        try {
            const res = await getSubscriptionsByBusinessIdRequest(businessId);
            const list = Array.isArray(res.data) ? res.data : [];
            setSubscriptions(list);
            return list;
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSubscriptions([]);
            return [];
        }
    }, [businessSelected]);

    /** Recarga negocio, suscripciones y datos del tenant tras crear negocio o cambiar contexto. */
    const reloadTenantContext = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const userBusiness = await getUserBusinessById(userId);
            const list = userBusiness.data ?? [];
            const exists = list.length > 0;
            const selected = list[0] ?? null;

            setHasBusiness(exists);
            setBusinessSelected(selected);

            if (selected?.userBusinessBusinessId) {
                await getSubscriptionsByBusinessId(selected.userBusinessBusinessId);
                await searchBusinessByBusinessId(selected.userBusinessBusinessId);
            } else {
                setSubscriptions([]);
                setBusiness(null);
            }

            return selected;
        } catch (error) {
            console.error("Error reloading tenant context:", error);
            return null;
        }
    }, []);

    // Check if the user has pending guest invitations
    const searchUserGuestExists = async () => {
        try {
            const res = await getMyPendingInvitesRequest();
            const list = Array.isArray(res.data) ? res.data : [];
            if (list.length > 0) {
                setUserGuestExists(list);
            } else {
                setUserGuestExists(false);
            }
            return list;
        } catch (error) {
            console.log("Error in searchUserGuestExists:", error);
            setUserGuestExists(false);
            return [];
        }
    };

    const checkIfUserIsSuperAdmin = async () => {
        try {
            const res = await userIsSuperAdminRequest();
            setIsSuperAdmin(res.data.isSuperAdmin);
        } catch (error) {
            console.log("Error in checkIfUserIsSuperAdmin:", error);
        }
    };

    // Check businesses associated with this user
    const searchBusinessByUserId = async (userId) => {
        try {
            const userBusiness = await getUserBusinessById(userId);
            const exists = userBusiness.data.length > 0;

            setHasBusiness(exists);

            if (exists) {
                setBusinessSelected(userBusiness.data[0]);
            }


            // Always return the actual response so we can use it immediately
            return userBusiness.data[0] ?? null;

        } catch (error) {
            console.error("Error fetching user business:", error);
        }
    };

    const searchBusinessByBusinessId = async (businessId) => {
        try {
            const businessFound = await getBusinessByIdRequest(businessId);
            setBusiness(businessFound.data);
        } catch (error) {
            console.error("Error fetching user business:", error);
        }
    };

    // Fetch subscriptions by businessId
    const getSubscriptionsByBusinessId = async (businessId) => {
        try {
            const res = await getSubscriptionsByBusinessIdRequest(businessId);
            const list = Array.isArray(res.data) ? res.data : [];
            setSubscriptions(list);
            return list;
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSubscriptions([]);
            return [];
        }
    };

    // Signup process
    const signup = async (userForm) => {
        try {
            const res = await registerRequest(userForm);
            console.log(res)
            if (res.status == 400) {
                return { error: res.data.error }
            }
            const data = res.data.user;
            localStorage.setItem('token', res.data.token);
            setUser(data);
            setIsAuthenticated(true);
            await searchUserGuestExists();
            // Get the business linked to the new user
            const business = await searchBusinessByUserId(data.userId);
            // Use the business directly (not businessSelected)
            if (business) {
                await getSubscriptionsByBusinessId(business.userBusinessBusinessId);
            }
            setTenantAccessReady(true);
            return { ...data, emailSent: res.data.emailSent !== false };
        } catch (error) {
            return { error: error.response.data.error }
        }
    };

    // Signin process
    const signin = async (userForm) => {
        let res;
        try {
            res = await loginRequest(userForm);
        } catch (error) {
            console.log("Error in signin", error);
            throw error;
        }

        const data = res.data?.user;
        if (!data?.userId) {
            const invalidResponseError = new Error("Invalid login response");
            invalidResponseError.response = { status: 500 };
            throw invalidResponseError;
        }

        localStorage.setItem('token', res.data.token);
        setUser(data);
        setIsAuthenticated(true);

        try {
            await checkIfUserIsSuperAdmin();
            await searchUserGuestExists();

            const business = await searchBusinessByUserId(data.userId);
            if (business) {
                await getSubscriptionsByBusinessId(business.userBusinessBusinessId);
                await searchBusinessByBusinessId(business.userBusinessBusinessId);
            }
        } catch (postLoginError) {
            console.error("Error loading post-login data:", postLoginError);
        } finally {
            setTenantAccessReady(true);
        }

        return data;
    };

    // Logout process
    const logout = async () => {
        await logoutRequest();
        localStorage.removeItem('token');
        sessionStorage.removeItem('appsfly_business_id');
        setUser(null);
        setIsAuthenticated(false);
        setUserGuestExists(false);
        setHasBusiness(false);
        setSubscriptions([]);
        setBusinessSelected(null);
        setTenantAccessReady(false);
        setIsSuperAdmin(false);
    };

    // Restore session automatically using Bearer Token
    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem("token");

            // ❌ No hay token → no hay sesión
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setTenantAccessReady(true);
                setLoadingAuth(false);
                return;
            }

            try {
                
                // 1) Validar token en backend
                const res = await authVerifyRequest(); // Este ya envía el Bearer por el interceptor

                const userId = res?.data.id;

                // 2) Obtener datos completos del usuario
                const userFound = await getUserByIdRequest(userId);
                const userData = userFound.data;

                setUser(userData);
                setIsAuthenticated(true);

                // 3) Verificar invitado (guest)
                await searchUserGuestExists();

                // 4) Buscar negocio asociado
                const business = await searchBusinessByUserId(userData.userId);

                if (business) {
                    await getSubscriptionsByBusinessId(business.userBusinessBusinessId);
                    await searchBusinessByBusinessId(business.userBusinessBusinessId);
                }
                await checkIfUserIsSuperAdmin();
            } catch (error) {
                // ❌ Token expiró o inválido → limpiar
                console.log("Auth restore error:", error);

                localStorage.removeItem("token");
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setTenantAccessReady(true);
                setLoadingAuth(false);
            }
        };

        checkLogin();
    }, []);


    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                logout,
                user,
                setUser,
                isAuthenticated,
                loadingAuth,
                tenantAccessReady,
                userGuestExists,
                setUserGuestExists,
                hasBusiness,
                setHasBusiness,
                businessSelected,
                setBusinessSelected,
                subscriptions,
                setSubscriptions,
                subscriptionAccess,
                hasActiveSubscription,
                hasSubscriptionHistory,
                canClaimFreeTrial,
                isFirstTimeSubscriber,
                isExpiredSubscriber,
                refreshSubscriptions,
                reloadTenantContext,
                searchUserGuestExists,
                isSuperAdmin,
                business,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
