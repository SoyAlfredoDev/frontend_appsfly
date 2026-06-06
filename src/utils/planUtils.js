/**
 * Normalización y parseo de planes comerciales (GeneralDB).
 */

export function parsePlanFeatures(raw) {
    if (Array.isArray(raw)) {
        return raw.filter(Boolean).map(String);
    }

    if (raw && typeof raw === "object") {
        return objectFeaturesToList(raw);
    }

    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
            if (parsed && typeof parsed === "object") return objectFeaturesToList(parsed);
        } catch {
            try {
                const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
                if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
                if (parsed && typeof parsed === "object") return objectFeaturesToList(parsed);
            } catch {
                return [trimmed];
            }
        }
    }

    return [];
}

function objectFeaturesToList(obj) {
    return Object.entries(obj).map(([key, value]) => {
        if (key === "userMax") return `Hasta ${value} usuarios`;
        return `${key}: ${value}`;
    });
}

/** Convierte planFeatures de BD a texto multilínea para el formulario de edición */
export function featuresToTextarea(raw) {
    return parsePlanFeatures(raw).join("\n");
}

/** Normaliza un plan recibido de la API para el estado del frontend */
export function normalizePlan(plan) {
    if (!plan) return plan;
    return {
        ...plan,
        planActive: plan.planActive !== false,
        planCurrency: plan.planCurrency ?? "CLP",
        planDescription: plan.planDescription ?? "",
        planPrice: Number(plan.planPrice ?? 0),
        planDuration: Number(plan.planDuration ?? 1),
    };
}

export function durationToBillingValue(duration) {
    const n = Number(duration);
    if (n === 12) return "12";
    return "1";
}

export function billingValueToDuration(value) {
    return parseInt(value, 10) || 1;
}
