import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export default function LandingImageLightbox({
    isOpen,
    onClose,
    images = [],
    startIndex = 0,
}) {
    const [index, setIndex] = useState(startIndex);
    const [status, setStatus] = useState('loading');

    const hasMultiple = images.length > 1;
    const current = images[index];

    useEffect(() => {
        if (isOpen) setIndex(startIndex);
    }, [isOpen, startIndex]);

    useEffect(() => {
        if (!isOpen) return undefined;
        setStatus('loading');

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasMultiple) {
                setIndex((prev) => (prev - 1 + images.length) % images.length);
            }
            if (e.key === 'ArrowRight' && hasMultiple) {
                setIndex((prev) => (prev + 1) % images.length);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, hasMultiple, images.length]);

    const goPrev = useCallback(() => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goNext = useCallback(() => {
        setIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    if (!images.length) return null;

    const lightbox = (
        <AnimatePresence>
            {isOpen && current && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label={current.title || current.alt || 'Vista ampliada'}
                >
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark/85 backdrop-blur-sm"
                        aria-label="Cerrar vista ampliada"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-6xl flex flex-col max-h-[94vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 mb-3 px-1">
                            <div className="min-w-0">
                                {current.title && (
                                    <p className="text-white font-semibold text-sm sm:text-base truncate">
                                        {current.title}
                                    </p>
                                )}
                                {hasMultiple && (
                                    <p className="text-white/60 text-xs mt-0.5">
                                        {index + 1} de {images.length}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Cerrar"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="relative flex-1 flex items-center justify-center min-h-[200px] rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                            {status === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            )}

                            <img
                                key={current.src}
                                src={current.src}
                                alt={current.alt || ''}
                                draggable={false}
                                onLoad={() => setStatus('ready')}
                                onError={() => setStatus('error')}
                                className={`max-w-full max-h-[78vh] w-auto h-auto object-contain transition-opacity duration-300 ${
                                    status === 'ready' ? 'opacity-100' : 'opacity-0'
                                }`}
                            />

                            {status === 'error' && (
                                <p className="text-white/80 text-sm">No se pudo cargar la imagen.</p>
                            )}

                            {hasMultiple && (
                                <>
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        aria-label="Imagen anterior"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:text-primary transition-colors"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        aria-label="Imagen siguiente"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:text-primary transition-colors"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === 'undefined') return null;

    return createPortal(lightbox, document.body);
}
