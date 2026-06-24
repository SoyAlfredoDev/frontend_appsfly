import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

import { SUPPORT_WHATSAPP_PHONE } from '../../constants/supportContact.js';

export default function FloatingWhatsApp({
    phone = SUPPORT_WHATSAPP_PHONE,
    className = '',
}) {
    const href = `https://wa.me/${phone.replace(/\D/g, '')}`;

    return (
        <div
            className={`group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 ${className}`}
        >
            {/* Anillos de pulso */}
            <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/50"
                animate={{ scale: [1, 1.55, 1.55], opacity: [0.45, 0, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/35"
                animate={{ scale: [1, 1.35, 1.35], opacity: [0.35, 0, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.55 }}
            />

            <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#1da851] text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] ring-4 ring-white/90"
                initial={{ opacity: 0, scale: 0.6, y: 40 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -5, 0],
                }}
                transition={{
                    opacity: { delay: 0.8, duration: 0.4 },
                    scale: { delay: 0.8, type: 'spring', stiffness: 260, damping: 18 },
                    y: {
                        delay: 1.2,
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    },
                }}
                whileHover={{
                    scale: 1.1,
                    boxShadow: '0 12px 32px rgba(37, 211, 102, 0.55)',
                }}
                whileTap={{ scale: 0.92 }}
            >
                <motion.span
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 4.5,
                        ease: 'easeInOut',
                    }}
                    className="flex items-center justify-center"
                >
                    <FaWhatsapp className="text-3xl md:text-[2rem]" />
                </motion.span>
            </motion.a>

            {/* Tooltip al pasar el mouse — solo desktop */}
            <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1 md:block">
                ¿Necesitas ayuda?
            </span>
        </div>
    );
}
