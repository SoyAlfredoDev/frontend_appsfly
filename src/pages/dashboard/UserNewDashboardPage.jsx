import { Link } from "react-router-dom";

export default function UserNewDashboardPage() {
    return (
        <div className="container d-flex justify-content-center align-items-center">
            <div className="shadow-sm mb-3 rounded-3 border-0" style={{ maxWidth: "600px" }}>
                <div className="card-body text-center">
                    <h1 className="card-title mb-3 text-primary fw-bold">
                        Bienvenido a <span className="text-success">AppsFly</span>
                    </h1>

                    <p className="card-text text-muted mb-3">
                        Según nuestro registro no tienes un negocio asociado a tu cuenta.
                        Para comenzar a usar la aplicación debes registrar tu negocio o
                        solicitar acceso a uno existente.
                    </p>

                    <div className="alert alert-warning small" role="alert">
                        Recuerda que para que tu cuenta permanezca activa debes confirmar
                        tu correo electrónico.
                    </div>

                    <div className="d-grid gap-3 mt-4">
                        <button className="btn btn-warning fw-semibold">
                            Confirmar correo
                        </button>

                        <Link
                            to="/business/register"
                            className="btn btn-primary fw-semibold"
                        >
                            Registrar Negocio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
