import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  ALIAS_HOSTS,
  aliasRedirectTarget,
  classifyRequestPath,
  opticsHomeRewritePath,
  unknownPathHtml,
} from './hostRouting'
import { buildAppShell, buildPublicHtml } from './prerenderHtml'
import {
  HOME_H1,
  HOME_LEAD,
  PRICE_SUMMARY,
  SITE_URL,
  buildJsonLd,
  buildLlmsTxt,
  buildRobotsTxt,
  buildSitemapXml,
  requirePublicPage,
  resolveSeoForPath,
  sitemapLocs,
} from './publicSeo'

const template = `<!doctype html>
<html lang="es">
<head>
  <title>Old</title>
  <meta name="description" content="old" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://appsfly.cl/" />
  <meta property="og:title" content="old" />
  <meta property="og:description" content="old" />
  <meta property="og:url" content="https://appsfly.cl/" />
  <meta name="twitter:title" content="old" />
  <meta name="twitter:description" content="old" />
</head>
<body>
  <div id="root"></div>
</body>
</html>`

describe('public SEO copy', () => {
  it('answers what AppsFly is and what it costs in the home document', () => {
    const home = requirePublicPage('/')
    expect(home.h1).toBe(HOME_H1)
    expect(home.lead).toBe(HOME_LEAD)
    expect(home.faqs.map((faq) => faq.question)).toContain('¿Cuánto cuesta AppsFly?')
    expect(home.faqs.find((faq) => faq.question === '¿Cuánto cuesta AppsFly?')?.answer).toBe(
      PRICE_SUMMARY,
    )
    expect(PRICE_SUMMARY).toContain('$9.990')
    expect(PRICE_SUMMARY).toContain('$39.990')
  })

  it('keeps the optics promo and the optics article on different canonical URLs', () => {
    const article = requirePublicPage('/software-para-opticas')
    const promo = resolveSeoForPath('/optica')
    const promoHost = resolveSeoForPath('/', { hostname: 'optica.appsfly.app' })

    expect(article.canonicalUrl).toBe(`${SITE_URL}/software-para-opticas`)
    expect(article.h1).toBe('Software para ópticas en Chile')
    expect(promo.canonicalUrl).toBe('https://optica.appsfly.app/')
    expect(promoHost.canonicalUrl).toBe('https://optica.appsfly.app/')
    expect(promoHost.title).toContain('Óptica')
  })

  it('marks unknown routes as noindex', () => {
    expect(resolveSeoForPath('/no-existe').robots).toBe('noindex, nofollow')
    expect(resolveSeoForPath('/dashboard').robots).toBe('noindex, nofollow')
  })
})

describe('discovery files', () => {
  it('publishes robots, sitemap and llms.txt for the canonical host', () => {
    const robots = buildRobotsTxt()
    expect(robots).toContain('User-agent: GPTBot')
    expect(robots).toContain('User-agent: PerplexityBot')
    expect(robots).toContain('User-agent: ClaudeBot')
    expect(robots).toContain('Disallow: /admin')
    expect(robots).toContain('Disallow: /dashboard')
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)

    const sitemap = buildSitemapXml()
    expect(sitemap).toContain(`${SITE_URL}/software-para-opticas`)
    expect(sitemap).toContain(`${SITE_URL}/precios`)
    expect(sitemap).toContain('https://optica.appsfly.app/')
    expect(sitemap).not.toContain(`${SITE_URL}/login`)
    expect(sitemapLocs()).toHaveLength(new Set(sitemapLocs()).size)

    const llms = buildLlmsTxt()
    expect(llms).toContain('# AppsFly')
    expect(llms).toContain('77.719.288-4')
    expect(llms).toContain('$9.990')
    expect(llms).toContain(`${SITE_URL}/precios`)
  })

  it('puts the same FAQ answers in the visible HTML and in JSON-LD', () => {
    const page = requirePublicPage('/precios')
    const html = buildPublicHtml(template, page)
    const json = JSON.stringify(buildJsonLd(page))

    expect(html).toContain(`<h1>${page.h1}</h1>`)
    expect(html).toContain('FAQPage')
    expect(html).toContain('index, follow')
    for (const faq of page.faqs) {
      expect(html).toContain(faq.question)
      expect(html).toContain(faq.answer)
      expect(json).toContain(faq.question)
      expect(json).toContain(faq.answer)
    }
    expect(json).toContain('"price":"9990"')
    expect(json).toContain('TECNOLOGÍA Y SERVICIOS APPSFLY SPA')
  })

  it('serves the logged-in shell without the marketing article', () => {
    const shell = buildAppShell(template)
    expect(shell).toContain('noindex, nofollow')
    expect(shell).toContain('<div id="root"></div>')
    expect(shell).not.toContain(HOME_H1)
  })
})

describe('host routing', () => {
  it('redirects alias hosts and rewrites the optics home', () => {
    expect(aliasRedirectTarget('appsfly.app', '/precios', '?plan=basico')).toBe(
      'https://appsfly.cl/precios?plan=basico',
    )
    expect(aliasRedirectTarget('www.appsfly.cl', '/', '')).toBe('https://appsfly.cl/')
    expect(aliasRedirectTarget('appsfly.cl', '/', '')).toBeNull()
    expect(opticsHomeRewritePath('optica.appsfly.app', '/')).toBe('/optica/index.html')
    expect(opticsHomeRewritePath('appsfly.app', '/')).toBeNull()
  })

  it('classifies every route declared in the app', () => {
    const appPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../App.jsx')
    const source = readFileSync(appPath, 'utf8')
    const routes = [...source.matchAll(/path="([^"]+)"/g)].map((match) => match[1] ?? '')

    for (const route of routes) {
      if (route === '*') continue
      const concrete = route.replace(/:[^/]+/g, 'ejemplo')
      expect(classifyRequestPath(concrete), route).not.toBe('unknown')
    }

    expect(classifyRequestPath('/no-existe-seo-audit')).toBe('unknown')
    expect(classifyRequestPath('/software-para-opticas')).toBe('static')
    expect(classifyRequestPath('/dashboard')).toBe('app')
    expect(unknownPathHtml()).toContain('noindex')
  })

  it('lists the alias hosts that vercel.json redirects', () => {
    const vercelPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../vercel.json',
    )
    const vercel = readFileSync(vercelPath, 'utf8')
    for (const host of ALIAS_HOSTS) {
      expect(vercel).toContain(host)
    }
    expect(vercel).toContain('/app.html')
    expect(vercel).not.toContain('optica.appsfly.app')
  })
})
