import { FaFileInvoice } from "react-icons/fa";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";

export default function TaxBillingPage() {
    return (
        <ExpensePageLayout
            title="Facturación Electrónica"
            subtitle="Emisión y seguimiento de boletas y facturas electrónicas"
        >
            <div className="card">
                <div className="card-body flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <FaFileInvoice className="text-3xl" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Estamos trabajando en esta función
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                        Estamos trabajando en conectarnos para generar boletas y facturas
                        electrónicas. Muy pronto informaremos cuando esta función esté disponible.
                    </p>
                </div>
            </div>
        </ExpensePageLayout>
    );
}
