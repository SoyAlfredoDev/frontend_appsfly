import { motion } from 'framer-motion';
import { FaCheckDouble, FaWhatsapp } from 'react-icons/fa';

const NOTIFICATIONS = [
    {
        type: 'Compra',
        time: '10:32',
        text: '¡Gracias por tu compra, María! Tu pedido #1842 quedó registrado en Óptica Visión.',
        delay: 0.15,
    },
    {
        type: 'Cumpleaños',
        time: '09:00',
        text: 'Feliz cumpleaños, Carlos. Tenemos un 15% de descuento especial para ti esta semana.',
        delay: 0.35,
    },
    {
        type: 'Adeudado',
        time: '11:15',
        text: 'Hola Ana, te recordamos que tienes $24.500 pendientes de pago. ¿Necesitas ayuda?',
        delay: 0.55,
    },
    {
        type: 'Pedido listo',
        time: '16:40',
        text: 'Tu pedido ya está listo para retirar. Te esperamos en local hasta las 19:00 hrs.',
        delay: 0.75,
    },
];

function MessageCard({ item }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: item.delay, duration: 0.45, ease: 'easeOut' }}
            className="rounded-xl rounded-tl-sm bg-[#dcf8c6] px-3 py-2.5 text-[13px] leading-snug text-slate-800 shadow-sm"
        >
            <p>{item.text}</p>
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                <span>{item.time}</span>
                <FaCheckDouble className="text-[10px] text-sky-500" />
            </div>
        </motion.div>
    );
}

export default function WhatsAppNotificationsPreview() {
    return (
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#25D366]/15 via-transparent to-primary/10 blur-2xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
            >
                {/* Barra superior tipo teléfono */}
                <div className="bg-[#075E54] px-4 py-3.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                        <FaWhatsapp className="text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">Tu negocio</p>
                        <p className="text-xs text-emerald-100">Notificaciones automáticas</p>
                    </div>
                </div>

                {/* Fondo chat */}
                <div
                    className="space-y-3 px-3 py-5 min-h-[300px] sm:min-h-[340px]"
                    style={{
                        backgroundColor: '#e5ddd5',
                        backgroundImage:
                            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 45%)',
                    }}
                >
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="mx-auto w-fit rounded-lg bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm"
                    >
                        Hoy
                    </motion.p>

                    {NOTIFICATIONS.map((item, i) => (
                        <div key={i} className="flex justify-end pl-8">
                            <MessageCard item={item} />
                        </div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.95 }}
                        className="flex justify-end pl-12"
                    >
                        <div className="rounded-xl rounded-tl-sm bg-[#dcf8c6] px-3 py-2 text-[13px] text-slate-800 shadow-sm">
                            Campaña: clientes que no compraron en 6 meses — cupón exclusivo
                            <div className="mt-1 flex justify-end">
                                <span className="text-[10px] text-slate-500">18:00</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
