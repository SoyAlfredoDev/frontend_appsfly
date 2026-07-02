import { createPortal } from "react-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function AnnouncementOverlay({
    open,
    onClose,
    onDismissForever,
    dismissForeverLabel = "No volver a mostrar este mensaje",
    children,
}) {
    if (typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <Motion.div
                    className="fixed inset-0 z-[10050] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    role="presentation"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
                        aria-label="Cerrar anuncio"
                        onClick={onClose}
                    />

                    <Motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="announcement-title"
                        aria-describedby="announcement-desc"
                        className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden max-h-[92dvh] flex flex-col"
                        initial={{ opacity: 0, y: 32, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            aria-label="Cerrar"
                        >
                            <FaTimes />
                        </button>

                        <div className="px-6 pt-8 pb-5 sm:px-8 sm:pt-10 sm:pb-6 overflow-y-auto flex-1">
                            {children}
                        </div>

                        <div className="px-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-6 pt-2 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Ahora no
                            </button>
                            {onDismissForever && (
                                <button
                                    type="button"
                                    onClick={onDismissForever}
                                    className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {dismissForeverLabel}
                                </button>
                            )}
                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
