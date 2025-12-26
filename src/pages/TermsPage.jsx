import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaLinkedin, FaShieldAlt, FaServer, FaBan, FaClock, FaCopyright } from 'react-icons/fa';
import Footer from '../components/FooterComponent';
import NavbarHome from './web/NavbarHome.jsx';

const TermsPage = () => {
    const [activeSection, setActiveSection] = useState('nature');

    const sections = [
        { id: 'nature', title: 'Naturaleza del Servicio', icon: <FaServer /> },
        { id: 'liability', title: 'Limitación de Responsabilidad', icon: <FaShieldAlt /> },
        { id: 'usage', title: 'Uso Aceptable', icon: <FaBan /> },
        { id: 'availability', title: 'Disponibilidad', icon: <FaClock /> },
        { id: 'ip', title: 'Propiedad Intelectual', icon: <FaCopyright /> },
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
                            Términos y <span className="text-[#01c676]">Condiciones</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto"
                        >
                            Por favor, lee detenidamente estos términos antes de utilizar nuestros servicios.
                            Tu confianza y seguridad son nuestra prioridad.
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
                                {/* Clause 1: Naturaleza del Servicio */}
                                <motion.section id="nature" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-[#094fd1]/10 text-[#094fd1]">
                                            <FaServer className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">1. Naturaleza del Servicio</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-[#01c676] to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#01c676]/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600">
                                            AppsFly es una plataforma <strong>SaaS B2B (Software as a Service Business-to-Business)</strong> en constante evolución y desarrollo. 
                                            Al contratar o utilizar nuestros servicios, el usuario reconoce y acepta que el sistema no es un producto estático y finalizado.
                                        </p>
                                        <ul className="mt-4 space-y-3 list-disc list-inside text-gray-500">
                                            <li>Recibirá actualizaciones periódicas automáticas.</li>
                                            <li>Se implementarán mejoras de seguridad y rendimiento.</li>
                                            <li>Podrán ocurrir cambios en la funcionalidad o interfaz sin previo aviso con el objetivo de mejorar la experiencia global.</li>
                                        </ul>
                                    </div>
                                </motion.section>

                                {/* Clause 2: Limitación de Responsabilidad */}
                                <motion.section id="liability" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                                            <FaShieldAlt className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">2. Limitación de Responsabilidad</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-red-500/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600 mb-4">
                                            En AppsFly nos tomamos la seguridad de los datos muy en serio. Realizamos <strong>copias de seguridad (Backups) diariamente</strong> de manera automática para proteger la integridad de la información.
                                        </p>
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                            <p className="text-red-700 text-sm font-medium">
                                                Sin embargo, AppsFly <strong>NO se hace responsable</strong> por la pérdida de información, lucro cesante, interrupción de negocio o daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma.
                                            </p>
                                        </div>
                                        <p className="mt-4 text-gray-500 text-sm">
                                            La responsabilidad final del uso, interpretación y gestión de los datos recae exclusivamente en el usuario. Recomendamos mantener copias locales de información crítica cuando sea posible.
                                        </p>
                                    </div>
                                </motion.section>

                                {/* Clause 3: Uso Aceptable */}
                                <motion.section id="usage" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                            <FaBan className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">3. Uso Aceptable</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600">
                                            El usuario se compromete a utilizar la plataforma de manera ética y legal. Queda estrictamente prohibido:
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <h4 className="text-[#021f41] font-bold mb-2 flex items-center gap-2"><span className="text-orange-500">✕</span> Ingeniería Inversa</h4>
                                                <p className="text-sm text-gray-500">Intentar descompilar, desensamblar o descubrir el código fuente del software.</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <h4 className="text-[#021f41] font-bold mb-2 flex items-center gap-2"><span className="text-orange-500">✕</span> Actividades Ilícitas</h4>
                                                <p className="text-sm text-gray-500">Usar la plataforma para fraudes, distribución de malware o cualquier actividad ilegal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Clause 4: Disponibilidad */}
                                <motion.section id="availability" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-[#01c676]/10 text-[#01c676]">
                                            <FaClock className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">4. Disponibilidad (SLA)</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-[#01c676] to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#01c676]/30 transition-colors">
                                        <p className="leading-relaxed text-gray-600">
                                            Nos esforzamos por mantener un <strong>uptime (tiempo de actividad) lo más alto posible</strong>, típicamente superior al 99.9%.
                                        </p>
                                        <p className="mt-4 text-gray-500">
                                            No obstante, no garantizamos el 100% de disponibilidad ininterrumpida. Pueden ocurrir interrupciones breves debido a:
                                        </p>
                                        <ul className="mt-4 space-y-2 list-disc list-inside text-gray-500 text-sm">
                                            <li>Mantenimientos programados (se avisará con antelación).</li>
                                            <li>Actualizaciones críticas de seguridad.</li>
                                            <li>Fallas en proveedores de infraestructura de terceros o fuerza mayor.</li>
                                        </ul>
                                    </div>
                                </motion.section>

                                {/* Clause 5: Propiedad Intelectual */}
                                <motion.section id="ip" variants={itemVariants} className="scroll-mt-32">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                            <FaCopyright className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">5. Propiedad Intelectual</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-transparent rounded-full mb-6"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1">
                                                <h4 className="text-[#021f41] font-bold mb-2 text-lg">AppsFly</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Mantiene todos los derechos, títulos e intereses sobre el código fuente, diseño, algoritmos, bases de datos estructurales y el servicio en sí mismo. La licencia de uso no implica transferencia de propiedad.
                                                </p>
                                            </div>
                                            <div className="w-px bg-gray-200 hidden md:block"></div>
                                            <div className="flex-1">
                                                <h4 className="text-[#021f41] font-bold mb-2 text-lg">El Usuario</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Es el único y exclusivo dueño de sus datos ingresados en la plataforma (Inventarios, Ventas, Clientes, Reportes, etc.). AppsFly no reclama propiedad sobre la información generada por tu negocio.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer (Consistent with Home) */}
            <Footer/>

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

export default TermsPage;
