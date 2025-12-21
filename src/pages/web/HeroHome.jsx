import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

export default function HeroHomePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <section className="text-center pt-12 pb-20 md:pt-24 md:pb-32 px-4 bg-gradient-to-b from-white to-sky-50 overflow-hidden">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto relative z-10"
            >
                {/* Badge / Pill */}
                <motion.div variants={itemVariants} className="mb-6 flex justify-center">
                    <span className="bg-blue-50 text-secondary border border-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                        Plataforma SaaS #1 en Latam
                    </span>
                </motion.div>

                <motion.h1 
                    variants={itemVariants} 
                    className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 text-dark leading-[1.1] font-display"
                >
                    Automatiza tu negocio <br className="hidden md:block" /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary bg-[length:200%_auto] animate-gradient">
                        sin complicaciones.
                    </span>
                </motion.h1>

                <motion.p 
                    variants={itemVariants} 
                    className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 md:mb-14 max-w-3xl mx-auto px-4 font-sans leading-relaxed"
                >
                    Control de inventario, ventas y reportes en una sola plataforma.
                    Diseñado para crecer contigo.
                </motion.p>

                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto px-6 sm:px-0"
                >
                    {/* Primary Button - Vibrant Green */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link 
                            to="/register" 
                            className="
                                px-10 py-4 text-lg md:text-xl 
                                bg-primary text-white rounded-full font-bold 
                                hover:bg-[#00b067] transition-all shadow-xl hover:shadow-primary/50 
                                flex items-center justify-center gap-3
                                font-sans
                            "
                        >
                            Empezar ahora <FaArrowRight />
                        </Link>
                    </motion.div>

                    {/* Secondary Button */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link 
                            to="/login" 
                            className="
                                px-10 py-4 text-lg md:text-xl 
                                bg-white text-dark border-2 border-slate-200 rounded-full font-bold 
                                hover:border-secondary hover:text-secondary transition-all
                                flex items-center justify-center
                                font-sans shadow-sm hover:shadow-md
                            "
                        >
                            Ver Demo
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl"></div>
            </div>
        </section>
    );
}