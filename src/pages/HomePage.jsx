import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaLinkedin } from 'react-icons/fa';
import NavbarHome from './web/NavbarHome.jsx';
import HeroHome from './web/HeroHome.jsx';
import NewsHome from './web/NewsHome.jsx';
import PlansHome from './web/PlansHome.jsx';
import WhyHome from './web/WhyHome.jsx';
import NewsLetterHome from './web/NewsLetterHome.jsx';

const HomePage = () => { 
    return (
        <div className="font-sans text-dark bg-white overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Header / Navbar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <NavbarHome />
            </div>
            
            <main>
                {/* Hero Section */}
                <HeroHome />
            
                {/* News / Updates Section */}
                <NewsHome/>            

                {/* Why AppsFly Section */}
                <WhyHome/>

                {/* Plans Section */}
                <PlansHome/>

                {/* Newsletter Section */}
                <NewsLetterHome/>
            </main>

            {/* Robust Footer */}
            <footer className="bg-surface pt-16 pb-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand Column */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display font-bold text-dark">AppsFly</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                La plataforma todo en uno para gestionar tu negocio. 
                                Simple, potente y escalable.
                            </p>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h4 className="font-bold text-dark mb-4">Producto</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Características</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Precios</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Novedades</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Integraciones</a></li>
                            </ul>
                        </div>

                        {/* Legal/Company Column */}
                        <div>
                            <h4 className="font-bold text-dark mb-4">Compañía</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Nosotros</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Términos</a></li>
                            </ul>
                        </div>

                        {/* Socials Column */}
                        <div>
                            <h4 className="font-bold text-dark mb-4">Síguenos</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <FaInstagram />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <FaFacebook />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all shadow-sm">
                                    <FaTwitter />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all shadow-sm">
                                    <FaTiktok />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-blue-700 hover:text-white transition-all shadow-sm">
                                    <FaLinkedin />
                                </a>
                            </div>
                        </div>
                    </div>
                     
                    <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
                        <p>&copy; {new Date().getFullYear()} AppsFly. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

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

export default HomePage;
