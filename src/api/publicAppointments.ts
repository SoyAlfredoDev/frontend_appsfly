import axios from 'axios'
import config from '../config/env.js'
import type { AppointmentLocation } from '../pages/public/AppointmentLocationSection'

export type PublicBookingPage = {
  available: boolean
  business?: {
    name: string
    phone?: string | null
    logoUrl?: string | null
    whatsappUrl?: string | null
  }
  message?: string | null
  visitorMessage?: string | null
  timezone?: string
  customerNotificationsEnabled?: boolean
  emailRequired?: boolean
  slotDurationMinutes?: number
  galleryImageUrls?: string[]
  location?: AppointmentLocation | null
}

export type AppointmentSlot = { dateKey: string; startsAt: string; label: string }

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'

export type PublicAppointment = {
  startsAt: string
  endsAt?: string
  status?: AppointmentStatus
  customerEmail?: string | null
  phoneNumber?: string | null
}

export type PublicAppointmentPayload = {
  firstName: string
  lastName: string
  phoneCode: '+56'
  phoneNumber: string
  contactConsent: true
  customerEmail: string | null
  startsAt: string
  notes: string | null
  clientRequestId?: string
}

const publicApi = axios.create({ baseURL: config.apiUrl })

export const fetchPublicAppointmentPage = (businessId: string, signal?: AbortSignal) =>
  publicApi.get<PublicBookingPage>(`/public/appointments/${businessId}`, { signal })

export const fetchPublicAppointmentSlots = (businessId: string, signal?: AbortSignal) =>
  publicApi.get<{ slots: AppointmentSlot[]; timezone?: string }>(
    `/public/appointments/${businessId}/slots`,
    { signal },
  )

export const createPublicAppointment = (businessId: string, payload: PublicAppointmentPayload) =>
  publicApi.post<{ appointment: PublicAppointment; managementToken?: string; timezone?: string }>(
    `/public/appointments/${businessId}`,
    payload,
  )

export type ManagedAppointment = {
  appointment: PublicAppointment & { appointmentId: string; status: AppointmentStatus }
  timezone: string
  business: PublicBookingPage['business']
  location?: AppointmentLocation | null
  canCancel: boolean
  canReschedule: boolean
}

const managementPath = (businessId: string) => `/public/appointments/${businessId}/manage`
const managementHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

export const fetchManagedAppointment = (businessId: string, token: string, signal?: AbortSignal) =>
  publicApi.get<ManagedAppointment>(managementPath(businessId), {
    headers: managementHeaders(token),
    signal,
  })

export const changeManagedAppointment = (
  businessId: string,
  token: string,
  change: { action: 'cancel' } | { action: 'reschedule'; startsAt: string },
) =>
  publicApi.patch<ManagedAppointment>(managementPath(businessId), change, {
    headers: managementHeaders(token),
  })
