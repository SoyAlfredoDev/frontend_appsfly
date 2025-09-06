// InputFloatingComponent.jsx
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
    isValid = ''
}) {
    return (
        <div className={`form-floating mb-2 ${className}`}>
            <input
                type={type}
                className={`form-control form-control-sm ps-2${isValid === true ? 'is-valid' : isValid === false ? 'is-invalid' : ''
                    }`}
                id={name}
                name={name}
                placeholder={label}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                autoComplete={autoComplete}
            />
            <label htmlFor={name} style={{ fontSize: '0.85rem' }}>
                {label}: {required === true && <span className="text-danger">*</span>}
            </label>
            {isValid === false && (
                <div className="invalid-feedback">Por favor completa este campo</div>
            )}
        </div>
    );
}

