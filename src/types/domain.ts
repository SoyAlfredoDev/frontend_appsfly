export type BusinessStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

export interface BusinessSummary {
  businessId: string
  businessName: string
  businessType: string
  businessStatus: BusinessStatus
  businessTimezone?: string
}

export interface ApiErrorPayload {
  error?: string
  message?: string
  code?: string
}
