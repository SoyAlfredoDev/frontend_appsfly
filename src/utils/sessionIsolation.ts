export const BUSINESS_ID_STORAGE_KEY = 'appsfly_business_id'

export function clearTenantSelection(): void {
  sessionStorage.removeItem(BUSINESS_ID_STORAGE_KEY)
}

export function sessionChangedError(): Error & { code: string } {
  return Object.assign(new Error('La sesión cambió. Vuelve a cargar los datos.'), {
    code: 'SESSION_CONTEXT_CHANGED',
  })
}

export function isSessionChangedError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'SESSION_CONTEXT_CHANGED'
  )
}
