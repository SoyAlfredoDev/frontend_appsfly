export default function DashboardAdminPage() {
    return (
        <div className="p-4 bg-light min-vh-100">
            <h1 className="mb-4 fw-bold text-dark">📊 Dashboard Administrador</h1>

            {/* Tarjetas resumen */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ventas del Mes</h6>
                        <span className="h4 text-success fw-bold">$2.300.000</span>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Ventas del Día</h6>
                        <span className="h4 text-success fw-bold">$2.300.000</span>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-center">
                        <h6 className="text-muted">Por Cobrar</h6>
                        <span className="h4 text-warning fw-bold">$2.300.000</span>
                    </div>
                </div>
            </div>

            <hr />

            {/* Accesos rápidos */}
            <h5 className="mb-3">⚡ Accesos Rápidos</h5>
            <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-success">➕ Nueva Venta</button>
                <button className="btn btn-primary">📦 Productos</button>
                <button className="btn btn-warning text-white">👥 Clientes</button>
                <button className="btn btn-info text-white">📑 Reportes</button>
            </div>
        </div>
    );
}
