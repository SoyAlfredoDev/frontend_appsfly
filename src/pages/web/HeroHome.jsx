import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import NavbarHome from './NavbarHome';

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
        // CAMBIOS REALIZADOS AQUÍ:
        // 1. 'h-screen' -> 'min-h-screen': Permite que la sección crezca si el contenido es largo.
        // 2. 'overflow-hidden' -> 'overflow-x-hidden': Permite scroll vertical, evita scroll horizontal por las animaciones.
        // 3. 'h-full' en flex container para centrado vertical opcional.
        <section className="min-h-screen flex flex-col relative bg-gradient-to-b from-white to-sky-50 overflow-x-hidden">
            
            <NavbarHome />

            {/* Contenedor principal centrado verticalmente y horizontalmente */}
            <div className="flex-grow flex items-center justify-center pt-12 pb-20 md:pt-2 md:pb-32 px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-5xl mx-auto relative z-10 text-center"
                >  
                    {/* Badge / Pill */}
                    <motion.div variants={itemVariants} className="mb-4 flex justify-center">
                        <span className="bg-blue-50 text-secondary border border-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                            Ten el control de tu negocio
                        </span>
                    </motion.div>          

                    {/* Título: Ajusté text-5xl a text-4xl en móvil para ganar espacio */}
                    <motion.h1 
                        variants={itemVariants} 
                        className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-6 md:mb-8 text-dark leading-[1.1] font-display"
                    >
                        Automatiza tu negocio <br className="hidden md:block" /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary bg-[length:200%_auto] animate-gradient">
                            sin complicaciones.
                        </span>
                    </motion.h1>

                    <motion.p 
                        variants={itemVariants} 
                        className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-14 max-w-3xl mx-auto px-4 font-sans leading-relaxed"
                    >
                        Control de inventario, ventas y reportes en una sola plataforma.
                        Diseñado para crecer contigo.
                    </motion.p>

                    <motion.div 
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto px-6 sm:px-0 pb-10 sm:pb-0" // Añadido pb-10 extra por seguridad en móvil
                    >
                        {/* Primary Button */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link 
                                to="/register" 
                                className="
                                    px-10 py-3 text-lg md:text-xl 
                                    bg-primary text-white rounded-full font-bold 
                                    hover:bg-[#00b067] transition-all shadow-xl hover:shadow-primary/50 
                                    flex items-center justify-center gap-3
                                    font-sans w-full sm:w-auto
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
                                    px-10 py-3 text-lg md:text-xl 
                                    bg-white text-dark border-2 border-slate-200 rounded-full font-bold 
                                    hover:border-secondary hover:text-secondary transition-all
                                    flex items-center justify-center
                                    font-sans shadow-sm hover:shadow-md w-full sm:w-auto
                                "
                            >
                                Ver Demo
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Background Decor - Fixed positioning relative to section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl"></div>
            </div>
        </section>
    );
}