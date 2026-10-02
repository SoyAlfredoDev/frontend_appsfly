import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { buildLlmsTxt, buildRobotsTxt, buildSitemapXml, PUBLIC_PAGES } from './publicSeo'
import { buildAppShell, buildPublicHtml, outputFileForPath } from './prerenderHtml'

function sendText(
  res: { setHeader: (name: string, value: string) => void; end: (body: string) => void },
  contentType: string,
  body: string,
) {
  res.setHeader('content-type', contentType)
  res.end(body)
}

function discoveryMiddleware(
  req: { url?: string },
  res: { setHeader: (name: string, value: string) => void; end: (body: string) => void },
  next: () => void,
) {
  const url = req.url?.split('?')[0]
  if (url === '/robots.txt') {
    sendText(res, 'text/plain; charset=utf-8', buildRobotsTxt())
    return
  }
  if (url === '/sitemap.xml') {
    sendText(res, 'application/xml; charset=utf-8', buildSitemapXml())
    return
  }
  if (url === '/llms.txt') {
    sendText(res, 'text/plain; charset=utf-8', buildLlmsTxt())
    return
  }
  next()
}

export function seoBuildPlugin(): Plugin {
  let outDir = ''

  return {
    name: 'appsfly-seo',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use(discoveryMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(discoveryMiddleware)
    },
    writeBundle() {
      const indexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const template = fs.readFileSync(indexPath, 'utf8')
      fs.writeFileSync(path.join(outDir, 'app.html'), buildAppShell(template))
      for (const page of PUBLIC_PAGES) {
        const relative = outputFileForPath(page.path)
        const target = path.join(outDir, relative)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, buildPublicHtml(template, page))
      }
      fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobotsTxt())
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemapXml())
      fs.writeFileSync(path.join(outDir, 'llms.txt'), buildLlmsTxt())
    },
  }
}
