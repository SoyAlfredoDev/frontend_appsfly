import { useEffect, useId, useMemo } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

/**
 * Selector de imagen opcional con previsualización local (sin subir hasta submit).
 */
export default function ImageUploadField({
    file = null,
    onFileChange,
    onRemove,
    existingImageUrl = null,
    disabled = false,
    label = "Imagen (opcional)",
    hint = "PNG, JPG — máx. recomendado 5MB",
    previewShape = "rounded-lg",
}) {
    const inputId = useId();

    const previewSource = useMemo(() => {
        if (file) return URL.createObjectURL(file);
        if (existingImageUrl) return existingImageUrl;
        return null;
    }, [file, existingImageUrl]);

    useEffect(() => {
        if (!file || !previewSource?.startsWith("blob:")) return undefined;
        return () => URL.revokeObjectURL(previewSource);
    }, [file, previewSource]);

    const hasPreview = Boolean(previewSource);
    const shapeClass = previewShape === "rounded-full" ? "rounded-full" : "rounded-lg";

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0] ?? null;
        if (selected && !selected.type.startsWith("image/")) return;
        onFileChange(selected);
        e.target.value = "";
    };

    const handleRemove = () => {
        onFileChange(null);
        onRemove?.();
    };

    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                {label}
            </p>

            <div className="flex flex-wrap items-center gap-4">
                {!hasPreview ? (
                    <label
                        htmlFor={inputId}
                        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-dashed border-gray-300 text-sm ${shapeClass} ${
                            disabled ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                        <FaCloudUploadAlt className="text-primary shrink-0" />
                        <span>Seleccionar imagen</span>
                        <input
                            id={inputId}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={disabled}
                        />
                    </label>
                ) : (
                    <div className="relative group">
                        <img
                            src={previewSource}
                            alt="Vista previa"
                            className={`w-20 h-20 object-cover border border-gray-200 shadow-sm ${shapeClass}`}
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                                aria-label="Remover imagen"
                            >
                                <FaTimes className="text-[10px]" />
                            </button>
                        )}
                        {file && (
                            <p className="text-[10px] text-gray-400 mt-1 max-w-[80px] truncate text-center">
                                {file.name}
                            </p>
                        )}
                    </div>
                )}

                {hasPreview && !disabled && (
                    <label
                        htmlFor={`${inputId}-replace`}
                        className="cursor-pointer text-xs font-medium text-primary hover:text-primary-hover underline-offset-2 hover:underline"
                    >
                        Cambiar
                        <input
                            id={`${inputId}-replace`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                )}

                {!hasPreview && (
                    <span className="text-[11px] text-slate-400">{hint}</span>
                )}
            </div>
        </div>
    );
}
