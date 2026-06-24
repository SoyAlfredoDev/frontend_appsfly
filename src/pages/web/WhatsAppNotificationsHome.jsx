import { motion } from 'framer-motion';
import WhatsAppNotificationsPreview from '../../components/web/WhatsAppNotificationsPreview.jsx';
import GradientText from '../../components/web/GradientText.jsx';

const TAGS = [
    { label: 'Próximamente', soon: true },
    { label: 'Gracias por tu compra' },
    { label: 'Cumpleaños' },
    { label: 'Cobros atrasados' },
    { label: 'Recordatorios' },
    { label: 'Pedidos listos' },
    { label: 'Campañas' },
];

export default function WhatsAppNotificationsHome() {
    return (
        <section className="py-16 md:py-28 bg-white font-sans overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-1 text-center lg:text-left"
                    >
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                            <span className="inline-block text-secondary font-bold tracking-wider uppercase text-xs sm:text-sm">
                                💬 Módulo del sistema
                            </span>
                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 shadow-sm">
                                🔜 Próximamente
                            </span>
                        </div>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-5">
                            💚 Notificaciones por <GradientText>WhatsApp</GradientText>
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Enviamos notificaciones al WhatsApp de tus clientes de forma automática:
                            confirmaciones de compra, recordatorios, cobros pendientes, pedidos listos
                            y campañas para que vuelvan a comprar — sin que tengas que escribir uno por uno.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                            {TAGS.map((tag, i) => (
                                <motion.span
                                    key={tag.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    className={
                                        tag.soon
                                            ? 'rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-amber-800 shadow-sm'
                                            : 'rounded-full border border-slate-200 bg-surface px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm'
                                    }
                                >
                                    {tag.label}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-2"
                    >
                        <WhatsAppNotificationsPreview />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
