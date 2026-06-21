import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaComments, FaPaperPlane, FaRobot, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import {
    getAssistantStatusRequest,
    sendAssistantMessageRequest,
} from "../../api/assistant.js";

const SUGGESTIONS = [
    "¿Cuántas ventas hubo este mes?",
    "Búscame un cliente por nombre",
    "¿Qué productos tienen poco stock?",
    "Muéstrame las últimas ventas",
];

function MessageBubble({ message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isUser ? "bg-primary/20 text-primary" : "bg-slate-700 text-slate-200"
                }`}
            >
                {isUser ? <FaUser className="text-sm" /> : <FaRobot className="text-sm" />}
            </div>
            <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                }`}
            >
                {message.content}
            </div>
        </div>
    );
}

export default function AssistantPanel() {
    const { businessSelected } = useAuth();
    const isTenantAdmin = businessSelected?.userBusinessRole === "ADMIN";

    const [open, setOpen] = useState(false);
    const [canAccess, setCanAccess] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [checking, setChecking] = useState(true);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hola, soy tu asistente de AppsFly. Puedo buscar clientes, consultar ventas, reportes y stock. ¿En qué te ayudo?",
        },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isTenantAdmin) {
            setChecking(false);
            setAvailable(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await getAssistantStatusRequest();
                if (!cancelled) {
                    setCanAccess(Boolean(res.data?.canAccess));
                    setEnabled(Boolean(res.data?.enabled));
                }
            } catch {
                if (!cancelled) {
                    setCanAccess(false);
                    setEnabled(false);
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isTenantAdmin]);

    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open, sending]);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 200);
            return () => clearTimeout(t);
        }
    }, [open]);

    const sendMessage = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || sending) return;

            const nextMessages = [
                ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
                { role: "user", content: trimmed },
            ];

            setMessages(nextMessages);
            setInput("");
            setSending(true);
            setError(null);

            try {
                const payload = nextMessages.map(({ role, content }) => ({
                    role,
                    content,
                }));
                const res = await sendAssistantMessageRequest(payload);
                const reply = res.data?.reply ?? "Sin respuesta.";
                setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            } catch (err) {
                const msg =
                    err.response?.data?.error ||
                    "No se pudo contactar al asistente. Intenta más tarde.";
                setError(msg);
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: msg },
                ]);
            } finally {
                setSending(false);
            }
        },
        [messages, sending],
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    if (!isTenantAdmin || checking || !canAccess) {
        return null;
    }

    const notConfigured = !enabled;

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-4 z-[60] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:bottom-6 sm:right-6"
                        style={{ maxHeight: "min(70vh, 520px)" }}
                    >
                        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800/90 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <FaRobot className="text-primary" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Asistente AppsFly
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Solo consultas · Admin
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                                aria-label="Cerrar asistente"
                            >
                                <FaTimes />
                            </button>
                        </header>

                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
                        >
                            {notConfigured ? (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">
                                    El asistente aún no está activo en el servidor. Agrega{" "}
                                    <code className="text-amber-200">GEMINI_API_KEY</code> en el
                                    backend (Google AI Studio, tier gratuito) y reinicia la API.
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <MessageBubble key={`${msg.role}-${idx}`} message={msg} />
                                ))
                            )}
                            {sending && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="inline-flex gap-1">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                                    </span>
                                    Consultando datos…
                                </div>
                            )}
                        </div>

                        {messages.length <= 1 && !sending && !notConfigured && (
                            <div className="flex flex-wrap gap-2 border-t border-slate-800 px-3 py-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => sendMessage(s)}
                                        className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-primary/50 hover:text-white"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && (
                            <p className="px-3 pb-1 text-xs text-amber-400">{error}</p>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 border-t border-slate-700 bg-slate-800/50 p-3"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    notConfigured
                                        ? "Configura GEMINI_API_KEY en el servidor"
                                        : "Escribe tu consulta…"
                                }
                                disabled={sending || notConfigured}
                                className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none disabled:opacity-60"
                                maxLength={2000}
                            />
                            <button
                                type="submit"
                                disabled={sending || notConfigured || !input.trim()}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                                aria-label="Enviar"
                            >
                                <FaPaperPlane className="text-sm" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="fixed bottom-20 right-4 z-[59] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 sm:bottom-6 sm:right-6"
                aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
            >
                {open ? <FaTimes className="text-xl" /> : <FaComments className="text-xl" />}
            </motion.button>
        </>
    );
}
