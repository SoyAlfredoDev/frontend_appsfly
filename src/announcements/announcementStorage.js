const STORAGE_PREFIX = "appsfly_announcement_";

function storageKey(announcementId, suffix) {
    return `${STORAGE_PREFIX}${announcementId}_${suffix}`;
}

/** El usuario eligió no volver a ver este anuncio. */
export function isAnnouncementDismissedForever(announcementId) {
    try {
        return localStorage.getItem(storageKey(announcementId, "forever")) === "1";
    } catch {
        return false;
    }
}

export function dismissAnnouncementForever(announcementId) {
    try {
        localStorage.setItem(storageKey(announcementId, "forever"), "1");
    } catch {
        // ignore
    }
}

/** Útil para futuros anuncios con versión (ej. mostrar de nuevo si cambia el contenido). */
export function getAnnouncementSeenVersion(announcementId) {
    try {
        return localStorage.getItem(storageKey(announcementId, "version")) || null;
    } catch {
        return null;
    }
}

export function markAnnouncementSeenVersion(announcementId, version) {
    try {
        localStorage.setItem(storageKey(announcementId, "version"), String(version));
    } catch {
        // ignore
    }
}
