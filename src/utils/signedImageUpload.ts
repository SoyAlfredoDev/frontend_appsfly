import api from '../api/axios.js'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const imageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
])
type UploadAuthorization = {
  cloudName: string
  apiKey: string
  signature: string
  params: Record<string, string | number | boolean>
  maxFileBytes: number
}

export async function uploadSignedImage(
  file: File,
  assetType: string | undefined,
): Promise<string> {
  if (!imageTypes.has(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Selecciona una imagen JPG, PNG, WebP, GIF, AVIF o HEIC de hasta 10 MB.')
  }
  let authorization: UploadAuthorization
  try {
    const response = await api.post<UploadAuthorization>('/media/upload-signature', {
      assetType,
      contentType: file.type,
      fileSize: file.size,
    })
    authorization = response.data
  } catch (error: unknown) {
    const failure = error as { response?: { data?: { error?: string } } }
    throw new Error(failure.response?.data?.error || 'No se pudo autorizar la subida de la imagen.')
  }
  const { cloudName, apiKey, signature, params } = authorization
  if (!cloudName || !apiKey || !signature || !params?.folder || !params?.public_id) {
    throw new Error('El servidor no devolvió una autorización válida para la imagen.')
  }
  const data = new FormData()
  data.append('file', file)
  for (const [key, value] of Object.entries(params)) data.append(key, String(value))
  data.append('api_key', apiKey)
  data.append('signature', signature)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: data },
  )
  const result = await response.json()
  if (!response.ok || !result.secure_url)
    throw new Error(result.error?.message || 'No se pudo subir la imagen a Cloudinary.')
  return result.secure_url
}
