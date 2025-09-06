import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import InputFloatingComponent from "../components/inputs/InputFloatingComponent";
import { useAuth } from "../context/AuthContext.jsx";
import logoappsfly from "../../public/logoappsfly.png";
import "./LoginPage.css";

export default function LoginPage() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // <-- Estado de carga

    const [formData, setFormData] = useState({
        userEmail: '',
        userPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true); // <-- Activar carga

        try {
            const res = await signin(formData);
            if (!res) {
                setError('Contraseña o usuario erróneo');
                setLoading(false); // <-- Desactivar carga si falla
                return navigate('/login');
            }
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
            setLoading(false); // <-- Desactivar carga si hay error
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="card login-card shadow p-4">
                <div className="text-center mb-4">
                    <img
                        src={logoappsfly}
                        className="img-fluid logo"
                        alt="logoAppsfly"
                    />
                </div>
                {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                )}
                <form onSubmit={handleOnSubmit}>
                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                    />

                    <InputFloatingComponent
                        label="Contraseña"
                        type="password"
                        name="userPassword"
                        value={formData.userPassword}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                    />

                    <div className="d-grid gap-2 mt-4">
                        <button
                            type="submit"
                            className="btn btn-success btn-lg"
                            disabled={loading} // <-- Deshabilita mientras carga
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                        <Link to="/" className="btn btn-outline-secondary btn-lg">
                            Volver
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
