import { uploadSignedImage } from './signedImageUpload.ts'

/**
 * Subida a Cloudinary autorizada por el servidor para el tenant activo.
 * Solo invocar en onSubmit para evitar archivos huérfanos.
 *
 * @returns {Promise<string|null>} secure_url o null si no hay archivo
 */
export async function uploadImageToCloudinary(file, { folder } = {}) {
  if (!file) return null
  // Se envía solo el tipo. El backend deriva la carpeta y el ID desde la membresía autenticada.
  return uploadSignedImage(file, folder?.split('/').at(-1))
}

export const TENANT_FOLDER_ROOT = 'tenants'

export const CLOUDINARY_FOLDERS = {
  CUSTOMER_PROFILE: 'customer_profiles',
  SALE_RECEIPT: 'sale_receipts',
  EXPENSE_RECEIPT: 'ticket_receipts',
  SUPPORT: 'tickets_support',
  BUSINESS_LOGO: 'business_logos',
  APPOINTMENT_GALLERY: 'appointment_gallery',
  PRESCRIPTION_IMAGES: 'prescription_images',
}

/**
 * Carpeta por negocio: tenants/{businessId}/{assetType}
 * Permite borrar toda la media de un cliente con un prefix.
 */
export function buildTenantFolder(businessId, assetType) {
  if (typeof businessId !== 'string' || businessId.trim() === '') {
    throw new Error('No se pudo identificar el negocio para subir la imagen.')
  }
  if (typeof assetType !== 'string' || assetType.trim() === '') {
    throw new Error('El tipo de archivo de Cloudinary no es válido.')
  }
  return `${TENANT_FOLDER_ROOT}/${businessId.trim()}/${assetType.trim()}`
}

/** Public ID único por subida — evita sobrescribir y permite borrar la imagen anterior. */
export function buildCustomerImagePublicId(customerId) {
  return `customer-${customerId}-${Date.now()}`
}

export function buildPrescriptionImagePublicId(customerId) {
  return `prescription-${customerId}-${Date.now()}`
}
