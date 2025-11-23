export default function SectionHeader({
    title,
    globalFilter,
    setGlobalFilter,
    button,
    placeholderInputSearch = "Buscar...",
}) {
    return (
        <div className="px-3" style={{ marginTop: '80px' }}>
            {/* --- LAYOUT PARA ESCRITORIO (md+) --- */}
            <div className="d-md-flex row align-items-center">
                {/* Título */}
                <div className=" col-10 col-md-4 d-flex justify-content-md-start mb-2">
                    <h1 className="m-0">{title}</h1>
                </div>
                {/* Botón */}
                <div className="col-2 col-md-2 d-flex justify-content-md-start mb-2 ">
                    {button}
                </div>
                {/* Buscador */}
                <div className="col-12 col-md-6 d-flex justify-content-md-start mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={placeholderInputSearch}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
