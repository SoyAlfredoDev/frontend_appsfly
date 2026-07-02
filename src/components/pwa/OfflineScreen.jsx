import { useEffect, useState } from "react";
import { FaWifi, FaRedo } from "react-icons/fa";

export default function OfflineScreen() {
    const [isOffline, setIsOffline] = useState(
        typeof navigator !== "undefined" ? !navigator.onLine : false,
    );

    useEffect(() => {
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);

        window.addEventListener("offline", goOffline);
        window.addEventListener("online", goOnline);
        return () => {
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("online", goOnline);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            role="alertdialog"
            aria-labelledby="offline-title"
            aria-describedby="offline-desc"
        >
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <FaWifi className="text-2xl rotate-45" />
                </div>
                <h2 id="offline-title" className="text-lg font-bold text-slate-900">
                    Sin conexión a internet
                </h2>
                <p id="offline-desc" className="mt-2 text-sm text-slate-600 leading-relaxed">
                    AppsFly necesita conexión para sincronizar ventas, inventario y datos de tu negocio.
                    La interfaz instalada seguirá disponible cuando vuelvas a estar en línea.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                >
                    <FaRedo />
                    Reintentar
                </button>
            </div>
        </div>
    );
}
