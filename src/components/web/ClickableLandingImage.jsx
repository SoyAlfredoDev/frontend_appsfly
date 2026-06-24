import { FaExpand } from 'react-icons/fa';

export default function ClickableLandingImage({
    src,
    alt,
    title,
    onOpen,
    className = '',
    imageClassName = '',
    loading = 'lazy',
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className={`group relative block w-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
            aria-label={`Ver imagen completa: ${title || alt}`}
        >
            <img
                src={src}
                alt={alt}
                className={imageClassName}
                loading={loading}
                decoding="async"
                draggable={false}
            />
            <span className="pointer-events-none absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors rounded-b-xl" />
            <span className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-dark/55 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <FaExpand className="text-[10px]" />
                Ver completa
            </span>
        </button>
    );
}
