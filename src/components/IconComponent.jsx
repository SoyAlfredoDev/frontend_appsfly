import { Link } from "react-router-dom";

export function IconComponent({
    ico,
    type = 'btn',
    title = null,
    color = 'success',
    size = 'md', // tamaño estándar: sm, md, lg
    onClick = () => { },
    to = "#"
}) {
    const icones = {
        eye: "bi bi-eye-fill",
        printer: "bi bi-printer-fill",
        back: "bi bi-arrow-left-circle",
        trash: "bi bi-trash",
        money: "bi bi-currency-dollar",
        pencil: "bi bi-pencil-fill",
        plus: "bi bi-plus-circle-fill",
        check: "bi bi-check-circle-fill",
        x: "bi bi-x-circle-fill",
    };

    // Define clases de tamaño
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',      // tamaño por defecto
        lg: 'btn-lg'
    };

    const content = (
        <div className="d-flex align-items-center justify-content-center">
            <i className={icones[ico]}></i>
            {title && <span className="ms-2 d-none d-sm-inline">{title}</span>}
        </div>
    );

    const classNames = `btn btn-${color} m-1 ${sizeClasses[size]} text-center`;

    return type === 'btn' ? (
        <button className={classNames} onClick={onClick} style={{ maxWidth: '200px' }}>
            {content}
        </button>
    ) : (
        <Link className={classNames} to={to} style={{ maxWidth: '200px' }}>
            {content}
        </Link>
    );
}

export function IconEye({ color }) {
    return (
        <i className={`bi bi-eye-fill text-${color}`}></i>
    )
}

export function IconPlus({ color = 'white' }) {
    return (
        <i className={`bi bi-plus-lg text-${color}`}></i>
    )
}

export function IconTrash({ color = 'white' }) {
    return (
        <i className={`bi bi-trash-fill text-${color}`}></i>
    )
}

export function IconPrinter({ color = 'white' }) {
    return (
        <i className={`bi bi-printer-fill text-${color}`}></i>
    )
}