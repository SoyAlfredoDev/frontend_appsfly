import { FaEnvelope } from "react-icons/fa";

export default function SendDocumentEmailOption({
    checked,
    onChange,
    customerEmail,
    disabled = false,
    compact = false,
}) {
    const hasEmail = Boolean(customerEmail?.trim());

    if (compact) {
        return (
            <label
                className={`flex items-center gap-2 mb-2 ${
                    hasEmail && !disabled ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                }`}
            >
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={!hasEmail || disabled}
                />
                <span className="text-xs text-gray-600 min-w-0 truncate">
                    <FaEnvelope className="inline text-primary mr-1" />
                    Enviar al correo del cliente
                    {hasEmail ? ` (${customerEmail})` : " — sin correo registrado"}
                </span>
            </label>
        );
    }

    return (
        <label
            className={`flex items-start gap-2 py-1 ${
                hasEmail && !disabled ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
            }`}
        >
            <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={!hasEmail || disabled}
            />
            <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                    <FaEnvelope className="text-primary text-xs shrink-0" />
                    Enviar al correo electrónico del cliente
                </span>
                {hasEmail ? (
                    <span className="block text-xs text-gray-500 mt-0.5 truncate">
                        Se enviará a {customerEmail}
                    </span>
                ) : (
                    <span className="block text-xs text-gray-400 mt-0.5">
                        El cliente no tiene correo registrado
                    </span>
                )}
            </span>
        </label>
    );
}
