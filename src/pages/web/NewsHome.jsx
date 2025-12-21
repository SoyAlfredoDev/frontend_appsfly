import { motion } from 'framer-motion';
import { FaChartLine, FaShieldAlt, FaRocket } from 'react-icons/fa';

export default function NewsHomePage() {
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        // AJUSTE 1: Padding vertical reducido en móvil (py-8) vs escritorio (md:py-20)
        <section className="py-20 md:py-32 bg-surface font-sans relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-3 block">Innovación Constante</span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-dark">
                        Novedades del Sistema
                    </h2>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {[
                        { 
                            title: "Nuevo Dashboard", 
                            desc: "Visualiza tus métricas clave en tiempo real con nuestro nuevo panel rediseñado.", 
                            icon: <FaChartLine className="text-4xl text-white" />,
                            bgIcon: "bg-secondary"
                        },
                        { 
                            title: "Seguridad Mejorada", 
                            desc: "Implementamos autenticación de dos factores para proteger tu cuenta.", 
                            icon: <FaShieldAlt className="text-4xl text-white" />,
                            bgIcon: "bg-dark"
                        },
                        { 
                            title: "Más Rápido", 
                            desc: "Optimización de base de datos para cargas instantáneas.", 
                            icon: <FaRocket className="text-4xl text-white" />,
                            bgIcon: "bg-primary"
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className="p-8 rounded-3xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-start text-left group overflow-hidden relative"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${item.bgIcon} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                {item.icon}
                            </div>
                            
                            <h3 className="font-display text-2xl font-bold mb-4 text-dark group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            
                            <p className="text-gray-600 text-base leading-relaxed z-10 relative">
                                {item.desc}
                            </p>
                            
                            {/* Decorative element */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full z-0 group-hover:bg-primary/5 transition-colors"></div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}