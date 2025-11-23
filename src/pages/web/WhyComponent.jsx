import "./Why.css";

export default function WhyComponent() {
    return (
        <section className="pt-4 text-center">
            <div className="container">
                <h2 className="fw-bold text-success mb-4">¿Por qué AppsFly?</h2>

                <div className="row g-4 justify-content-center">

                    <div className="col-10 col-md-4">
                        <div className="card shadow-sm border-success h-100">
                            <div className="card-body">
                                <h5 className="text-success fw-bold">Fácil de usar</h5>
                                <p>Diseñado para que cualquier persona pueda manejar el sistema sin complicaciones.</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-10 col-md-4">
                        <div className="card shadow-sm border-success h-100">
                            <div className="card-body">
                                <h5 className="text-success fw-bold">Accesible 24/7</h5>
                                <p>Accede a tu negocio desde cualquier dispositivo, en cualquier lugar.</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-10 col-md-4">
                        <div className="card shadow-sm border-success h-100">
                            <div className="card-body">
                                <h5 className="text-success fw-bold">Seguro</h5>
                                <p>Protegemos tu información con sistemas de seguridad profesionales.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
