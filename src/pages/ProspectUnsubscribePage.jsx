import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    getProspectUnsubscribeInfoRequest,
    unsubscribeProspectRequest,
} from "../api/emailProspects.js";

export default function ProspectUnsubscribePage() {
    const { token } = useParams();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await getProspectUnsubscribeInfoRequest(token);
                if (!cancelled) {
                    setInfo(res.data);
                    if (res.data.status === "UNSUBSCRIBED") setDone(true);
                }
            } catch {
                if (!cancelled) setError("Este enlace de baja no es válido o ya expiró.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const handleUnsubscribe = async () => {
        setLoading(true);
        try {
            await unsubscribeProspectRequest(token);
            setDone(true);
            setError(null);
        } catch {
            setError("No pudimos procesar tu baja. Intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                <h1 className="text-xl font-bold text-slate-800 mb-2">AppsFly</h1>
                {loading && <p className="text-slate-500 text-sm">Cargando…</p>}
                {!loading && error && (
                    <>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <Link to="/" className="text-primary text-sm font-medium no-underline">
                            Ir a AppsFly
                        </Link>
                    </>
                )}
                {!loading && !error && done && (
                    <>
                        <p className="text-slate-700 text-sm mb-2">
                            {info?.email
                                ? `El correo ${info.email} no recibirá más mensajes de outreach de AppsFly.`
                                : "Tu baja fue registrada correctamente."}
                        </p>
                        <p className="text-slate-500 text-xs mb-4">
                            Si creaste cuenta en AppsFly, este correo de marketing ya no te afectará.
                        </p>
                        <Link to="/" className="text-primary text-sm font-medium no-underline">
                            Conocer AppsFly
                        </Link>
                    </>
                )}
                {!loading && !error && !done && info && (
                    <>
                        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                            ¿Quieres dejar de recibir correos de presentación de AppsFly en{" "}
                            <strong>{info.email}</strong>?
                        </p>
                        <button
                            type="button"
                            onClick={handleUnsubscribe}
                            className="w-full rounded-lg bg-slate-800 text-white py-2.5 text-sm font-semibold hover:bg-slate-700 mb-3"
                        >
                            Confirmar baja
                        </button>
                        <Link to="/" className="text-slate-500 text-xs no-underline">
                            Cancelar y volver al sitio
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
