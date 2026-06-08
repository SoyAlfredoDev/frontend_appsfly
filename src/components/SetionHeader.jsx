/**
 * Cabecera de sección — título (Chillax) + subtítulo opcional (Inter).
 * Usado por módulos premium con fondo claro de trabajo.
 */
export default function SectionHeader({
    title,
    subtitle,
    actions,
    globalFilter,
    setGlobalFilter,
    button,
    placeholderInputSearch = "Buscar...",
    showSearch = false,
}) {
    return (
        <header className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-[#021f41] font-display">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-slate-500 font-sans mt-1.5 max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
                {(actions || button) && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                        {button}
                    </div>
                )}
            </div>

            {showSearch && typeof setGlobalFilter === "function" && (
                <div className="max-w-md">
                    <input
                        type="text"
                        className="w-full py-2.5 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm font-sans"
                        placeholder={placeholderInputSearch}
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
            )}
        </header>
    );
}
