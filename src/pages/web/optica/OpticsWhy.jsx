import { motion } from "framer-motion";
import {
    FaBoxes,
    FaClipboardCheck,
    FaMobileAlt,
    FaWhatsapp,
} from "react-icons/fa";

const BENEFITS = [
    {
        icon: FaBoxes,
        title: "Control de lentes y armazones",
        text: "Stock claro por categoría de óptica, sin sorpresas en el mostrador.",
    },
    {
        icon: FaClipboardCheck,
        title: "Estado de cada OT",
        text: "Sabes qué está en lab, qué llegó y qué falta por entregar.",
    },
    {
        icon: FaWhatsapp,
        title: "Avisos por WhatsApp",
        text: "Mantén al cliente informado cuando el pedido esté listo.",
    },
    {
        icon: FaMobileAlt,
        title: "Computador, tablet o teléfono",
        text: "Trabaja en caja, taller o en terreno con la misma cuenta.",
    },
];

export default function OpticsWhy() {
    return (
        <section className="py-20 md:py-28 bg-dark text-white relative overflow-hidden">
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-[40rem] rounded-full bg-primary/15 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
                aria-hidden
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    className="max-w-2xl mb-14 md:mb-16"
                >
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                        Por qué AppsFly para tu óptica
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                        Menos fricción operativa. Más control sobre lo que importa en el día a día.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-10 lg:gap-14">
                    {BENEFITS.map(({ icon: Icon, title, text }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.07 }}
                            className="flex gap-4"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary">
                                <Icon className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
                                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                    {text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
