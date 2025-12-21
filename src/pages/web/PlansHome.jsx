import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
export default function PlansHome(){
    return(
           <section className="py-20 md:py-32 bg-white font-sans">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-dark font-display mb-4">Planes Flexibles</h2>
                        <p className="text-gray-500 text-lg">Escala tu negocio con el plan perfecto para ti</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Básico", price: "$0", features: ["1 Usuario", "100 Productos", "Soporte Básico"] },
                            { name: "Pro", price: "$29", features: ["5 Usuarios", "Ilimitados Productos", "Soporte Prioritario", "Analíticas Avanzadas"], recommended: true },
                            { name: "Enterprise", price: "Custom", features: ["Usuarios Ilimitados", "API Access", "Gerente de Cuenta", "SLA Garantizado"] }
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                whileHover={{ y: -10 }}
                                className={`relative p-8 md:p-10 rounded-3xl transition-all duration-300 flex flex-col ${
                                    plan.recommended 
                                        ? 'bg-white shadow-2xl shadow-blue-900/10 border-2 border-primary scale-105 z-10' 
                                        : 'bg-surface border border-transparent hover:border-gray-200 hover:shadow-xl'
                                }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/30 uppercase tracking-wide">
                                        Recomendado
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-4 font-display text-dark">{plan.name}</h3>
                                <div className={`text-4xl md:text-5xl font-extrabold mb-8 ${plan.recommended ? 'text-primary' : 'text-dark'}`}>
                                    {plan.price}
                                </div>
                                <ul className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600">
                                            <FaCheckCircle className={`${plan.recommended ? 'text-primary' : 'text-gray-400'}`} /> 
                                            <span className="font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-md ${
                                    plan.recommended 
                                        ? 'bg-primary text-white hover:bg-green-600 shadow-primary/30' 
                                        : 'bg-white text-dark border border-gray-200 hover:border-dark hover:text-white hover:bg-dark'
                                }`}>
                                    Elegir Plan
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
    )
}