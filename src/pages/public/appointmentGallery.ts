export const DEFAULT_APPOINTMENT_GALLERY_IMAGE = "/appointment-default.svg";

export const APPOINTMENT_GALLERY_HINT =
    "Recomendamos 1200×800 px (proporción 3:2), JPG o WebP, máximo 5 MB. Puedes subir hasta 3 fotos; se rotan solas en la página pública.";

export const APPOINTMENT_GALLERY_MAX_IMAGES = 3;

export const APPOINTMENT_GALLERY_ROTATION_MS = 5000;

export function resolveGalleryImages(urls?: string[] | null): string[] {
    const cleaned = (urls || []).map((url) => url.trim()).filter(Boolean);
    if (cleaned.length) return cleaned.slice(0, APPOINTMENT_GALLERY_MAX_IMAGES);
    return [DEFAULT_APPOINTMENT_GALLERY_IMAGE];
}
