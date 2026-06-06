export function buildWhatsAppUrl(codePhoneNumber, phoneNumber) {
  if (!phoneNumber) return null;

  const digits = `${codePhoneNumber || ""}${phoneNumber}`.replace(/\D/g, "");
  if (!digits) return null;

  return `https://wa.me/${digits}`;
}

export function formatProviderPhone(codePhoneNumber, phoneNumber) {
  const code = codePhoneNumber?.trim() || "";
  const phone = phoneNumber?.trim() || "";
  if (!phone) return "";
  return `${code} ${phone}`.trim();
}

export function getProviderPurchaseCount(provider) {
  return provider?._count?.Purchase ?? 0;
}

export function formatProviderLabel(value) {
  if (!value) return "";
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
