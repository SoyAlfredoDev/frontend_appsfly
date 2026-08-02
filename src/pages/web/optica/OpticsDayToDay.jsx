import { motion } from "framer-motion";
import {
    FaClipboardList,
    FaEye,
    FaFlask,
    FaGlasses,
    FaFileInvoice,
    FaBoxes,
} from "react-icons/fa";

const ITEMS = [
    {
        icon: FaEye,
        title: "Recetas OD / OI",
        text: "Registra y consulta la graduación de cada cliente junto a su historial.",
    },
    {
        icon: FaGlasses,
        title: "Ventas con receta",
        text: "Vincula la venta al paciente y a la Rx para un seguimiento limpio.",
    },
    {
        icon: FaClipboardList,
        title: "Órdenes de trabajo",
        text: "Genera OT desde la venta y sigue el estado hasta la entrega.",
    },
    {
        icon: FaFlask,
        title: "Laboratorios",
        text: "Despachos a lab, recepción y control de lo que está en proceso.",
    },
    {
        icon: FaFileInvoice,
        title: "Certificados de compra",
        text: "Documentos listos para imprimir asociados a la venta.",
    },
    {
        icon: FaBoxes,
        title: "Inventario de óptica",
        text: "Armazones, lentes, contactología y accesorios con stock al día.",
    },
];

export default function OpticsDayToDay() {
    return (
        <section className="py-20 md:py-28 bg-white relative overflow-hidden">
            <div
                className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl"
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
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark tracking-tight mb-4">
                        El día a día de tu óptica
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        Todo lo que usas en el mostrador y el taller, conectado en un flujo único.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                    {ITEMS.map(({ icon: Icon, title, text }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                                <Icon className="text-xl" />
                            </div>
                            <h3 className="font-display text-xl font-semibold text-dark mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                {text}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
