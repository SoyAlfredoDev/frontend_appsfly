import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./NavBarComponent.css";
import formatName from '../utils/formatName.js';

export default function NavBarComponent() {
    const { user, logout, subscriptions } = useAuth();
    const location = useLocation();

    const getLinkClass = (...paths) => {
        return paths.includes(location.pathname)
            ? 'nav-link active fw-bold'
            : 'nav-link';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow fixed-top">
            <div className="container-fluid">
                <Link to="/dashboard" className="navbar-brand fw-bold">
                    AppsFly
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        {user && (
                            <li className="nav-item me-3">
                                <span className="nav-link user-greeting">
                                    Hola, <b>{formatName(user?.userFirstName)} {formatName(user?.userLastName)}</b>
                                </span>
                            </li>
                        )}
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''}`} >
                            <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                        </li>
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''} `}>
                            <Link to="/customers" className={getLinkClass('/customers')}>Clientes</Link>
                        </li>
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''}`}>
                            <Link to="/products_services" className={getLinkClass('/products_services')}>Productos</Link>
                        </li>
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''}`}>
                            <Link to="/sales" className={getLinkClass('/sales', '/sales/register')}>Ventas</Link>
                        </li>
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''}`}>
                            <Link to="/users" className={getLinkClass('/users')}>Usuarios</Link>
                        </li>
                        <li className={`nav-item ${subscriptions.length === 0 ? 'd-none' : ''}`}>
                            <Link to="/profile" className={getLinkClass('/profile')}>Perfil</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/" onClick={logout} className="nav-link text-danger fw-bold">Salir</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
