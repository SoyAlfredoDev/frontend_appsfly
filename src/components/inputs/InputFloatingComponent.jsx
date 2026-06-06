import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    showPasswordToggle = false,
    inputMode = undefined,
    maxLength = undefined,
    spellCheck = undefined,
    autoCapitalize = undefined,
}) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';
    const resolvedType = isPasswordField && showPasswordToggle && passwordVisible ? 'text' : type;
    const hasPasswordToggle = isPasswordField && showPasswordToggle;

    const borderColor = isValid === true
        ? 'border-primary focus:border-primary'
        : isValid === false
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-200 focus:border-primary';

    return (
        <div className={`relative ${className}`}>
            <input
                type={resolvedType}
                id={name}
                name={name}
                className={`
                    block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-lg border
                    appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 peer transition-colors
                    ${hasPasswordToggle ? 'pr-10' : ''}
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
                inputMode={inputMode}
                maxLength={maxLength}
                spellCheck={spellCheck}
                autoCapitalize={autoCapitalize}
            />
            {hasPasswordToggle && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-primary rounded-r-lg disabled:opacity-50"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={passwordVisible}
                    disabled={disabled || readOnly}
                    tabIndex={0}
                >
                    {passwordVisible ? (
                        <FaEyeSlash className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <FaEye className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>
            )}
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
