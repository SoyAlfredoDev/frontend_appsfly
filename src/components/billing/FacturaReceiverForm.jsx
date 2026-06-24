export default function FacturaReceiverForm({ value, onChange, disabled = false }) {
    const data = value ?? {};

    const handle = (field) => (e) => {
        onChange({ ...data, [field]: e.target.value });
    };

    const fieldClass =
        "input-field h-11 w-full disabled:opacity-60 disabled:cursor-not-allowed";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Razón social
                </label>
                <input
                    type="text"
                    value={data.businessName ?? ""}
                    onChange={handle("businessName")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    RUT
                </label>
                <input
                    type="text"
                    value={data.rut ?? ""}
                    onChange={handle("rut")}
                    disabled={disabled}
                    placeholder="76123456-7"
                    className={fieldClass}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Giro
                </label>
                <input
                    type="text"
                    value={data.businessActivity ?? ""}
                    onChange={handle("businessActivity")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Dirección
                </label>
                <input
                    type="text"
                    value={data.address ?? ""}
                    onChange={handle("address")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Comuna
                </label>
                <input
                    type="text"
                    value={data.commune ?? ""}
                    onChange={handle("commune")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Ciudad
                </label>
                <input
                    type="text"
                    value={data.city ?? ""}
                    onChange={handle("city")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    value={data.email ?? ""}
                    onChange={handle("email")}
                    disabled={disabled}
                    className={fieldClass}
                />
            </div>
        </div>
    );
}
