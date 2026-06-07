function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

/**
 * Descarga un archivo remoto (p. ej. imagen en Cloudinary) con nombre local.
 */
export async function downloadFileFromUrl(url, filename = "archivo") {
    if (!url) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Fetch failed");
        const blob = await response.blob();
        triggerBlobDownload(blob, filename);
    } catch {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.click();
    }
}
