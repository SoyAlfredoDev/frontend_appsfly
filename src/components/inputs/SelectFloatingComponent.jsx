// SelectFloatingComponent.jsx
export default function SelectFloatingComponent({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    className = '',
    required = true,
    isValid = '',
    disabled = false
}) {
    // Determine border color based on validation state
    const borderColor = isValid === true
        ? "border-primary focus:border-primary"
        : isValid === false
          ? "border-red-500 focus:border-red-500"
          : "border-slate-200 focus:border-primary";

    return (
        <div className={`relative mb-3 ${className}`}>
            <select
                id={name}
                name={name}
                className={`
                    block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-lg border
                    appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 peer transition-colors
                    ${borderColor}
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                `}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <label
                htmlFor={name}
                className={`
                    absolute text-sm text-slate-500 duration-300 transform 
                    -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 
                    peer-focus:text-primary
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
                    peer-focus:scale-75 peer-focus:-translate-y-3
                    pointer-events-none select-none
                `}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>

            {isValid === false && (
                <p className="mt-1 text-xs text-red-500">Por favor completa este campo</p>
            )}
        </div>
    );
}
