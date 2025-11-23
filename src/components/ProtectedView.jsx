import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function ProtectedView({ children }) {
    const { loadingAuth, isAuthenticated } = useAuth();

    // While token is being verified
    if (loadingAuth) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Token invalid → redirect
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render page content
    return children;
}
