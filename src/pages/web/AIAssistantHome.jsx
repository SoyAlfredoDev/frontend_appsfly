import { motion } from 'framer-motion';
import AIChatPreview from '../../components/web/AIChatPreview.jsx';
import GradientText from '../../components/web/GradientText.jsx';

const TAGS = [
    'Registrar clientes',
    'Enviar mensajes',
    'Hacer preguntas',
    'Consultar ventas',
    'Revisar stock bajo',
    'Buscar productos',
];

export default function AIAssistantHome() {
    return (
        <section className="py-16 md:py-28 bg-surface font-sans overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-2 lg:order-1"
                    >
                        <AIChatPreview />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-1 lg:order-2 text-center lg:text-left"
                    >
                        <span className="inline-block text-secondary font-bold tracking-wider uppercase text-xs sm:text-sm mb-4">
                            🤖 Módulo del sistema
                        </span>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-5">
                            🧠 Inteligencia <GradientText>Artificial</GradientText>
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Habla con el asistente como si fuera un compañero de trabajo. Pídele
                            que registre clientes, envíe mensajes, responda tus dudas o consulte
                            ventas y stock sin tener que navegar por todo el sistema.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                            {TAGS.map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm"
                                >
                                    {tag}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
