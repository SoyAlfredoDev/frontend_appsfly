import EmailMessagePreview from "../admin/EmailMessagePreview.jsx";

const VARIANT_BADGE = {
    overview: "bg-blue-50 text-blue-700 border-blue-200",
    offer: "bg-amber-50 text-amber-800 border-amber-200",
    team: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function ProspectOutreachVariantsPanel({ data, loading }) {
    if (loading) {
        return (
            <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-400">Cargando variantes de correo…</p>
            </section>
        );
    }

    if (!data?.variants?.length) return null;

    return (
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-800">
                        3 mensajes de outreach (A/B/C)
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Cada envío usa una variante distinta. Se registra cuál abrió cada prospecto
                        para optimizar los siguientes ciclos.
                    </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 max-w-sm">
                    <p className="font-medium text-slate-700">Estrategia actual</p>
                    <p className="mt-0.5">{data.pickStrategy}</p>
                </div>
            </div>

            {data.totals && (
                <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Enviados (total)</p>
                        <p className="text-lg font-semibold text-slate-800">{data.totals.sent ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Abiertos (total)</p>
                        <p className="text-lg font-semibold text-slate-800">{data.totals.opened ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 col-span-2 sm:col-span-1">
                        <p className="text-xs text-slate-500">Tasa apertura global</p>
                        <p className="text-lg font-semibold text-primary">{data.totals.openRate ?? 0}%</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {data.variants.map((variant) => (
                    <div
                        key={variant.id}
                        className="rounded-xl border border-gray-200 overflow-hidden flex flex-col"
                    >
                        <div className="border-b border-gray-100 bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                                        VARIANT_BADGE[variant.id] ?? "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                >
                                    {variant.id}
                                </span>
                                <h3 className="text-sm font-semibold text-slate-800">{variant.name}</h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{variant.marketingAngle}</p>
                            {variant.goal && (
                                <p className="mt-1 text-xs text-slate-400">Objetivo: {variant.goal}</p>
                            )}
                        </div>

                        <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-gray-100 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">Enviados</p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {variant.stats?.sent ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">Abiertos</p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {variant.stats?.opened ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">Apertura</p>
                                <p className="text-sm font-semibold text-primary">
                                    {variant.stats?.openRate ?? 0}%
                                </p>
                            </div>
                        </div>

                        {variant.preheader && (
                            <p className="px-4 py-2 text-xs text-slate-500 border-b border-gray-100 italic">
                                Preheader: {variant.preheader}
                            </p>
                        )}

                        <EmailMessagePreview
                            html={variant.html}
                            subject={variant.subject}
                            className="rounded-none border-0 shadow-none flex-1"
                        />
                    </div>
                ))}
            </div>

            {Array.isArray(data.strategyNotes) && data.strategyNotes.length > 0 && (
                <ul className="mt-4 text-xs text-slate-500 space-y-1 list-disc list-inside">
                    {data.strategyNotes.map((note) => (
                        <li key={note}>{note}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
