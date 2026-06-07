import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaDownload, FaExclamationCircle } from "react-icons/fa";
import { downloadFileFromUrl } from "../../utils/downloadFile.js";

function getExtensionFromUrl(url) {
    const clean = url.split("?")[0];
    const match = clean.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1]?.toLowerCase() ?? "jpg";
}

export default function ImagePreviewModal({
    isOpen,
    onClose,
    imageUrl,
    title = "Vista previa",
    alt = "Imagen",
    downloadFilename = "imagen",
}) {
    const [status, setStatus] = useState("loading");
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!isOpen || !imageUrl) return undefined;

        setStatus("loading");

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, imageUrl, onClose]);

    const handleDownload = async () => {
        if (!imageUrl || isDownloading) return;
        setIsDownloading(true);
        try {
            const extension = getExtensionFromUrl(imageUrl);
            const filename = downloadFilename.includes(".")
                ? downloadFilename
                : `${downloadFilename}.${extension}`;
            await downloadFileFromUrl(imageUrl, filename);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && imageUrl && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="image-preview-title"
                >
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
                    />

                    <Motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 12 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 12 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-5xl flex flex-col max-h-[92vh]"
                    >
                        <div className="flex items-center justify-between gap-3 mb-3 px-1">
                            <h3
                                id="image-preview-title"
                                className="text-white font-semibold text-sm sm:text-base truncate"
                            >
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={isDownloading || status === "error"}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <FaDownload className="text-xs" />
                                    {isDownloading ? "Descargando..." : "Descargar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center min-h-[240px] rounded-xl overflow-hidden bg-black/30 border border-white/10">
                            {status === "loading" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="animate-spin h-10 w-10 border-2 border-white rounded-full border-t-transparent" />
                                    <p className="text-sm text-white/70">Cargando imagen...</p>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                                    <FaExclamationCircle className="text-3xl text-amber-400" />
                                    <p className="text-sm font-medium text-white">
                                        No se pudo cargar la imagen
                                    </p>
                                </div>
                            )}

                            <img
                                key={imageUrl}
                                src={imageUrl}
                                alt={alt}
                                draggable={false}
                                onLoad={() => setStatus("ready")}
                                onError={() => setStatus("error")}
                                className={`max-w-full max-h-[75vh] object-contain transition-opacity duration-300 ${
                                    status === "ready" ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
