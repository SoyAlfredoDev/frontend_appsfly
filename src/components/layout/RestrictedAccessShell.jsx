import { motion } from "framer-motion";

/**
 * Contenedor visual compartido para pantallas restrictivas (sin negocio, sin suscripción, etc.).
 */
export default function RestrictedAccessShell({
    icon: Icon,
    title,
    subtitle,
    headerClassName = "bg-gradient-to-br from-[#021f41] via-[#0a2d52] to-[#021f41]",
    embedded = false,
    fullScreen = false,
    compact = false,
    maxWidthClass = "max-w-4xl",
    children,
}) {
    const isCompact = compact || fullScreen;

    const shellClass = fullScreen
        ? "h-full max-h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-surface overflow-hidden"
        : embedded
          ? "w-full"
          : "min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6";

    const cardClass = fullScreen || !embedded ? `w-full ${maxWidthClass}` : "w-full";

    const cardHeightClass = fullScreen
        ? "max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-2rem)] flex flex-col"
        : "";

    const headerPadding = isCompact ? "px-4 py-3 sm:py-3.5" : "p-8 sm:p-10";
    const iconSize = isCompact
        ? "h-10 w-10 text-base mb-1 text-white"
        : "h-20 w-20 text-3xl mb-4 text-white";
    const titleSize = isCompact
        ? "text-2xl sm:text-3xl font-bold mb-1 tracking-tight"
        : "text-2xl sm:text-3xl font-bold mb-2 tracking-tight";
    const subtitleSize = isCompact
        ? "text-xs sm:text-sm font-normal font-sans text-white/90 max-w-md mx-auto leading-snug"
        : "text-sm font-normal font-sans text-white/90 max-w-lg mx-auto leading-relaxed";

    const bodyPadding = isCompact ? "p-3 sm:p-4 space-y-2.5 flex flex-col flex-1 min-h-0 overflow-hidden" : "p-6 sm:p-8 space-y-6";

    return (
        <div className={shellClass}>
            <motion.div
                initial={{ opacity: 0, y: fullScreen ? 12 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl ${cardClass} ${cardHeightClass}`}
            >
                <div className={`shrink-0 text-center text-white ${headerPadding} ${headerClassName}`}>
                    {Icon && (
                        <div
                            className={`mx-auto flex items-center justify-center rounded-full bg-white/15 shadow-inner backdrop-blur-sm ${iconSize}`}
                        >
                            <Icon />
                        </div>
                    )}
                    <h1 className={`font-display text-white ${titleSize}`}>{title}</h1>
                    {subtitle && <p className={subtitleSize}>{subtitle}</p>}
                </div>
                <div className={bodyPadding}>{children}</div>
            </motion.div>
        </div>
    );
}
