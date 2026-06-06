import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { motion as Motion } from "framer-motion";

export default function ProtectedView({ children }) {
    const { loadingAuth, isAuthenticated } = useAuth();

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="flex flex-col items-center gap-4">
                    <Motion.div
                        className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <Motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 font-medium text-sm tracking-wide"
                    >
                        Cargando AppsFly...
                    </Motion.p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
