/**
 * Tabla de graduación al estilo de una receta óptica (OD / OI).
 */
const RX_COLUMNS = [
    { key: "Sphere", label: "Esfera", short: "Esf." },
    { key: "Cylinder", label: "Cilindro", short: "Cil." },
    { key: "Axis", label: "Eje", short: "Eje" },
    { key: "Addition", label: "Adición", short: "Add" },
    { key: "Prism", label: "Prisma", short: "Prism" },
    { key: "Base", label: "Base", short: "Base" },
];

const cellInputClass =
    "w-full min-w-[4.5rem] px-2 py-2 text-center text-sm font-mono tabular-nums rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400";

export default function PrescriptionRxTable({
    formData,
    onChange,
    disabled = false,
}) {
    const handleCell = (name, value) => {
        onChange?.({ target: { name, value } });
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="px-4 py-2.5 bg-slate-800 text-white flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                        Fórmula óptica
                    </span>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider">
                        OD · OI
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 w-16">
                                    Ojo
                                </th>
                                {RX_COLUMNS.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
                                        title={col.label}
                                    >
                                        <span className="hidden sm:inline">{col.label}</span>
                                        <span className="sm:hidden">{col.short}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { prefix: "od", label: "OD", sub: "Derecho" },
                                { prefix: "oi", label: "OI", sub: "Izquierdo" },
                            ].map((eye, idx) => (
                                <tr
                                    key={eye.prefix}
                                    className={idx === 0 ? "border-b border-slate-100" : ""}
                                >
                                    <td className="px-3 py-3 bg-slate-50/80 align-middle">
                                        <div className="leading-tight">
                                            <span className="block text-sm font-bold text-slate-800">
                                                {eye.label}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                                                {eye.sub}
                                            </span>
                                        </div>
                                    </td>
                                    {RX_COLUMNS.map((col) => {
                                        const name = `${eye.prefix}${col.key}`;
                                        return (
                                            <td key={name} className="px-1.5 py-2 align-middle">
                                                <input
                                                    type="text"
                                                    name={name}
                                                    value={formData?.[name] ?? ""}
                                                    onChange={(e) => handleCell(name, e.target.value)}
                                                    disabled={disabled}
                                                    inputMode="decimal"
                                                    placeholder="—"
                                                    aria-label={`${eye.label} ${col.label}`}
                                                    className={cellInputClass}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Distancia pupilar (PD)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { name: "pdBinocular", label: "PD binocular" },
                        { name: "pdOd", label: "PD OD" },
                        { name: "pdOi", label: "PD OI" },
                        { name: "pdNear", label: "PD cerca" },
                    ].map((field) => (
                        <label key={field.name} className="block">
                            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                {field.label}
                            </span>
                            <input
                                type="text"
                                name={field.name}
                                value={formData?.[field.name] ?? ""}
                                onChange={(e) => handleCell(field.name, e.target.value)}
                                disabled={disabled}
                                inputMode="decimal"
                                placeholder="—"
                                className={cellInputClass}
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
