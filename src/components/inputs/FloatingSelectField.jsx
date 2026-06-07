/**
 * Select con label flotante — misma apariencia que InputFloatingComponent.
 */
export default function FloatingSelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    isValid = "",
    required = true,
    disabled = false,
    className = "",
}) {
    const borderColor =
        isValid === true
            ? "border-primary focus:border-primary"
            : isValid === false
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200 focus:border-primary";

    return (
        <div className={`relative ${className}`}>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
                    block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-lg border
                    appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 peer transition-colors
                    ${borderColor}
                    ${disabled ? "bg-slate-50 cursor-not-allowed" : ""}
                `}
            >
                {options.map((opt) => (
                    <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <label
                htmlFor={name}
                className="
                    absolute text-sm text-slate-500 duration-300 transform
                    -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3
                    peer-focus:text-primary pointer-events-none select-none
                "
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
            {isValid === false && <p className="mt-1 text-xs text-red-500">Requerido</p>}
        </div>
    );
}
