// src/components/KpiComponent.jsx
import "./KpiComponent.css";

export default function KpiComponent({ title, icon, value, footer, loading }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3 col-xxl-2">
            <div className="indicator-card">

                {/* Título */}
                <div className="indicator-header">
                    <h4 className="indicator-title">{title}</h4>
                </div>

                {/* Icono + Valor */}
                <div className="indicator-content">
                    <div className="indicator-icon">{icon}</div>

                    <span className="indicator-value">
                        {loading || value === null
                            ? "⏳ Cargando..."
                            : value.toLocaleString("es-CL", {
                                style: "currency",
                                currency: "CLP",
                            })
                        }
                    </span>
                </div>

                {/* Footer */}
                <div className="indicator-footer">
                    {footer}
                </div>

            </div>
        </div>
    );
}
