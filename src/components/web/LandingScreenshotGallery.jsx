import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LandingImageLightbox from './LandingImageLightbox.jsx';
import ClickableLandingImage from './ClickableLandingImage.jsx';

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 48 : -48,
        opacity: 0,
        scale: 0.97,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({
        x: direction > 0 ? -48 : 48,
        opacity: 0,
        scale: 0.97,
    }),
};

function NavButton({ onClick, label, children, className }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`
                flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full
                border border-slate-200/80 bg-white/95 text-slate-600 shadow-lg
                backdrop-blur-sm transition-all duration-200
                hover:border-primary/30 hover:text-primary hover:shadow-primary/20
                active:scale-95
                ${className}
            `}
        >
            {children}
        </button>
    );
}

export default function LandingScreenshotGallery({ images = [], className = '' }) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const count = images.length;

    const goTo = useCallback((index) => {
        setDirection(index > active ? 1 : -1);
        setActive(index);
    }, [active]);

    const goNext = useCallback(() => {
        setDirection(1);
        setActive((prev) => (prev + 1) % count);
    }, [count]);

    const goPrev = useCallback(() => {
        setDirection(-1);
        setActive((prev) => (prev - 1 + count) % count);
    }, [count]);

    if (!count) return null;

    const lightboxImages = images.map((shot) => ({
        src: shot.src,
        alt: shot.alt,
        title: shot.title || shot.label,
    }));

    const current = images[active];
    const thumbCols = count >= 3 ? 'grid-cols-3' : 'grid-cols-2';

    return (
        <div className={`relative w-full max-w-xl mx-auto lg:max-w-none lg:mx-0 ${className}`}>
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-2xl" />

            <div className="relative">
                <div className="relative overflow-hidden rounded-2xl">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.figure
                            key={active}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="relative"
                        >
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_24px_60px_-16px_rgba(2,31,65,0.28)] ring-1 ring-slate-900/5">
                                <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                                    <span className="ml-2 flex-1 truncate text-[11px] font-medium text-slate-400">
                                        appsfly.app — {current.label}
                                    </span>
                                    <span className="text-[10px] font-semibold tabular-nums text-slate-300">
                                        {active + 1}/{count}
                                    </span>
                                </div>
                                <ClickableLandingImage
                                    src={current.src}
                                    alt={current.alt}
                                    title={current.title || current.label}
                                    onOpen={() => setLightboxOpen(true)}
                                    imageClassName="block w-full rounded-b-xl object-cover object-top aspect-[16/10]"
                                    loading={active === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                        </motion.figure>
                    </AnimatePresence>

                    {count > 1 && (
                        <>
                            <NavButton
                                onClick={goPrev}
                                label="Imagen anterior"
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                            >
                                <FaChevronLeft className="text-sm" />
                            </NavButton>
                            <NavButton
                                onClick={goNext}
                                label="Imagen siguiente"
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                            >
                                <FaChevronRight className="text-sm" />
                            </NavButton>
                        </>
                    )}
                </div>

                {current.description && (
                    <div className="mt-4 text-center sm:text-left">
                        <p className="text-sm font-semibold text-dark">{current.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{current.description}</p>
                    </div>
                )}

                {count > 1 && (
                    <>
                        <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
                            {images.map((shot, index) => (
                                <button
                                    key={shot.src}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    aria-label={`Ver ${shot.label}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === active ? 'w-7 bg-primary' : 'w-2 bg-slate-300'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className={`mt-4 hidden sm:grid ${thumbCols} gap-2 sm:gap-3`}>
                            {images.map((shot, index) => (
                                <button
                                    key={shot.src}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    aria-label={`Ver ${shot.label}`}
                                    aria-current={index === active ? 'true' : undefined}
                                    className={`
                                        group relative overflow-hidden rounded-lg border-2 transition-all duration-300
                                        ${index === active
                                            ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20'
                                            : 'border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300'}
                                    `}
                                >
                                    <img
                                        src={shot.src}
                                        alt=""
                                        aria-hidden="true"
                                        className="block w-full aspect-[16/10] object-cover object-top"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div
                                        className={`
                                            absolute inset-x-0 bottom-0 px-1.5 py-1 text-[9px] sm:text-[10px] font-semibold text-white
                                            bg-gradient-to-t from-dark/80 to-transparent transition-opacity
                                            ${index === active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                        `}
                                    >
                                        {shot.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <LandingImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={lightboxImages}
                startIndex={active}
            />
        </div>
    );
}
