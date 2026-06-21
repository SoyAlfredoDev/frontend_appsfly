/** Vista previa del HTML del correo como lo verá el destinatario */
export default function EmailMessagePreview({ html, subject, className = "" }) {
    if (!html) {
        return (
            <div className={`rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400 ${className}`}>
                Guarda la campaña para ver la previsualización del mensaje.
            </div>
        );
    }

    return (
        <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
            <div className="border-b border-gray-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Vista previa del correo
                </p>
                {subject && (
                    <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
                        Asunto: {subject}
                    </p>
                )}
            </div>
            <iframe
                title="Vista previa del email"
                srcDoc={html}
                className="w-full h-[480px] border-0 bg-white"
                sandbox="allow-same-origin"
            />
        </div>
    );
}
