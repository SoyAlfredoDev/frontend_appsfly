import { SUPPORT_WHATSAPP_PHONE, SUPPORT_WHATSAPP_DISPLAY } from './supportContact.js'

/** Identidad legal y contacto público de AppsFly. */
export const COMPANY = {
  legalName: 'TECNOLOGÍA Y SERVICIOS APPSFLY SPA',
  tradeName: 'AppsFly',
  rut: '77.719.288-4',
  address: 'Huérfanos 779, depto. 705, Santiago, Región Metropolitana',
  email: 'appsfly.cl@gmail.com',
  phoneDisplay: SUPPORT_WHATSAPP_DISPLAY,
  phoneE164: `+${SUPPORT_WHATSAPP_PHONE}`,
  whatsappPhone: SUPPORT_WHATSAPP_PHONE,
} as const

export const COMPANY_EMAIL_URL = `mailto:${COMPANY.email}`
export const COMPANY_PHONE_URL = `tel:${COMPANY.phoneE164}`
export const COMPANY_WHATSAPP_URL = `https://wa.me/${COMPANY.whatsappPhone}`
