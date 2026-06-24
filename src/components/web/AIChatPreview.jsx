import { motion } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const MESSAGES = [
    {
        role: 'user',
        text: '¿Cuántas ventas hubo este mes?',
        delay: 0.2,
    },
    {
        role: 'assistant',
        text: 'En junio llevas 47 ventas por $1.280.500. ¿Quieres el detalle por día?',
        delay: 0.55,
    },
    {
        role: 'user',
        text: 'Registra un cliente: María López, +56 9 8765 4321',
        delay: 0.9,
    },
    {
        role: 'assistant',
        text: 'Listo. Cliente María López registrado. ¿Le envío un mensaje de bienvenida?',
        delay: 1.25,
    },
];

function Bubble({ message }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isUser ? 'bg-primary/15 text-primary' : 'bg-slate-700 text-slate-200'
                }`}
            >
                {isUser ? <FaUser className="text-xs" /> : <FaRobot className="text-xs" />}
            </div>
            <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isUser
                        ? 'rounded-br-md bg-primary text-white'
                        : 'rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100'
                }`}
            >
                {message.text}
            </div>
        </div>
    );
}

export default function AIChatPreview() {
    return (
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 blur-2xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-slate-900/30"
            >
                <header className="flex items-center gap-3 border-b border-slate-700 bg-slate-800/90 px-4 py-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <FaRobot className="text-lg" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">Asistente AppsFly</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            En línea · responde al instante
                        </p>
                    </div>
                </header>

                <div className="space-y-4 px-4 py-5 min-h-[280px] sm:min-h-[320px]">
                    {MESSAGES.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: msg.delay, duration: 0.45, ease: 'easeOut' }}
                        >
                            <Bubble message={msg} />
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-800 px-4 py-3">
                    {['Consultar ventas', 'Stock bajo', 'Buscar cliente'].map((chip, i) => (
                        <motion.span
                            key={chip}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5 + i * 0.08 }}
                            className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                        >
                            {chip}
                        </motion.span>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-800/50 px-4 py-3">
                    <div className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-500">
                        Escribe tu consulta…
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                        <FaPaperPlane className="text-sm" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
