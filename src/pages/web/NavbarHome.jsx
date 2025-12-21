import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NavbarHome() {
    return (
        // Ajusté el padding horizontal del nav (px-4 en móvil, px-8 en escritorio)
        <nav className="flex justify-between items-center px-6 md:px-8 max-w-7xl mx-auto h-20">
            
            {/* Logo responsive */}
            <div className="w-28 md:w-[140px]">
                <img src="../../public/logo_appsfly.png" alt="logo appsfly" className="w-full h-auto" />
            </div>

            <div className="flex gap-4 items-center">
                {/* Botón Login */}
                <Link 
                    to="/login" 
                    className="px-5 py-2.5 text-sm md:text-base font-medium text-dark hover:text-primary transition-colors font-sans"
                >
                    Login
                </Link>

                {/* Botón Registro - Primary Action Vibrant Green */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link 
                        to="/register" 
                        className="px-6 py-2.5 text-sm md:text-base font-bold bg-primary text-white rounded-full hover:bg-[#00b067] hover:shadow-lg hover:shadow-primary/40 transition-all font-sans"
                    >
                        Registro
                    </Link>
                </motion.div>
            </div>
        </nav>
    );
}