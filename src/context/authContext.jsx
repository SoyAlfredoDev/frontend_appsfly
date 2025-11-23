import { useContext, useState, createContext, useEffect } from "react";
import { registerRequest, loginRequest, logoutRequest, authVerifyRequest } from "../api/auth.js";
import { userGuestExistsRequest } from "../api/userGuest.js";
import { getUserBusinessById } from '../api/userBusiness.js';
import { getUserByIdRequest } from "../api/user.js";
import { getSubscriptionsByBusinessIdRequest } from "../api/subscription.js";

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
            const data = res.data.user;

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
            console.log("Error in signup:", error);
        }
    };

    // Signin process
    const signin = async (userForm) => {
        try {
            const res = await loginRequest(userForm);
            const data = res.data.user;

            setUser(data);
            setIsAuthenticated(true);

            await searchUserGuestExists(data.userEmail);

            const business = await searchBusinessByUserId(data.userId);

            if (business) {
                await getSubscriptionsByBusinessId(business.userBusinessBusinessId);
            }

            return data;

        } catch (error) {
            console.log("Error in signin:", error);
        }
    };

    // Logout process
    const logout = async () => {
        await logoutRequest();
        setUser(null);
        setIsAuthenticated(false);
        setUserGuestExists(false);
        setHasBusiness(false);
        setSubscriptions([]);
        setBusinessSelected(null);
    };

    // Restore session automatically using HttpOnly cookie
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await authVerifyRequest();
                const userId = res?.data.id;

                // Get full user data
                const userFound = await getUserByIdRequest(userId);
                const userData = userFound.data;

                setUser(userData);
                setIsAuthenticated(true);

                await searchUserGuestExists(userData.userEmail);

                const business = await searchBusinessByUserId(userData.userId);

                if (business) {
                    const subscriptions = await getSubscriptionsByBusinessId(business.businessId);
                    console.log("Restored subscriptions:", subscriptions);
                    setSubscriptions([subscriptions]);
                }

            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
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
                subscriptions,
                setSubscriptions,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
