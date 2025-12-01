import { useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import { createSubscriptionRequest } from '../api/subscription.js'
import { useNavigate } from "react-router-dom";

export default function Subscription() {
    const { setSubscriptions, businessSelected } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({
        subscriptionId: uuidv4(),
        subscriptionBusinessId: businessSelected.userBusinessBusinessId,
        subscriptionPlanId: null,
        subscriptionPaymentMethod: null
    });

    const [loading, setLoading] = useState(false);

    const subscribe = async () => {
        try {
            setLoading(true);
            const newSubscription = {
                ...data,
                subscriptionPlanId: "P001"
            };
            if (
                !newSubscription.subscriptionId ||
                !newSubscription.subscriptionBusinessId
            ) {
                setLoading(false);
                return alert("Error al crear la suscripción, se sugiere recargar la página");
            }
            if (!newSubscription.subscriptionPlanId) {
                setLoading(false);
                return alert("Debe seleccionar un plan de suscripción");
            }
            // Actualizar el estado real
            setData(newSubscription);
            const res = await createSubscriptionRequest(newSubscription);
            if (res.status === 201) {
                setLoading(false);
                setSubscriptions(true);
                alert("Suscripción creada exitosamente, debe iniciaer sesión nuevamente para actualizar los datos.");
                navigate("/logout");

            } else {
                setLoading(false);
                alert("Error al crear la suscripción, por favor intente nuevamente.");
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Error al crear la suscripción, por favor intente nuevamente.");
        }
    };


    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">

                    {/* Mensaje de alerta */}
                    <div className="alert alert-info text-center shadow-sm" role="alert">
                        <strong>No tienes suscripciones activas.</strong><br />
                        Tu negocio actualmente no cuenta con un plan activo.
                    </div>

                    {/* Sección de bienvenida */}
                    <div className="text-center my-4">
                        <h3 className="fw-bold">BIENVENIDO A <span className="text-primary">APPSFLY</span></h3>
                        <p className="text-muted mb-1">
                            Para continuar, debes seleccionar un plan disponible.
                        </p>

                        <hr className="w-50 mx-auto" />
                        <p className="fw-semibold">Planes disponibles:</p>
                    </div>

                    {/* Tarjeta del plan */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title fw-bold mb-3">Plan Básico</h5>

                            <ul className="list-unstyled small">
                                <li>✔ Gratis por los primeros <strong>2 meses</strong></li>
                                <li>✔ Hasta <strong>5 usuarios</strong></li>
                                <li>✔ Soporte técnico incluido</li>
                            </ul>

                            <div className="mt-3">
                                <p className="mb-0 fw-bold">Precio mensual:</p>
                                <span className="fs-4 fw-bold text-success">$14.990 CLP</span>
                                <small className="text-muted"> + IVA</small>
                            </div>
                        </div>

                        <div className="card-footer bg-white border-0 text-center pb-4">
                            <button
                                className={`btn btn-primary px-4 py-2 ${loading ? 'disabled' : ''}`}
                                disabled={loading}
                                onClick={subscribe}
                            >
                                {!loading ? (
                                    "Seleccionar Plan Básico"
                                ) : (
                                    <>
                                        Creando suscripción
                                        <div className="spinner-grow text-light spinner-grow-sm ms-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
