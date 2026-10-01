import { describe, expect, it } from 'vitest'

import {
  ApiErrorType,
  classifyApiError,
  getLoginErrorMessage,
  getRegistrationErrorMessage,
  isServerUnavailableError,
} from './apiErrors.js'

describe('API error handling in development', () => {
  it('identifies a missing API route as a configuration failure', () => {
    const error = { response: { status: 404 } }

    expect(classifyApiError(error)).toBe(ApiErrorType.CONFIGURATION)
    expect(isServerUnavailableError(error)).toBe(true)
    expect(getLoginErrorMessage(error)).toContain('VITE_DEV_API_PROXY_TARGET')
  })

  it('preserves a backend registration message', () => {
    expect(
      getRegistrationErrorMessage({
        status: 400,
        message: 'El correo electrónico ya está en uso.',
      }),
    ).toBe('El correo electrónico ya está en uso.')
  })

  it('returns an actionable registration message for a missing local API route', () => {
    expect(getRegistrationErrorMessage({ status: 404 })).toContain('VITE_DEV_API_PROXY_TARGET')
  })
})
