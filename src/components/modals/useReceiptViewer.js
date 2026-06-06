import { useEffect, useState } from "react";
import {
  normalizeReceiptUrl,
  getReceiptViewerMode,
  isPdfReceipt,
} from "../../utils/receiptUrl.js";

const LOAD_TIMEOUT_MS = 20000;

export function useReceiptViewer(sourceUrl) {
  const normalizedUrl = normalizeReceiptUrl(sourceUrl);
  const [status, setStatus] = useState("idle");
  const [viewerMode, setViewerMode] = useState("image");

  useEffect(() => {
    if (!normalizedUrl) {
      setStatus("error");
      setViewerMode("image");
      return;
    }

    if (getReceiptViewerMode(normalizedUrl) === "pdf") {
      setViewerMode("pdf");
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setViewerMode("image");

    const img = new Image();

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setStatus("error");
    }, LOAD_TIMEOUT_MS);

    const finish = (mode, nextStatus) => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      setViewerMode(mode);
      setStatus(nextStatus);
    };

    img.onload = () => finish("image", "ready");

    img.onerror = () => {
      const canTryEmbed =
        isPdfReceipt(normalizedUrl) ||
        normalizedUrl.includes("res.cloudinary.com");

      finish(canTryEmbed ? "pdf" : "image", canTryEmbed ? "ready" : "error");
    };

    img.src = normalizedUrl;

    if (img.complete) {
      if (img.naturalWidth > 0) {
        finish("image", "ready");
      } else {
        const canTryEmbed =
          isPdfReceipt(normalizedUrl) ||
          normalizedUrl.includes("res.cloudinary.com");
        finish(canTryEmbed ? "pdf" : "image", canTryEmbed ? "ready" : "error");
      }
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [normalizedUrl]);

  return { normalizedUrl, status, viewerMode };
}
