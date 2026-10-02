import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { buildJsonLd, pageForPath, serializeJsonLd } from '../../seo/publicSeo'

const JSON_LD_ID = 'appsfly-jsonld'

export default function SeoJsonLd() {
  const { pathname } = useLocation()

  useEffect(() => {
    const hostname = window.location.hostname
    const page = pageForPath(pathname, hostname)
    const existing = document.getElementById(JSON_LD_ID)

    if (!page?.index) {
      existing?.remove()
      return
    }

    const script = existing ?? document.createElement('script')
    script.id = JSON_LD_ID
    script.setAttribute('type', 'application/ld+json')
    script.textContent = serializeJsonLd(buildJsonLd(page))
    if (!existing) document.head.appendChild(script)
  }, [pathname])

  return null
}
