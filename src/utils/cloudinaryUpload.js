/**
 * Subida directa a Cloudinary (unsigned preset).
 * Solo invocar en onSubmit para evitar archivos huérfanos.
 *
 * @returns {Promise<string|null>} secure_url o null si no hay archivo
 */
export async function uploadImageToCloudinary(file, { folder, publicId } = {}) {
    if (!file) return null;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary no está configurado en el frontend.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (folder) formData.append("folder", folder);
    if (publicId) formData.append("public_id", publicId);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
    );

    const json = await response.json();
    if (!response.ok) {
        throw new Error(json.error?.message || "Error al subir la imagen a Cloudinary.");
    }

    return json.secure_url ?? null;
}

export const CLOUDINARY_FOLDERS = {
    CUSTOMER_PROFILE: "customer_profiles",
    SALE_RECEIPT: "sale_receipts",
    EXPENSE_RECEIPT: "ticket_receipts",
    SUPPORT: "tickets_support",
    BUSINESS_LOGO: "business_logos",
};

/** Public ID único por subida — evita sobrescribir y permite borrar la imagen anterior. */
export function buildCustomerImagePublicId(customerId) {
    return `customer-${customerId}-${Date.now()}`;
}
