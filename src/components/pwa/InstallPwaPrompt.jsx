import { FaDownload, FaMobileAlt, FaTimes, FaShareSquare } from "react-icons/fa";
import usePwaInstall from "../../hooks/usePwaInstall.js";

export default function InstallPwaPrompt({ variant = "card", className = "" }) {
    const {
        isInstalled,
        canNativeInstall,
        showIosHint,
        shouldShowPrompt,
        promptInstall,
        dismiss,
    } = usePwaInstall();

    if (isInstalled || !shouldShowPrompt) {
        return null;
    }

    const handleInstall = async () => {
        if (canNativeInstall) {
            await promptInstall();
        }
    };

    if (variant === "banner") {
        return (
            <div
                className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 ${className}`}
                role="region"
                aria-label="Instalar AppsFly"
            >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                        <FaMobileAlt />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Instala AppsFly en tu dispositivo</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {showIosHint && !canNativeInstall
                                ? "En Safari: Compartir → Añadir a pantalla de inicio."
                                : "Acceso directo, pantalla completa y carga más rápida."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {canNativeInstall && (
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors"
                        >
                            <FaDownload />
                            Instalar
                        </button>
                    )}
                    {showIosHint && !canNativeInstall && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                            <FaShareSquare />
                            Añadir a inicio
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={dismiss}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                        aria-label="Ocultar sugerencia de instalación"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-xl border border-slate-200 bg-slate-50/80 p-4 ${className}`}
            role="region"
            aria-label="Instalar AppsFly"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FaMobileAlt className="text-lg" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Usa AppsFly como app</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {showIosHint && !canNativeInstall
                                ? "Toca Compartir en Safari y elige «Añadir a pantalla de inicio»."
                                : "Instálala para abrirla desde tu pantalla de inicio, sin barra del navegador."}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Cerrar"
                >
                    <FaTimes className="text-xs" />
                </button>
            </div>
            {canNativeInstall && (
                <button
                    type="button"
                    onClick={handleInstall}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                    <FaDownload />
                    Instalar AppsFly
                </button>
            )}
        </div>
    );
}
