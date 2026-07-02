const PENDING_LOGIN_KEY = "appsfly_login_announcement_pending";

/** Marca que tras este signin se deben evaluar anuncios (sobrevive al navigate). */
export function markLoginAnnouncementsPending() {
    try {
        sessionStorage.setItem(PENDING_LOGIN_KEY, String(Date.now()));
    } catch {
        // ignore
    }
}

export function consumeLoginAnnouncementsPending() {
    try {
        const value = sessionStorage.getItem(PENDING_LOGIN_KEY);
        if (!value) return false;
        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        return true;
    } catch {
        return false;
    }
}

export function hasLoginAnnouncementsPending() {
    try {
        return Boolean(sessionStorage.getItem(PENDING_LOGIN_KEY));
    } catch {
        return false;
    }
}
