import { FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
export default function WhyHome(){
    return(
        <section className="py-20 md:py-32 bg-dark text-white font-sans overflow-hidden relative">
            {/* Background Grain/Noise/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark to-[#001226] z-0"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 font-display leading-tight">
                            ¿Por qué elegir <span className="text-primary relative inline-block">
                                AppsFly
                                {/* Underline decoration */}
                                <svg className="absolute w-full h-3 bottom-1 left-0 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"> 
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /> 
                                </svg>
                            </span>?
                        </h2>
                        <p className="text-gray-300 mb-10 text-lg md:text-xl leading-relaxed">
                            No somos solo un software, somos tu socio tecnológico. 
                            Simplificamos lo complejo para que te enfoques en vender.
                        </p>
                        <ul className="space-y-6">
                            {[
                                "Interfaz intuitiva y fácil de usar",
                                "Soporte técnico 24/7",
                                "Actualizaciones constantes sin costo extra",
                                "Seguridad de datos de nivel empresarial"
                            ].map((item, i) => (
                                    <motion.li 
                                        key={i} 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="bg-primary/20 p-2 rounded-full group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                            <FaCheckCircle className="text-primary text-xl group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="font-medium text-lg text-gray-200 group-hover:text-white transition-colors">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.02, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            {/* Inner Highlight */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                <div className="h-48 bg-gradient-to-tr from-secondary to-primary rounded-2xl opacity-90 shadow-lg transform transition-transform hover:scale-[1.02]"></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"></div>
                                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"></div>
                                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"></div>
                                </div>
                            </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}