import { buildJsonLd, escapeHtml, serializeJsonLd, type PublicPage } from './publicSeo'

const JSON_LD_ID = 'appsfly-jsonld'

function replaceTag(html: string, pattern: RegExp, replacement: string, fallbackAnchor: string) {
  if (pattern.test(html)) return html.replace(pattern, replacement)
  return html.replace(fallbackAnchor, `${replacement}\n  ${fallbackAnchor}`)
}

export function renderStaticArticle(page: PublicPage) {
  const paragraphs = page.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
  const highlights =
    page.highlights.length === 0
      ? ''
      : `<section><h2>Qué incluye</h2><ul>${page.highlights
          .map(
            (item) => `<li><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></li>`,
          )
          .join('')}</ul></section>`
  const faqs =
    page.faqs.length === 0
      ? ''
      : `<section><h2>Preguntas frecuentes</h2>${page.faqs
          .map(
            (faq) =>
              `<section><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></section>`,
          )
          .join('')}</section>`

  return `<article>
  <h1>${escapeHtml(page.h1)}</h1>
  <p>${escapeHtml(page.lead)}</p>
  ${paragraphs}
  ${highlights}
  ${faqs}
  <nav>
    <a href="/">Inicio</a>
    <a href="/software-para-opticas">Software para ópticas</a>
    <a href="/precios">Precios</a>
    <a href="/register">Crear cuenta</a>
  </nav>
</article>`
}

export function buildPublicHtml(template: string, page: PublicPage) {
  const jsonLd = `<script id="${JSON_LD_ID}" type="application/ld+json">${serializeJsonLd(buildJsonLd(page))}</script>`
  let html = template
  html = replaceTag(
    html,
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(page.title)}</title>`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="index, follow" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(page.canonicalUrl)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeHtml(page.canonicalUrl)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    '</head>',
  )
  html = replaceTag(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    '</head>',
  )
  if (!html.includes(JSON_LD_ID)) {
    html = html.replace('</head>', `  ${jsonLd}\n</head>`)
  }
  const article = renderStaticArticle(page)
  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `<div id="root">${article}</div>`)
  } else {
    html = html.replace('<div id="root">', `<div id="root">${article}`)
  }
  return html
}

export function buildAppShell(template: string) {
  let html = template
  html = replaceTag(html, /<title>[^<]*<\/title>/, '<title>AppsFly</title>', '</head>')
  html = replaceTag(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    '<meta name="robots" content="noindex, nofollow" />',
    '</head>',
  )
  return html
}

export function outputFileForPath(pathname: string) {
  if (pathname === '/') return 'index.html'
  return `${pathname.slice(1)}/index.html`
}
