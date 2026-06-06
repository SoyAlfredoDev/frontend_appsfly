export default function InputFloatingComponent({
    label,
    type = 'text',
    name,
    value = undefined,
    onChange,
    className = '',
    required = true,
    readOnly = false,
    autoComplete = undefined,
    isValid = '',
    disabled = false,
}) {
    const borderColor = isValid === true
        ? 'border-primary focus:border-primary'
        : isValid === false
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-200 focus:border-primary';

    return (
        <div className={`relative ${className}`}>
            <input
                type={type}
                id={name}
                name={name}
                className={`
                    block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-lg border
                    appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 peer transition-colors
                    ${borderColor}
                    ${readOnly || disabled ? 'bg-slate-50 cursor-not-allowed' : ''}
                `}
                placeholder=" "
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                disabled={disabled}
                autoComplete={autoComplete}
            />
            <label
                htmlFor={name}
                className={`
                    absolute text-sm text-slate-500 duration-300 transform
                    -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3
                    peer-focus:text-primary overflow-hidden text-ellipsis whitespace-nowrap max-w-[90%]
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                    peer-focus:scale-75 peer-focus:-translate-y-3
                    pointer-events-none select-none
                `}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {isValid === false && (
                <p className="mt-1 text-xs text-red-500">Por favor completa este campo</p>
            )}
        </div>
    );
}
