import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaDesktop, FaMobileAlt, FaTabletAlt } from 'react-icons/fa';
import HeroScreenshotGallery from './HeroScreenshotGallery';
import GradientText from '../../components/web/GradientText.jsx';

const PLATFORMS = [
    { icon: FaDesktop, label: 'Computador' },
    { icon: FaTabletAlt, label: 'Tablet' },
    { icon: FaMobileAlt, label: 'Teléfono' },
];

export default function HeroHomePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    return (
        <section className="min-h-[calc(100dvh-5rem)] flex flex-col relative bg-gradient-to-b from-white via-white to-sky-50 overflow-x-hidden">
            <div className="flex-grow flex items-center pt-6 pb-16 md:pt-8 md:pb-24 px-4 sm:px-6 lg:px-12">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Contenido — izquierda en desktop */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="relative z-10 text-center lg:text-left"
                        >
                            <motion.div variants={itemVariants} className="mb-5 flex justify-center lg:justify-start">
                                <span className="bg-blue-50 text-secondary border border-blue-100 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase">
                                    🚀 Sistema para registrar ventas
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-dark leading-[1.08] font-display"
                            >
                                ✨ AppsFly: tu negocio{' '}
                                <GradientText>en un solo lugar</GradientText>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                            >
                                Ventas, inventario, gastos y reportes en una plataforma clara y fácil de usar.
                                Diseñada para que entiendas tu negocio de un vistazo.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full sm:w-auto"
                            >
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        to="/register"
                                        className="px-8 py-3.5 text-base sm:text-lg bg-primary text-white rounded-full font-bold hover:bg-[#00b067] transition-all shadow-xl hover:shadow-primary/40 flex items-center justify-center gap-3 w-full sm:w-auto"
                                    >
                                        Empezar gratis 🎉 <FaArrowRight />
                                    </Link>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        to="/login"
                                        className="px-8 py-3.5 text-base sm:text-lg bg-white text-dark border-2 border-slate-200 rounded-full font-bold hover:border-secondary hover:text-secondary transition-all flex items-center justify-center shadow-sm hover:shadow-md w-full sm:w-auto"
                                    >
                                        Ver el sistema 👀
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="mt-8 lg:mt-10"
                            >
                                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    ✨ Disponible en
                                </p>
                                <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8 lg:justify-start">
                                    {PLATFORMS.map(({ icon: Icon, label }, i) => (
                                        <motion.div
                                            key={label}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
                                            whileHover={{ y: -4 }}
                                            className="flex flex-col items-center gap-2.5"
                                        >
                                            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-secondary shadow-lg shadow-slate-200/60 transition-shadow hover:border-primary/30 hover:shadow-primary/20 sm:rounded-3xl">
                                                <Icon className="text-4xl sm:text-5xl" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 sm:text-sm">
                                                {label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Galería — derecha en desktop */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                            className="relative z-10 mt-4 lg:mt-0"
                        >
                            <HeroScreenshotGallery />
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl" />
            </div>
        </section>
    );
}
