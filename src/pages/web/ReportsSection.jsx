import React from "react";
import "./ReportsSection.css";

export default function ReportsSection() {
    return (
        <section className="py-5">
            <div className="container">

                <h2 className="text-success fw-bold text-center">Comprobantes y Reportes</h2>
                <p className="text-center mb-5">
                    Genera y consulta facturas, boletas y reportes detallados de tus ventas.
                </p>

                <div className="row g-4 mb-5">

                    <div className="col-12 col-md-6">
                        <div className="card shadow-sm h-100">
                            <img src="/comprobantes.png" className="card-img-top" alt="Comprobantes" />
                            <div className="card-body">
                                <p className="card-text fw-semibold">Consulta todas las boletas y facturas generadas.</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="card shadow-sm h-100">
                            <img src="/reportes.png" className="card-img-top" alt="Reportes" />
                            <div className="card-body">
                                <p className="card-text fw-semibold">Reportes automáticos con gráficos en tiempo real.</p>
                            </div>
                        </div>
                    </div>

                </div>

                <h2 className="text-success fw-bold text-center">Dashboard</h2>
                <p className="text-center mb-4">
                    Visualiza métricas claras del rendimiento de tu negocio.
                </p>

                <div className="text-center">
                    <img src="/dashboard.png" className="img-fluid dashboard-img shadow rounded" alt="Dashboard" />
                </div>

            </div>
        </section>
    );
}
