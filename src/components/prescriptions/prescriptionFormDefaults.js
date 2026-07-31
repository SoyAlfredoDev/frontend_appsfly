/** Defaults y helpers compartidos para formularios de receta. */

export const EMPTY_PRESCRIPTION_FORM = {
    prescriptionDate: "",
    prescriptionExpiresAt: "",
    prescribedBy: "",
    prescriptionType: "",
    odSphere: "",
    odCylinder: "",
    odAxis: "",
    odAddition: "",
    odPrism: "",
    odBase: "",
    oiSphere: "",
    oiCylinder: "",
    oiAxis: "",
    oiAddition: "",
    oiPrism: "",
    oiBase: "",
    pdBinocular: "",
    pdOd: "",
    pdOi: "",
    pdNear: "",
    prescriptionNotes: "",
};

export const PRESCRIPTION_MEASUREMENT_KEYS = [
    "odSphere",
    "odCylinder",
    "odAxis",
    "odAddition",
    "odPrism",
    "odBase",
    "oiSphere",
    "oiCylinder",
    "oiAxis",
    "oiAddition",
    "oiPrism",
    "oiBase",
    "pdBinocular",
    "pdOd",
    "pdOi",
    "pdNear",
];

export const PRESCRIPTION_TYPE_LABELS = {
    lejos: "Lejos",
    cerca: "Cerca",
    multifocal: "Multifocal",
    progresivo: "Progresivo",
    otro: "Otro",
};

export function hasPrescriptionMeasurements(form = {}) {
    return PRESCRIPTION_MEASUREMENT_KEYS.some(
        (key) => String(form[key] || "").trim() !== "",
    );
}

export function summarizePrescriptionEyes(form = {}) {
    const fmt = (sphere, cyl, axis) => {
        const parts = [sphere, cyl, axis].map((v) => String(v || "").trim()).filter(Boolean);
        return parts.length ? parts.join(" / ") : "—";
    };
    return {
        od: fmt(form.odSphere, form.odCylinder, form.odAxis),
        oi: fmt(form.oiSphere, form.oiCylinder, form.oiAxis),
        typeLabel: PRESCRIPTION_TYPE_LABELS[form.prescriptionType] || null,
        hasData: hasPrescriptionMeasurements(form),
    };
}

export function resolvePrescriptionEntryMode({ hasImage, hasManual }) {
    if (hasImage && hasManual) return "MIXED";
    if (hasImage) return "PHOTO";
    return "MANUAL";
}
