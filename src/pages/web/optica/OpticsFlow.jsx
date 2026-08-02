import { motion } from "framer-motion";
import { FaArrowRight, FaUser, FaEye, FaShoppingCart, FaClipboardList, FaFlask, FaCheckCircle } from "react-icons/fa";

const STEPS = [
    { icon: FaUser, label: "Cliente" },
    { icon: FaEye, label: "Receta" },
    { icon: FaShoppingCart, label: "Venta" },
    { icon: FaClipboardList, label: "OT" },
    { icon: FaFlask, label: "Lab" },
    { icon: FaCheckCircle, label: "Entrega" },
];

export default function OpticsFlow() {
    return (
        <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-emerald-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    className="max-w-2xl mb-14 md:mb-16"
                >
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark tracking-tight mb-4">
                        Del cliente a la entrega
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        Un solo recorrido: sin planillas sueltas ni estados perdidos entre venta y laboratorio.
                    </p>
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2 md:gap-0">
                    {STEPS.map(({ icon: Icon, label }, i) => (
                        <div key={label} className="flex items-center gap-2 sm:gap-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex flex-col items-center gap-2.5 min-w-[4.5rem] sm:min-w-[5.5rem]"
                            >
                                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white text-secondary shadow-md shadow-slate-200/80 border border-slate-100">
                                    <Icon className="text-2xl sm:text-[1.65rem]" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-dark font-display">
                                    {label}
                                </span>
                            </motion.div>
                            {i < STEPS.length - 1 && (
                                <FaArrowRight
                                    className="hidden sm:block text-primary/70 mx-1 md:mx-2 shrink-0"
                                    aria-hidden
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
