import "./Hero.css";
import { Link } from "react-router-dom";
export default function HeroComponent() {
    return (
        <section className="pt-1 hero-bg text-white text-center">
            <div className="text-center text-md-end">
                <Link to={'/login'} className="btn btn-sm btn-outline-warning me-2" style={{ width: '130px' }}>
                    Login
                </Link>
                <Link to={'/register'} className="btn btn-sm btn-outline-light me-2" style={{ width: '130px' }}>
                    Registrar
                </Link>
            </div>
            <div className="container py-2">
                <h1 className="fw-bold display-5">Tu negocio, en la nube con AppsFly</h1>
                <p className="lead mt-1">
                    Gestiona tu negocio de manera fácil, rápida y profesional con nuestro sistema SaaS.
                </p>
            </div>
        </section>
    );
}
