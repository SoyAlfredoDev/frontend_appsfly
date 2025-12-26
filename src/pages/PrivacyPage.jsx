import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp,    FaDatabase, FaUserShield, FaLock, FaSync, FaServer } from 'react-icons/fa';
import NavbarHome from './web/NavbarHome.jsx';
import Footer from '../components/FooterComponent';

const PrivacyPage = () => {
    const [activeSection, setActiveSection] = useState('isolation');

    const sections = [
        { id: 'isolation', title: 'Arquitectura de Aislamiento', icon: <FaDatabase /> },
        { id: 'data', title: 'Recopilación de Datos', icon: <FaUserShield /> },
        { id: 'security', title: 'Seguridad y Conexión', icon: <FaLock /> },
        { id: 'backups', title: 'Copias de Seguridad', icon: <FaServer /> },
        { id: 'updates', title: 'Mejora Continua', icon: <FaSync /> },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    // Update active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150; // Offset for sticky header

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="font-sans text-gray-600 bg-white min-h-screen selection:bg-[#01c676] selection:text-white">
            {/* Header / Navbar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <NavbarHome />
            </div>

            <main className="relative">
                {/* Hero Section */}
                <section className="pt-20 pb-16 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
                         <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#01c676] rounded-full blur-[120px]"></div>
                         <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#094fd1] rounded-full blur-[120px]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <motion.h1 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-display font-bold text-[#021f41] mb-6 tracking-tight"
                            style={{ fontFamily: '"Chillax", sans-serif' }}
                        >
                            Política de <span className="text-[#01c676]">Privacidad</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto"
                        >
                            Transparencia total sobre cómo protegemos, aislamos y gestionamos tus datos.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 inline-block px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-500"
                        >
                            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </motion.div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sidebar Navigation (Sticky) */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-32 space-y-2">
                                <h3 className="text-[#021f41] font-bold mb-4 px-4 text-lg">Índice</h3>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 group ${
                                            activeSection === section.id 
                                            ? 'bg-[#01c676]/10 text-[#01c676] border-l-4 border-[#01c676]' 
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#01c676]'
                                        }`}
                                    >
                                        <span className={`text-lg ${activeSection === section.id ? 'text-[#01c676]' : 'text-gray-400 group-hover:text-[#01c676]'}`}>
                                            {section.icon}
                                        </span>
                                        <span className="font-medium text-sm">{section.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-9 space-y-16">
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-16"
                            >
                                {/* Clause 1: Arquitectura de Aislamiento */}
                                <motion.section id="isolation" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-[#094fd1]/10 text-[#094fd1]">
                                            <FaDatabase className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">1. Arquitectura de Aislamiento</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-[#094fd1] to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#094fd1]/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600 mb-4">
                                            En AppsFly, la seguridad no es una opción, es la base de nuestra arquitectura. Utilizamos un modelo de <strong>"Base de datos por inquilino" (Database-per-tenant)</strong>.
                                        </p>
                                        <div className="bg-blue-50 border-l-4 border-[#094fd1] p-4 rounded-r-lg mb-4">
                                            <p className="text-[#021f41] text-sm font-medium">
                                                Esto significa que tus datos de negocio (Ventas, Inventario, Clientes, etc.) están almacenados en una base de datos <strong>físicamente separada y aislada</strong> de la de otros suscriptores.
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            Esta separación garantiza que es técnicamente imposible que un inquilino acceda a los datos de otro, proporcionando el máximo nivel de privacidad y seguridad disponible en entornos SaaS.
                                        </p>
                                    </div>
                                </motion.section>

                                {/* Clause 2: Recopilación de Datos */}
                                <motion.section id="data" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-[#01c676]/10 text-[#01c676]">
                                            <FaUserShield className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">2. Recopilación y Propiedad</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-[#01c676] to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#01c676]/30 transition-colors">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-[#021f41] font-bold mb-2 text-lg">Datos de Cuenta (Globales)</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    AppsFly solo almacena en su base central los datos estrictamente necesarios para la gestión de tu suscripción: correo electrónico de registro, nombre de la empresa y estado de facturación.
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-[#021f41] font-bold mb-2 text-lg">Datos de Negocio (Privados)</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Toda la información operativa que cargas en el sistema (tus productos, tus ventas, tus clientes) <strong>te pertenece exclusivamente a ti</strong>. AppsFly actúa como custodio y procesador, pero no reclama propiedad sobre ellos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Clause 3: Seguridad y Conexión */}
                                <motion.section id="security" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                            <FaLock className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">3. Seguridad y Conexión</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                                        <ul className="space-y-4 text-gray-600">
                                            <li className="flex items-start gap-3">
                                                <span className="mt-1 text-purple-500">✓</span>
                                                <span><strong>Encriptación en Tránsito:</strong> Todas las comunicaciones entre tu navegador y nuestros servidores están encriptadas mediante SSL/TLS (HTTPS).</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="mt-1 text-purple-500">✓</span>
                                                <span><strong>Autenticación Robusta:</strong> Utilizamos JSON Web Tokens (JWT) para asegurar las sesiones y validar cada petición.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="mt-1 text-purple-500">✓</span>
                                                <span><strong>Conexiones Dinámicas:</strong> El sistema gestiona conexiones dinámicas a las bases de datos de inquilinos, asegurando que cada petición se enrute estrictamente a tu base de datos aislada.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </motion.section>

                                {/* Clause 4: Copias de Seguridad */}
                                <motion.section id="backups" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                            <FaServer className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">4. Copias de Seguridad y Responsabilidad</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600 mb-4">
                                            Realizamos <strong>copias de seguridad (Backups) diariamente</strong> de manera automática para salvaguardar la integridad de tus datos ante fallos catastróficos del servidor.
                                        </p>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Sin embargo, en concordancia con nuestros Términos y Condiciones, el usuario acepta el servicio "tal cual" (as-is). AppsFly no se hace responsable por pérdidas fortuitas de información, errores humanos del usuario al borrar datos, o causas de fuerza mayor.
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Recomendamos encarecidamente exportar reportes periódicos de tu información crítica.
                                        </p>
                                    </div>
                                </motion.section>

                                {/* Clause 5: Mejora Continua */}
                                <motion.section id="updates" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
                                            <FaSync className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">5. Actualizaciones de la Política</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-teal-500/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600">
                                            AppsFly es un software en <strong>mejora continua</strong>. A medida que añadimos nuevas funcionalidades y módulos, esta política de privacidad puede ser actualizada para reflejar los nuevos tratamientos de datos.
                                        </p>
                                        <p className="mt-4 text-gray-500 text-sm">
                                            Te notificaremos sobre cambios significativos, pero es responsabilidad del usuario revisar periódicamente esta página para estar informado.
                                        </p>
                                    </div>
                                </motion.section>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Floating WhatsApp */}
            <motion.a
                href="https://wa.me/1234567890" 
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors z-50 flex items-center justify-center"
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

export default PrivacyPage;
