import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { OPTICS_PROMO_REGISTER_TO } from "../../../utils/opticsPromoHost.js";
import { SUPPORT_WHATSAPP_URL } from "../../../constants/supportContact.js";

const WHATSAPP_INFO_URL = `${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent(
    "Hola, quiero información sobre AppsFly para mi óptica.",
)}`;

export default function OpticsFinalCta() {
    return (
        <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-white to-sky-50/60">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                >
                    <p className="font-display text-primary font-semibold mb-3 tracking-wide">
                        AppsFly Óptica
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark tracking-tight mb-5">
                        Empieza hoy con tu óptica
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                        Regístrate y prueba 2 meses gratis, o escríbenos por WhatsApp si prefieres
                        una demo o resolver dudas antes.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to={OPTICS_PROMO_REGISTER_TO}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/25 hover:bg-[#00b067] transition-colors"
                            >
                                Crear cuenta gratis
                                <FaArrowRight />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <a
                                href={WHATSAPP_INFO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-3.5 text-base font-bold text-dark hover:border-secondary hover:text-secondary transition-colors"
                            >
                                Hablar por WhatsApp
                            </a>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
