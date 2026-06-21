import { useEffect, useState } from "react";
import { userIsPlatformOwnerRequest } from "../api/user.js";
import { useAuth } from "../context/authContext.jsx";

export function usePlatformOwner() {
    const { isAuthenticated, loadingAuth } = useAuth();
    const [isPlatformOwner, setIsPlatformOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loadingAuth) return;

        if (!isAuthenticated) {
            setIsPlatformOwner(false);
            setLoading(false);
            return;
        }

        let cancelled = false;

        userIsPlatformOwnerRequest()
            .then((res) => {
                if (!cancelled) {
                    setIsPlatformOwner(Boolean(res.data?.isPlatformOwner));
                }
            })
            .catch(() => {
                if (!cancelled) setIsPlatformOwner(false);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, loadingAuth]);

    return { isPlatformOwner, loadingPlatformOwner: loading };
}
