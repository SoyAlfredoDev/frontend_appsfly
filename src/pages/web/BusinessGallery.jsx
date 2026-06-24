import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import LandingImageLightbox from '../../components/web/LandingImageLightbox.jsx';

const BUSINESSES = [
    {
        src: '/businesses/optica.jpg',
        fallback: '/businesses/optica.jpg',
        alt: 'Óptica',
        label: 'Ópticas',
    },
    {
        src: '/businesses/emprendedor.jpg',
        fallback: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80',
        alt: 'Emprendedor',
        label: 'Emprendedores',
    },
    {
        src: '/businesses/minimarket.jpg',
        fallback: '/businesses/minimarket.jpg',
        alt: 'Mini market',
        label: 'Mini market',
    },
    {
        src: '/businesses/restaurante.jpg',
        fallback: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
        alt: 'Restaurante',
        label: 'Restaurantes',
    },
    {
        src: '/businesses/comercio.jpg',
        fallback: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80',
        alt: 'Comercio local',
        label: 'Comercio',
    },
];

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 40 : -40,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
        x: direction > 0 ? -40 : 40,
        opacity: 0,
    }),
};

function BusinessImage({ item, className = '' }) {
    return (
        <img
            src={item.src}
            alt={item.alt}
            className={className}
            loading="lazy"
            decoding="async"
            onError={(e) => {
                if (item.fallback && e.currentTarget.src !== item.fallback) {
                    e.currentTarget.src = item.fallback;
                }
            }}
        />
    );
}

export default function BusinessGallery() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const lightboxImages = BUSINESSES.map((item) => ({
        src: item.src,
        alt: item.alt,
        title: item.label,
    }));

    const goTo = useCallback((index) => {
        setDirection(index > active ? 1 : -1);
        setActive(index);
    }, [active]);

    const goNext = useCallback(() => {
        setDirection(1);
        setActive((prev) => (prev + 1) % BUSINESSES.length);
    }, []);

    const goPrev = useCallback(() => {
        setDirection(-1);
        setActive((prev) => (prev - 1 + BUSINESSES.length) % BUSINESSES.length);
    }, []);

    const current = BUSINESSES[active];

    return (
        <div className="relative w-full">
            <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(2,31,65,0.2)]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.figure
                        key={active}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="relative aspect-[4/3] sm:aspect-[5/4]"
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            className="absolute inset-0 w-full h-full cursor-zoom-in group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                            aria-label={`Ver imagen completa: ${current.label}`}
                        >
                            <BusinessImage
                                item={current}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <span className="pointer-events-none absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors" />
                            <span className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-dark/55 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <FaExpand className="text-[10px]" />
                                Ver completa
                            </span>
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/15 to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                            <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                {current.label}
                            </span>
                        </figcaption>
                    </motion.figure>
                </AnimatePresence>

                <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-700 shadow-lg hover:text-primary transition-colors"
                >
                    <FaChevronLeft className="text-sm" />
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    aria-label="Siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/90 text-slate-700 shadow-lg hover:text-primary transition-colors"
                >
                    <FaChevronRight className="text-sm" />
                </button>
            </div>

            <div className="hidden sm:grid grid-cols-5 gap-2 mt-3">
                {BUSINESSES.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={item.label}
                        aria-current={index === active ? 'true' : undefined}
                        className={`
                            relative overflow-hidden rounded-lg aspect-[4/3] transition-all duration-300
                            ${index === active
                                ? 'ring-2 ring-primary ring-offset-2 opacity-100'
                                : 'opacity-60 hover:opacity-90'}
                        `}
                    >
                        <BusinessImage item={item} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-dark/70 py-1 text-[9px] font-semibold text-white text-center truncate px-1">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex sm:hidden justify-center gap-2 mt-4">
                {BUSINESSES.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={item.label}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === active ? 'w-7 bg-primary' : 'w-2 bg-slate-300'
                        }`}
                    />
                ))}
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
