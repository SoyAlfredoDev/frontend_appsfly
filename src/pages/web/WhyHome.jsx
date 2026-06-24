import { motion } from 'framer-motion';
import {
    FaCheckCircle,
    FaDesktop,
    FaMobileAlt,
    FaShieldAlt,
    FaSync,
    FaTabletAlt,
    FaHeadset,
} from 'react-icons/fa';
import GradientText from '../../components/web/GradientText.jsx';

const BENEFITS = [
    {
        icon: FaCheckCircle,
        text: 'Interfaz clara para registrar ventas sin complicaciones',
    },
    {
        icon: FaHeadset,
        text: 'Soporte técnico cuando lo necesitas',
    },
    {
        icon: FaSync,
        text: 'Actualizaciones constantes sin costo extra',
    },
    {
        icon: FaShieldAlt,
        text: 'Tus datos seguros y respaldados en la nube',
    },
];

const DEVICES = [
    { icon: FaDesktop, label: 'Computador', hint: 'Oficina y caja' },
    { icon: FaMobileAlt, label: 'Teléfono', hint: 'Ventas en terreno' },
    { icon: FaTabletAlt, label: 'Tablet', hint: 'Mostrador y bodega' },
];

function DeviceShowcase() {
    return (
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent blur-2xl" />

            {/* Laptop */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10 mx-auto w-full max-w-md"
            >
                <div className="rounded-t-xl border border-white/15 bg-slate-800/90 p-2 shadow-2xl">
                    <div className="mb-2 flex items-center gap-1.5 px-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
                        <img
                            src="/hero/imagen-hero-02.png"
                            alt="AppsFly en computador"
                            className="h-44 w-full object-cover object-top sm:h-52"
                        />
                    </div>
                </div>
                <div className="mx-auto h-2 w-[88%] rounded-b-md bg-slate-700/80" />
                <div className="mx-auto h-1 w-24 rounded-full bg-slate-600/80" />
            </motion.div>

            {/* Phone */}
            <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="absolute -bottom-4 -left-2 z-20 w-[34%] max-w-[130px] sm:-left-4 sm:max-w-[150px]"
            >
                <div className="rounded-[1.4rem] border-2 border-white/20 bg-slate-900 p-1.5 shadow-xl shadow-black/40">
                    <div className="overflow-hidden rounded-[1.1rem] border border-white/10">
                        <img
                            src="/hero/imagen-hero-03.png"
                            alt="AppsFly en teléfono"
                            className="aspect-[9/16] w-full object-cover object-top"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Tablet */}
            <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="absolute -bottom-2 -right-2 z-20 w-[42%] max-w-[170px] sm:-right-4 sm:max-w-[190px]"
            >
                <div className="rounded-xl border-2 border-white/20 bg-slate-900 p-1.5 shadow-xl shadow-black/40">
                    <div className="overflow-hidden rounded-lg border border-white/10">
                        <img
                            src="/hero/productos-servicios-listado.png"
                            alt="AppsFly en tablet"
                            className="aspect-[4/3] w-full object-cover object-top"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function WhyHome() {
    return (
        <section className="relative overflow-hidden bg-dark py-16 md:py-28 font-sans text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-dark via-[#011a35] to-[#001226]" />
            <div className="pointer-events-none absolute top-0 right-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="text-center lg:text-left"
                    >
                        <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                            ⭐ Hecho para tu día a día
                        </span>

                        <h2 className="mb-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                            💡 ¿Por qué elegir{' '}
                            <GradientText variant="onDark">AppsFly</GradientText>?
                        </h2>

                        <p className="mb-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg mx-auto lg:mx-0">
                            Porque registrar tus ventas no debería ser complicado. AppsFly te
                            acompaña en el mostrador, en la bodega o en la calle — desde el
                            dispositivo que tengas a mano.
                        </p>

                        <p className="mb-8 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base mx-auto lg:mx-0">
                            Usa AppsFly en <strong className="font-semibold text-slate-200">computador</strong>,{' '}
                            <strong className="font-semibold text-slate-200">teléfono</strong> o{' '}
                            <strong className="font-semibold text-slate-200">tablet</strong>.
                            La misma información, sincronizada y lista para cuando la necesites.
                        </p>

                        {/* Dispositivos */}
                        <div className="mb-10 flex flex-wrap justify-center gap-3 lg:justify-start">
                            {DEVICES.map(({ icon: Icon, label, hint }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                                        <Icon className="text-lg" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">{label}</p>
                                        <p className="text-xs text-slate-400">{hint}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <ul className="space-y-4 text-left max-w-xl mx-auto lg:mx-0">
                            {BENEFITS.map(({ icon: Icon, text }, i) => (
                                <motion.li
                                    key={text}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.08 }}
                                    className="group flex items-start gap-3"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        <Icon className="text-sm" />
                                    </div>
                                    <span className="text-sm font-medium leading-relaxed text-slate-200 sm:text-base">
                                        {text}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]"
                    >
                        <DeviceShowcase />

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 text-center text-xs font-medium uppercase tracking-wider text-slate-500 lg:text-left"
                        >
                            Mismo sistema · cualquier pantalla
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
