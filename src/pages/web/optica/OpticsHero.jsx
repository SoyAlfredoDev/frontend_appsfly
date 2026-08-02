import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { OPTICS_PROMO_REGISTER_TO } from "../../../utils/opticsPromoHost.js";
import { SUPPORT_WHATSAPP_URL } from "../../../constants/supportContact.js";

const WHATSAPP_INFO_URL = `${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent(
    "Hola, quiero información sobre AppsFly para mi óptica.",
)}`;

export default function OpticsHero() {
    return (
        <section className="relative min-h-[calc(100dvh-5rem)] flex flex-col overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/businesses/optica.jpg')" }}
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-gradient-to-r from-dark/92 via-dark/78 to-dark/45"
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-dark/30"
                aria-hidden
            />

            <div className="relative z-10 flex flex-1 items-center px-4 sm:px-6 lg:px-12 py-16 md:py-24">
                <div className="w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <p className="font-display text-primary text-lg sm:text-xl font-semibold tracking-wide mb-4">
                            AppsFly Óptica
                        </p>

                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
                            El sistema pensado para tu óptica
                        </h1>

                        <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed mb-10 max-w-xl">
                            Recetas, ventas, órdenes de trabajo, laboratorios e inventario en un solo
                            lugar. Prueba gratis o pide información sin compromiso.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link
                                    to={OPTICS_PROMO_REGISTER_TO}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/30 hover:bg-[#00b067] transition-colors"
                                >
                                    Probar 2 meses gratis
                                    <FaArrowRight />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <a
                                    href={WHATSAPP_INFO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-white/35 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/55 transition-colors"
                                >
                                    Solicitar información
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
