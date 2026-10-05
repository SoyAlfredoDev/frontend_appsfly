import { useEffect, useState } from "react";
import { APPOINTMENT_GALLERY_ROTATION_MS, resolveGalleryImages } from "./appointmentGallery.ts";

type AppointmentGalleryCarouselProps = {
    imageUrls?: string[] | null;
    alt?: string;
    className?: string;
};

export default function AppointmentGalleryCarousel({
    imageUrls,
    alt = "Fotos del local",
    className = "",
}: AppointmentGalleryCarouselProps) {
    const images = resolveGalleryImages(imageUrls);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [images.join("|")]);

    useEffect(() => {
        if (images.length <= 1) return undefined;
        const timer = window.setInterval(() => {
            setIndex((current) => (current + 1) % images.length);
        }, APPOINTMENT_GALLERY_ROTATION_MS);
        return () => window.clearInterval(timer);
    }, [images.length]);

    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {images.map((src, imageIndex) => (
                <img
                    key={`${src}-${imageIndex}`}
                    src={src}
                    alt={imageIndex === index ? alt : ""}
                    aria-hidden={imageIndex !== index}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                        imageIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                />
            ))}
            {images.length > 1 ? (
                <div
                    className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
                    aria-hidden="true"
                >
                    {images.map((src, dotIndex) => (
                        <span
                            key={`${src}-dot-${dotIndex}`}
                            className={`h-1.5 rounded-full transition-all ${
                                dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                            }`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
