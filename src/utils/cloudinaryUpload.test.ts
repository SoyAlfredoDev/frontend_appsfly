import { describe, expect, it } from 'vitest'

import {
  CLOUDINARY_FOLDERS,
  TENANT_FOLDER_ROOT,
  buildTenantFolder,
  uploadImageToCloudinary,
} from './cloudinaryUpload.js'

describe('buildTenantFolder', () => {
  it('nests the asset type under the business folder', () => {
    expect(buildTenantFolder(' biz-1 ', CLOUDINARY_FOLDERS.EXPENSE_RECEIPT)).toBe(
      `${TENANT_FOLDER_ROOT}/biz-1/${CLOUDINARY_FOLDERS.EXPENSE_RECEIPT}`,
    )
  })

  it('rejects a missing business id', () => {
    expect(() => buildTenantFolder('', CLOUDINARY_FOLDERS.BUSINESS_LOGO)).toThrow(
      'No se pudo identificar el negocio para subir la imagen.',
    )
  })

  it('rejects a missing asset type', () => {
    expect(() => buildTenantFolder('biz-1', '  ')).toThrow(
      'El tipo de archivo de Cloudinary no es válido.',
    )
  })
})

describe('uploadImageToCloudinary', () => {
  it('returns null when there is no file', async () => {
    await expect(uploadImageToCloudinary(null)).resolves.toBeNull()
  })
})
