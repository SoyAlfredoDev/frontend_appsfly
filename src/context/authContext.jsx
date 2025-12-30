import { useContext, useState, createContext, useEffect } from "react";
import { registerRequest, loginRequest, logoutRequest, authVerifyRequest } from "../api/auth.js";
import { userGuestExistsRequest } from "../api/userGuest.js";
import { getUserBusinessById } from '../api/userBusiness.js';
import { getUserByIdRequest, userIsSuperAdminRequest } from "../api/user.js";
import { getSubscriptionsByBusinessIdRequest } from "../api/subscription.js";
import { getBusinessByIdRequest } from "../api/business.js";

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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [business, setBusiness] = useState(null);

    // Check if the user has pending guest invitations
    const searchUserGuestExists = async (email) => {
        try {
            const res = await userGuestExistsRequest(email);
            if (res.data.length > 0) {
                setUserGuestExists(res.data);
            }
        } catch (error) {
            console.log("Error in searchUserGuestExists:", error);
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
            setSubscriptions(res.data);
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
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
            await searchUserGuestExists(data.userEmail);
            // Get the business linked to the new user
            const business = await searchBusinessByUserId(data.userId);
            // Use the business directly (not businessSelected)
            if (business) {
                await getSubscriptionsByBusinessId(business.businessId);
            }
            return data;
        } catch (error) {
            return { error: error.response.data.error }
        }
    };

    // Signin process
    const signin = async (userForm) => {
        try {
            const res = await loginRequest(userForm);
            const data = res.data.user;
            localStorage.setItem('token', res.data.token);
            await checkIfUserIsSuperAdmin();
            setUser(data);
            setIsAuthenticated(true);
            await searchUserGuestExists(data.userEmail);

            const business = await searchBusinessByUserId(data.userId);
            if (business) {
                await getSubscriptionsByBusinessId(business.userBusinessBusinessId);
                await searchBusinessByBusinessId(business.userBusinessBusinessId);
            }
            checkIfUserIsSuperAdmin();
            return data;
        } catch (error) {
            console.log("Error in signin", error );

        }
    };

    // Logout process
    const logout = async () => {
        await logoutRequest();
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setUserGuestExists(false);
        setHasBusiness(false);
        setSubscriptions([]);
        setBusinessSelected(null);
    };

    // Restore session automatically using Bearer Token
    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem("token");

            // ❌ No hay token → no hay sesión
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
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
                await searchUserGuestExists(userData.userEmail);

                // 4) Buscar negocio asociado
                const business = await searchBusinessByUserId(userData.userId);

                if (business) {
                    const subscriptions = await getSubscriptionsByBusinessId(
                        business.userBusinessBusinessId

                    );
                    await searchBusinessByBusinessId(business.userBusinessBusinessId);
                }
                checkIfUserIsSuperAdmin()


            } catch (error) {
                // ❌ Token expiró o inválido → limpiar
                console.log("Auth restore error:", error);

                localStorage.removeItem("token");
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                // Cerrar loading del auth
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
                userGuestExists,
                setUserGuestExists,
                hasBusiness,
                setHasBusiness,
                businessSelected,
                setBusinessSelected,
                subscriptions,
                setSubscriptions,
                searchUserGuestExists,
                isSuperAdmin,
                business

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
