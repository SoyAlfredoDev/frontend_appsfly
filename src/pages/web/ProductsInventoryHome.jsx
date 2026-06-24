import { motion } from 'framer-motion';
import LandingScreenshotGallery from '../../components/web/LandingScreenshotGallery.jsx';
import GradientText from '../../components/web/GradientText.jsx';

const TAGS = [
    'Catálogo de productos y servicios',
    'Precios, SKU y categorías',
    'Control de stock en tiempo real',
    'Ajustes de inventario',
    'Alertas de stock bajo',
    'Historial de movimientos',
];

const PREVIEW_IMAGES = [
    {
        src: '/hero/productos-servicios-listado.png',
        alt: 'Listado de productos y servicios en AppsFly',
        title: 'Productos y servicios',
        label: 'Catálogo',
        description: 'Organiza productos y servicios con precios y categorías',
    },
    {
        src: '/hero/inventario-stock.png',
        alt: 'Control de inventario y stock en AppsFly',
        title: 'Inventario',
        label: 'Stock y movimientos',
        description: 'Revisa stock disponible y movimientos de bodega',
    },
];

export default function ProductsInventoryHome() {
    return (
        <section className="py-16 md:py-28 bg-white font-sans overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-1 text-center lg:text-left"
                    >
                        <span className="inline-block text-secondary font-bold tracking-wider uppercase text-xs sm:text-sm mb-4">
                            ⚡ Módulo del sistema
                        </span>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-5">
                            📦 Productos, Servicios e <GradientText>Inventario</GradientText>
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Carga lo que vendes —productos o servicios— con sus precios y categorías.
                            Lleva el control de cuánto tienes en bodega para vender con tranquilidad
                            y saber cuándo te estás quedando sin stock.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                            {TAGS.map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    className="rounded-full border border-slate-200 bg-surface px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm"
                                >
                                    {tag}
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
                        <LandingScreenshotGallery images={PREVIEW_IMAGES} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
