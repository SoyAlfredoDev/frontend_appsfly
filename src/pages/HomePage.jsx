import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaCheckCircle, FaRocket, FaChartLine, FaShieldAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { subscribeNewsletter } from '../api/newsletter';

const HomePage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            await subscribeNewsletter(email);
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 overflow-x-hidden">
            {/* Header / Navbar */}
            <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    AppsFly
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2 rounded-full text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="px-6 py-2 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-transform hover:scale-105">
                        Registro
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="text-center py-20 px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900">
                        Automatiza tu negocio <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            sin complicaciones.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Control de inventario, ventas y reportes en una sola plataforma. 
                        Diseñado para crecer contigo.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
                            Empezar ahora <FaArrowRight />
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all">
                            Ver Demo
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* News / Updates Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-center mb-12"
                    >
                        Novedades del Sistema
                    </motion.h2>
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            { title: "Nuevo Dashboard", desc: "Visualiza tus métricas clave en tiempo real con nuestro nuevo panel rediseñado.", icon: <FaChartLine className="text-4xl text-blue-500 mb-4" /> },
                            { title: "Seguridad Mejorada", desc: "Implementamos autenticación de dos factores para proteger tu cuenta.", icon: <FaShieldAlt className="text-4xl text-purple-500 mb-4" /> },
                            { title: "Más Rápido", desc: "Optimización de base de datos para cargas instantáneas.", icon: <FaRocket className="text-4xl text-green-500 mb-4" /> }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                variants={fadeInUp}
                                className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100"
                            >
                                {item.icon}
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why AppsFly Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6">¿Por qué elegir AppsFly?</h2>
                            <p className="text-gray-400 mb-8 text-lg">
                                No somos solo un software, somos tu socio tecnológico. 
                                Simplificamos lo complejo para que te enfoques en vender.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Interfaz intuitiva y fácil de usar",
                                    "Soporte técnico 24/7",
                                    "Actualizaciones constantes sin costo extra",
                                    "Seguridad de datos de nivel empresarial"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-gray-800 rounded-3xl p-8 border border-gray-700"
                        >
                            {/* Abstract UI representation */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-80"></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-20 bg-gray-700 rounded-xl"></div>
                                    <div className="h-20 bg-gray-700 rounded-xl"></div>
                                    <div className="h-20 bg-gray-700 rounded-xl"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-16">Planes Flexibles</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Básico", price: "$0", features: ["1 Usuario", "100 Productos", "Soporte Básico"] },
                            { name: "Pro", price: "$29", features: ["5 Usuarios", "Ilimitados Productos", "Soporte Prioritario", "Analíticas Avanzadas"], recommended: true },
                            { name: "Enterprise", price: "Custom", features: ["Usuarios Ilimitados", "API Access", "Gerente de Cuenta", "SLA Garantizado"] }
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-8 rounded-3xl bg-white border ${plan.recommended ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} shadow-sm hover:shadow-xl transition-all`}
                            >
                                {plan.recommended && (
                                    <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        Recomendado
                                    </span>
                                )}
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-extrabold mb-6">{plan.price}</div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                            <FaCheckCircle className="text-green-500" /> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                    Elegir Plan
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 p-12 rounded-3xl"
                    >
                        <FaEnvelope className="text-5xl text-blue-600 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4">Mantente actualizado</h2>
                        <p className="text-gray-600 mb-8">Recibe las últimas noticias, actualizaciones y tips para potenciar tu negocio.</p>
                        
                        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={status === 'loading' || status === 'success'}
                                className={`px-8 py-3 rounded-full font-bold text-white transition-all ${status === 'success' ? 'bg-green-500' : 'bg-black hover:bg-gray-800'}`}
                            >
                                {status === 'loading' ? 'Enviando...' : status === 'success' ? '¡Suscrito!' : 'Suscribirse'}
                            </button>
                        </form>
                        {status === 'error' && <p className="text-red-500 mt-4">Hubo un error al suscribirse. Inténtalo de nuevo.</p>}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AppsFly. Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* Floating WhatsApp */}
            <motion.a
                href="https://wa.me/1234567890" // Replace with actual number
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <FaWhatsapp className="text-3xl" />
            </motion.a>
        </div>
    );
};

export default HomePage;
