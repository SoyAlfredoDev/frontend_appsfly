import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api/axios.js'
import { uploadSignedImage } from './signedImageUpload'
import { uploadImageToCloudinary } from './cloudinaryUpload.js'

vi.mock('../api/axios.js', () => ({ default: { post: vi.fn() } }))
const authorization = {
  cloudName: 'qa-cloud',
  apiKey: 'public-key',
  signature: 'qa-signature',
  maxFileBytes: 10 * 1024 * 1024,
  params: {
    folder: 'tenants/server-tenant/ticket_receipts',
    public_id: 'server-id',
    timestamp: 1791890000,
    overwrite: false,
    allowed_formats: 'png,jpg',
  },
}
const file = () => new File(['qa'], 'qa.png', { type: 'image/png' })
beforeEach(() => {
  vi.mocked(api.post).mockReset()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('signed image uploads', () => {
  it('requests authorization without accepting the client tenant or public ID', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: authorization })
    const upload = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url: 'https://res.cloudinary.com/qa-cloud/image/upload/qa.png',
      }),
    })
    vi.stubGlobal('fetch', upload)
    await expect(
      uploadImageToCloudinary(file(), {
        folder: 'tenants/forged-tenant/ticket_receipts',
        publicId: 'forged-id',
      }),
    ).resolves.toContain('qa.png')
    expect(api.post).toHaveBeenCalledWith('/media/upload-signature', {
      assetType: 'ticket_receipts',
      contentType: 'image/png',
      fileSize: 2,
    })
    const [url, options] = upload.mock.calls[0]
    expect(url).toBe('https://api.cloudinary.com/v1_1/qa-cloud/image/upload')
    expect(options.body.get('folder')).toBe(authorization.params.folder)
    expect(options.body.get('public_id')).toBe('server-id')
    expect(options.body.get('signature')).toBe('qa-signature')
    expect(options.body.get('api_key')).toBe('public-key')
    expect(options.body.get('overwrite')).toBe('false')
    expect(options.body.has('upload_preset')).toBe(false)
  })
  it('rejects unsupported types and oversized files before requesting a signature', async () => {
    await expect(
      uploadSignedImage(new File(['x'], 'bad.svg', { type: 'image/svg+xml' }), 'ticket_receipts'),
    ).rejects.toThrow('10 MB')
    await expect(
      uploadSignedImage(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }),
        'ticket_receipts',
      ),
    ).rejects.toThrow('10 MB')
    expect(api.post).not.toHaveBeenCalled()
  })
  it('preserves the authorization error and never sends the image', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'No tienes acceso a ese negocio.' } },
    })
    const upload = vi.fn()
    vi.stubGlobal('fetch', upload)
    await expect(uploadSignedImage(file(), 'ticket_receipts')).rejects.toThrow('No tienes acceso')
    expect(upload).not.toHaveBeenCalled()
  })
  it('reports a provider error without returning a successful URL', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: authorization })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Invalid Signature' } }),
      }),
    )
    await expect(uploadSignedImage(file(), 'ticket_receipts')).rejects.toThrow('Invalid Signature')
  })
  it('rejects incomplete authorization before sending the image', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...authorization, signature: '' } })
    const upload = vi.fn()
    vi.stubGlobal('fetch', upload)
    await expect(uploadSignedImage(file(), 'ticket_receipts')).rejects.toThrow(
      'autorización válida',
    )
    expect(upload).not.toHaveBeenCalled()
  })
})
