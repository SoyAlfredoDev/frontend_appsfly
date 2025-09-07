import { useContext, useState, createContext } from "react";
import { registerRequest, loginRequest, logoutRequest } from "../api/auth.js";
import { userGuestExistsRequest } from "../api/userGuest.js";
import { getUserBusinessById } from '../api/userBusiness.js'

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userGuestExists, setUserGuestExists] = useState(false);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [businessSelected, setBusinessSelected] = useState(null);


    // Check if user guest exists
    const searchUserGuestExists = async (email) => {
        try {
            const res = await userGuestExistsRequest(email);
            console.log("res userGuestExistsRequest:", res, email);
            if (res.data.length > 0) {
                setUserGuestExists(res.data);
            }
        } catch (error) {
            console.log("Error en searchUserGuestExists AuthContext.jsx:", error);
        }
    };

    // Check if user has business associated
    const searchBusinessByUserId = async (userId) => {
        try {
            const userBusiness = await getUserBusinessById(userId);
            const result = userBusiness.data.length > 0;
            setHasBusiness(result);
            setBusinessSelected(userBusiness.data[0]);

            return userBusiness
        } catch (error) {
            console.error("Error fetching user business:", error);
        }
    };

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            const data = res.data.user
            setUser(data);
            setIsAuthenticated(true)
            await searchUserGuestExists(data.userEmail)
            await searchBusinessByUserId(data.userId)
            return data
        } catch (error) {
            console.log("Error en AuthContext.jsx:", error);
        }
    };

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            const data = res.data.user
            setUser(data);
            setIsAuthenticated(true);
            await searchUserGuestExists(data.userEmail)
            await searchBusinessByUserId(data.userId)
            return data
        } catch (error) {
            console.log("Error en singin AuthContext.jsx:", error);
        }
    };

    const logout = async () => {
        await logoutRequest()
        setUser(null)
        setIsAuthenticated(false)
        setUserGuestExists(false)
        setHasBusiness(false)
    }


    return (
        <AuthContext.Provider value={{ signup, user, signin, isAuthenticated, logout, setUser, userGuestExists, hasBusiness, setHasBusiness, businessSelected }}>
            {children}
        </AuthContext.Provider>
    );
};
