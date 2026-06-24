import { motion } from 'framer-motion';
import { FaCashRegister, FaMoneyBillWave, FaShoppingCart, FaStore } from 'react-icons/fa';
import BusinessGallery from './BusinessGallery.jsx';
import GradientText from '../../components/web/GradientText.jsx';

const HIGHLIGHTS = [
    {
        icon: FaCashRegister,
        text: 'Registra cada venta en pocos pasos, sin papeles ni planillas',
    },
    {
        icon: FaShoppingCart,
        text: 'Agrega productos o servicios y deja anotado lo que vendiste',
    },
    {
        icon: FaMoneyBillWave,
        text: 'Marca cómo pagó el cliente: efectivo, tarjeta, transferencia y más',
    },
    {
        icon: FaStore,
        text: 'Para emprendedores, mini markets, restaurantes y comercios locales',
    },
];

const INDUSTRIES = ['Ópticas', 'Emprendedores', 'Mini market', 'Restaurantes', 'Comercio'];

export default function WhatIsAppsFlyHome() {
    return (
        <section className="py-16 md:py-28 bg-white font-sans overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Galería — izquierda en desktop, abajo en móvil */}
                    <motion.div
                        initial={{ opacity: 0, x: -32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-2 lg:order-1"
                    >
                        <BusinessGallery />
                    </motion.div>

                    {/* Contenido — derecha en desktop, arriba en móvil */}
                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="order-1 lg:order-2 text-center lg:text-left"
                    >
                        <span className="inline-block bg-blue-50 text-secondary border border-blue-100 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-5">
                            🛒 Sistema para registrar ventas
                        </span>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-tight mb-5">
                            🏪 ¿Qué es{' '}
                            <GradientText>AppsFly</GradientText>
                            ?
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                            AppsFly es un sistema de venta pensado para que registres lo que vendes
                            de forma rápida y ordenada. Cada vez que atiendes a un cliente, dejas
                            la venta guardada: qué vendiste, cuánto cobraste y cómo pagó.
                        </p>

                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            No necesitas ser experto en tecnología. Si vendes todos los días —en una
                            óptica, un mini market, un restaurante o tu propio emprendimiento— AppsFly
                            te ayuda a llevar el registro de tus ventas sin complicaciones.
                        </p>

                        <ul className="space-y-4 mb-8 text-left max-w-xl mx-auto lg:mx-0">
                            {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
                                <motion.li
                                    key={text}
                                    initial={{ opacity: 0, x: 16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.5 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="text-sm" />
                                    </span>
                                    <span className="text-gray-700 text-sm sm:text-base pt-1.5">{text}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {INDUSTRIES.map((industry) => (
                                <span
                                    key={industry}
                                    className="rounded-full border border-slate-200 bg-surface px-3 py-1 text-xs font-semibold text-slate-600"
                                >
                                    {industry}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
