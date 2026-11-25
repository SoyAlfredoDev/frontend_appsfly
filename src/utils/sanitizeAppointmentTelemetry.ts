/** A management link contains the bearer token in its hash, which telemetry must not collect. */
export function sanitizeAppointmentTelemetry<T extends { url: string }>(event: T): T {
  try {
    const url = new URL(event.url, 'https://appsfly.cl')
    if (!url.pathname.startsWith('/registarcita/')) return event
    if (!new URLSearchParams(url.hash.slice(1)).has('gestionar')) return event
    return { ...event, url: event.url.split('#')[0] }
  } catch {
    return event
  }
}
