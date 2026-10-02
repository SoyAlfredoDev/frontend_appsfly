import { next, rewrite } from '@vercel/functions'
import {
  aliasRedirectTarget,
  classifyRequestPath,
  opticsHomeRewritePath,
  unknownPathHtml,
} from './src/seo/hostRouting'

export const config = {
  matcher: ['/((?!assets/|pwa/).*)'],
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const redirectTo = aliasRedirectTarget(url.hostname, url.pathname, url.search)
  if (redirectTo) return Response.redirect(redirectTo, 301)

  const opticsHome = opticsHomeRewritePath(url.hostname, url.pathname)
  if (opticsHome) return rewrite(new URL(opticsHome, request.url))

  if (classifyRequestPath(url.pathname) === 'unknown') {
    return new Response(unknownPathHtml(), {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
      },
    })
  }

  return next()
}
