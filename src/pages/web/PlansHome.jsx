import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export default function PlansHome() {
    const plans = [
        {
            name: "Básico",
            promoPrice: 0,
            regularPrice: 9990,
            duration: "2 meses",
            features: [
                "Hasta 5 usuarios",
                "Módulo de Compras y Ventas",
                "Control de Inventario",
                "Reportes Inteligentes",
                "Soporte Prioritario 24/7"
            ],
            recommended: true 
        }
    ];

    const MotionLink = motion(Link);

    return (
        <section className="py-12 md:py-10 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#021f41] font-display mb-3">
                        Planes Flexibles
                    </h2>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        Escala tu negocio con el plan perfecto para ti.
                    </p>
                </div>

                <div className="flex justify-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`relative w-full max-w-[380px] p-8 rounded-[2rem] flex flex-col transition-all duration-300 ${
                                plan.recommended 
                                    ? 'bg-white shadow-[0_15px_40px_rgba(1,198,118,0.12)] border-2 border-[#01c676]' 
                                    : 'bg-slate-50 border border-gray-100'
                            }`}
                        >
                            {/* Badge más discreto */}
                            {plan.recommended && (
                                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#01c676] text-white px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                                    Recomendado
                                </div>
                            )}

                            {/* Header: Compacto */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold font-display text-[#021f41]">{plan.name}</h3>
                                <p className="text-gray-400 text-xs">Ideal para pequeñas empresas</p>
                            </div>

                            {/* Precio: Reducido de 6xl a 5xl y márgenes ajustados */}
                            <div className="mb-6 border-b border-gray-50 pb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-[#01c676] tracking-tighter font-display">
                                        ${plan.promoPrice}
                                    </span>
                                    <span className="text-gray-400 text-sm font-medium">/mes</span>
                                </div>
                                <div className="mt-2 inline-flex items-center bg-[#094fd1]/5 px-2 py-0.5 rounded-md">
                                    <span className="text-[10px] text-[#094fd1] font-bold uppercase">
                                        Oferta {plan.duration}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-[11px] mt-1 italic">
                                    Luego ${plan.regularPrice.toLocaleString("es-CL")} mensual
                                </p>
                            </div>

                            {/* Features: space-y-3 en lugar de 5 */}
                            <ul className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[#021f41]/90">
                                        <FaCheckCircle className="text-[#01c676] text-base flex-shrink-0" /> 
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Botón: py-3.5 es el "sweet spot" para SaaS */}
                            <MotionLink 
                                to="/register"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-3.5 rounded-xl font-bold text-center flex justify-center items-center transition-all font-display tracking-wide text-sm ${
                                    plan.recommended 
                                        ? 'bg-[#01c676] text-white shadow-lg shadow-[#01c676]/20 hover:bg-[#01b069]' 
                                        : 'bg-[#021f41] text-white hover:bg-[#032d5e]'
                                }`}
                            >
                                Empezar Ahora
                            </MotionLink>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}