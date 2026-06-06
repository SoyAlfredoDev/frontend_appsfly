export function normalizeReceiptUrl(url) {
  if (!url || typeof url !== "string") return "";

  let normalized = url.trim();
  if (!normalized) return "";

  if (normalized.startsWith("http://")) {
    normalized = normalized.replace("http://", "https://");
  }

  if (normalized.includes("res.cloudinary.com")) {
    normalized = normalized
      .replace(/,fl_attachment/g, "")
      .replace(/fl_attachment,/g, "");

    if (
      /\/upload\/v\d+\//.test(normalized) &&
      !normalized.includes("f_auto")
    ) {
      normalized = normalized.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  }

  return normalized;
}

export function isPdfReceipt(url) {
  if (!url) return false;
  return /\.pdf(\?|#|$)/i.test(url) || /\/raw\/upload\//i.test(url);
}

export function getReceiptViewerMode(url) {
  return isPdfReceipt(url) ? "pdf" : "image";
}
