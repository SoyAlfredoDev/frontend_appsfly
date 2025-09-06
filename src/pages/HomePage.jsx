import { Link } from "react-router-dom";
import "./HomePage.css"; // Importa el archivo CSS personalizado

export default function HomePage() {
    return (
        <div className="home-container d-flex align-items-center justify-content-center">
            <div className="card home-card shadow p-4 text-center">
                <h1 className="mb-3">Bienvenido a AppsFly</h1>
                <p className="lead mb-4">
                    Automatiza tus ventas, el control de inventario y la generación de reportes.
                    Con nuestro sistema AppsFly, puedes hacerlo de forma fácil, rápida y eficiente.
                </p>
                <div className="d-grid gap-2">
                    <Link to="/login" className="btn btn-success btn-lg">
                        Iniciar sesión
                    </Link>
                    <Link to="/register" className="btn btn-outline-success btn-lg">
                        Registrarse
                    </Link>
                </div>
            </div>
        </div>
    );
}
