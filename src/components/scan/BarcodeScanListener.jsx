import { useCallback, useEffect, useRef, useState } from "react";
import { FaBarcode, FaCamera, FaTimes } from "react-icons/fa";

/**
 * Lector USB (wedge → teclado + Enter) + cámara QR/barcode opcional.
 * No reemplaza la búsqueda manual; emite onScan(code).
 */
export default function BarcodeScanListener({
    onScan,
    enabled = true,
    placeholder = "Escanear código…",
    className = "",
    showCamera = true,
}) {
    const [value, setValue] = useState("");
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const inputRef = useRef(null);
    const bufferRef = useRef("");
    const lastKeyAtRef = useRef(0);
    const cooldownRef = useRef(0);
    const scannerRef = useRef(null);
    const cameraRegionId = useRef(`scan-cam-${Math.random().toString(36).slice(2, 9)}`);

    const emitScan = useCallback(
        (raw) => {
            const code = String(raw || "").trim();
            if (!code) return;
            const now = Date.now();
            if (now - cooldownRef.current < 400) return;
            cooldownRef.current = now;
            onScan?.(code);
            setValue("");
            bufferRef.current = "";
        },
        [onScan],
    );

    // USB wedge: captura ráfagas rápidas + Enter cuando el foco no está en inputs largos
    useEffect(() => {
        if (!enabled) return undefined;

        const onKeyDown = (e) => {
            const target = e.target;
            const tag = target?.tagName;
            const isScanField = target?.dataset?.scanInput === "true";
            const isEditable =
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                target?.isContentEditable;

            if (isEditable && !isScanField) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const now = Date.now();
            if (e.key === "Enter") {
                if (bufferRef.current.length >= 3) {
                    e.preventDefault();
                    emitScan(bufferRef.current);
                }
                bufferRef.current = "";
                return;
            }

            if (e.key.length === 1) {
                if (now - lastKeyAtRef.current > 80) {
                    bufferRef.current = "";
                }
                lastKeyAtRef.current = now;
                bufferRef.current += e.key;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [enabled, emitScan]);

    useEffect(() => {
        if (!cameraOpen) return undefined;
        let cancelled = false;

        const start = async () => {
            setCameraError(null);
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                if (cancelled) return;
                const scanner = new Html5Qrcode(cameraRegionId.current);
                scannerRef.current = scanner;
                await scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 240, height: 240 } },
                    (decoded) => {
                        emitScan(decoded);
                        setCameraOpen(false);
                    },
                    () => {},
                );
            } catch (err) {
                console.error(err);
                setCameraError(
                    err?.message || "No se pudo abrir la cámara. Revisa permisos del navegador.",
                );
            }
        };

        start();

        return () => {
            cancelled = true;
            const scanner = scannerRef.current;
            scannerRef.current = null;
            if (scanner) {
                scanner
                    .stop()
                    .then(() => scanner.clear())
                    .catch(() => {});
            }
        };
    }, [cameraOpen, emitScan]);

    const handleSubmit = (e) => {
        e.preventDefault();
        emitScan(value);
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                    <FaBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                        ref={inputRef}
                        data-scan-input="true"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        autoComplete="off"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
                {showCamera && (
                    <button
                        type="button"
                        onClick={() => setCameraOpen(true)}
                        className="shrink-0 p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        title="Escanear con cámara"
                    >
                        <FaCamera />
                    </button>
                )}
            </form>

            {cameraOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Escanear con cámara</h3>
                            <button
                                type="button"
                                onClick={() => setCameraOpen(false)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-4">
                            <div id={cameraRegionId.current} className="w-full min-h-[260px] bg-black rounded-lg overflow-hidden" />
                            {cameraError && (
                                <p className="mt-3 text-sm text-red-600">{cameraError}</p>
                            )}
                            <p className="mt-3 text-xs text-gray-500">
                                Apunta al código de barras o QR. También puedes usar un lector USB.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
