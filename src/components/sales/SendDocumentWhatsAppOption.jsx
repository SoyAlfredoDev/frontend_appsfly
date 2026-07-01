import { FaWhatsapp } from "react-icons/fa";

export default function SendDocumentWhatsAppOption({
    checked,
    onChange,
    customerCodePhoneNumber,
    customerPhone,
    disabled = false,
    compact = false,
}) {
    const hasPhone = Boolean(customerPhone?.trim());

    if (compact) {
        return (
            <label
                className={`flex items-center gap-2 mb-2 ${
                    hasPhone && !disabled ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                }`}
            >
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={!hasPhone || disabled}
                />
                <span className="text-xs text-gray-600 min-w-0 truncate">
                    <FaWhatsapp className="inline text-[#25D366] mr-1" />
                    Compartir por WhatsApp
                    {hasPhone ? "" : " — sin teléfono registrado"}
                </span>
            </label>
        );
    }

    return (
        <label
            className={`flex items-start gap-2 py-1 ${
                hasPhone && !disabled ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            }`}
        >
            <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={!hasPhone || disabled}
            />
            <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                    <FaWhatsapp className="text-[#25D366] text-xs shrink-0" />
                    Compartir por WhatsApp con enlace al comprobante
                </span>
                {hasPhone ? (
                    <span className="block text-xs text-gray-500 mt-0.5 truncate">
                        Se abrirá WhatsApp con un enlace para ver y descargar el comprobante
                    </span>
                ) : (
                    <span className="block text-xs text-gray-400 mt-0.5">
                        El cliente no tiene teléfono registrado
                    </span>
                )}
            </span>
        </label>
    );
}
