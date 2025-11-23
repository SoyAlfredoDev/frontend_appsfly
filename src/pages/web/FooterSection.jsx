import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer-bg text-white pt-5 pb-4 mt-5">
            <div className="container">

                <div className="row">

                    {/* Logo + Descripción */}
                    <div className="col-12 col-md-4 mb-4">
                        <div className="d-flex align-items-center mb-2">
                            <img src="/logo.png" alt="AppsFly" height="40" className="me-2" />
                            <h5 className="fw-bold m-0">AppsFly</h5>
                        </div>
                        <p>
                            Sistema SaaS diseñado para emprendedores y negocios que buscan
                            una gestión moderna, rápida y en la nube.
                        </p>
                    </div>

                    {/* Enlaces útiles */}
                    <div className="col-6 col-md-4 mb-4">
                        <h6 className="fw-bold">Enlaces</h6>
                        <ul className="list-unstyled">
                            <li><a href="#inicio" className="footer-link">Inicio</a></li>
                            <li><a href="#plan" className="footer-link">Plan Emprende</a></li>
                            <li><a href="#reportes" className="footer-link">Reportes</a></li>
                            <li><a href="#dashboard" className="footer-link">Dashboard</a></li>
                        </ul>
                    </div>

                    {/* Redes sociales */}
                    <div className="col-6 col-md-4 mb-4">
                        <h6 className="fw-bold">Contáctanos</h6>

                        <a
                            href="https://wa.me/XXXXXXXXXXX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-block footer-link mb-2"
                        >
                            WhatsApp
                        </a>

                        <a
                            href="mailto:contacto@appsfly.com"
                            className="d-block footer-link"
                        >
                            contacto@appsfly.com
                        </a>
                    </div>
                </div>

                <hr className="border-light" />

                <div className="text-center mt-3">
                    <p className="m-0">
                        © {new Date().getFullYear()} AppsFly — Todos los derechos reservados.
                    </p>
                </div>

            </div>
        </footer>
    );
}
