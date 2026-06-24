import { motion } from 'framer-motion';
import LandingScreenshotGallery from '../../components/web/LandingScreenshotGallery.jsx';
import GradientText from '../../components/web/GradientText.jsx';

const TAGS = [
    'Registro rápido de ventas',
    'Historial del cliente',
    'Cuentas por cobrar',
    'Envío digital de comprobantes',
    'Múltiples métodos de pago',
    'Ficha completa del cliente',
];

const PREVIEW_IMAGES = [
    {
        src: '/hero/imagen-hero-02.png',
        alt: 'Historial de ventas en AppsFly',
        title: 'Historial de ventas',
        label: 'Listado de ventas',
        description: 'Consulta y gestiona todas tus ventas realizadas',
    },
    {
        src: '/hero/ventas-clientes-nuevo-cliente.png',
        alt: 'Formulario para registrar un nuevo cliente en AppsFly',
        title: 'Nuevo cliente',
        label: 'Alta de cliente',
        description: 'Registra clientes en segundos desde la venta',
    },
];

export default function SalesCustomersHome() {
    return (
        <section className="py-16 md:py-28 bg-surface font-sans overflow-hidden relative">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-2 lg:order-1"
                    >
                        <LandingScreenshotGallery images={PREVIEW_IMAGES} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-1 lg:order-2 text-center lg:text-left"
                    >
                        <span className="inline-block text-secondary font-bold tracking-wider uppercase text-xs sm:text-sm mb-4">
                            ⚡ Módulo del sistema
                        </span>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-5">
                            💳 Ventas y <GradientText>Clientes</GradientText>
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Registra tus ventas de forma fácil y ordenada, y mantén siempre el contacto
                            con tus clientes. Cada venta queda vinculada a quien compró, para que no
                            pierdas el rastro de lo que vendiste ni de lo que aún te deben.
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
