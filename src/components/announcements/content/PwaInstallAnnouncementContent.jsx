import { FaBolt, FaDownload, FaMobileAlt, FaShareSquare, FaWifi } from "react-icons/fa";

export default function PwaInstallAnnouncementContent({
    canNativeInstall,
    showIosHint,
    onInstall,
}) {
    return (
        <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <FaMobileAlt className="text-3xl" />
            </div>

            <h2
                id="announcement-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
            >
                Lleva AppsFly en tu pantalla de inicio
            </h2>
            <p
                id="announcement-desc"
                className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto"
            >
                Instala la app para acceder más rápido, usar pantalla completa y tener
                AppsFly siempre a un toque — como una aplicación nativa.
            </p>

            <ul className="mt-5 space-y-2.5 text-left max-w-xs mx-auto">
                {[
                    { icon: FaBolt, text: "Apertura instantánea desde tu dispositivo" },
                    { icon: FaMobileAlt, text: "Experiencia a pantalla completa" },
                    { icon: FaWifi, text: "Interfaz lista incluso con conexión intermitente" },
                ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-slate-700">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary">
                            <Icon className="text-xs" />
                        </span>
                        {text}
                    </li>
                ))}
            </ul>

            {showIosHint && !canNativeInstall && (
                <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <FaShareSquare />
                        En iPhone o iPad (Safari)
                    </p>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Toca <strong>Compartir</strong> y luego{" "}
                        <strong>Añadir a pantalla de inicio</strong>.
                    </p>
                </div>
            )}

            {canNativeInstall && (
                <button
                    type="button"
                    onClick={onInstall}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all active:scale-[0.98]"
                >
                    <FaDownload />
                    Instalar AppsFly
                </button>
            )}

            {!canNativeInstall && showIosHint && (
                <p className="mt-6 text-xs text-slate-500">
                    Sigue los pasos de arriba para añadir el acceso directo.
                </p>
            )}

            {!canNativeInstall && !showIosHint && (
                <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                    En <strong>Chrome</strong> o <strong>Edge</strong>, busca el icono de instalación
                    en la barra de direcciones de tu navegador.
                </p>
            )}
        </div>
    );
}
