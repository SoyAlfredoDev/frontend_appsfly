/**
 * Aplica meta-etiquetas SEO / Open Graph / Twitter en document.head (client-side).
 */

function upsertMetaByName(name, content) {
    if (content == null) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
    if (content == null) return;
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function upsertLinkRel(rel, href) {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

export function applySeo(seo) {
    if (typeof document === "undefined" || !seo) return;

    document.title = seo.title ?? "AppsFly";

    upsertMetaByName("description", seo.description);
    upsertMetaByName("keywords", seo.keywords);
    upsertMetaByName("robots", seo.robots);
    upsertMetaByName("author", "AppsFly");
    upsertMetaByName("twitter:card", seo.twitterCard);
    upsertMetaByName("twitter:title", seo.title);
    upsertMetaByName("twitter:description", seo.description);
    upsertMetaByName("twitter:image", seo.ogImage);

    upsertMetaByProperty("og:title", seo.title);
    upsertMetaByProperty("og:description", seo.description);
    upsertMetaByProperty("og:type", seo.ogType ?? "website");
    upsertMetaByProperty("og:url", seo.ogUrl);
    upsertMetaByProperty("og:image", seo.ogImage);
    upsertMetaByProperty("og:image:width", "1200");
    upsertMetaByProperty("og:image:height", "630");
    upsertMetaByProperty("og:image:alt", seo.title);
    upsertMetaByProperty("og:site_name", seo.siteName ?? "AppsFly");
    upsertMetaByProperty("og:locale", seo.locale ?? "es_CL");

    upsertLinkRel("canonical", seo.canonicalUrl);
}
