import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NavbarHome() {
    return (
        // Añadimos 'w-full' para asegurar que ocupe todo el ancho disponible
        // antes de que 'max-w-7xl' lo limite, permitiendo que 'justify-between' empuje a los lados.
        <nav className="w-full flex justify-between items-center px-6 md:px-12 max-w-[1440px] mx-auto h-24 relative z-50">
            
            {/* Logo a la izquierda */}
            <div className="flex-shrink-0">
                <Link to="/">
                    <img 
                        src="/logo_appsfly.png" 
                        alt="logo appsfly" 
                        className="w-28 md:w-36 h-auto object-contain" 
                    />
                </Link>
            </div>

            {/* Acciones a la derecha */}
            <div className="flex gap-4 md:gap-8 items-center">
                <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm md:text-base font-semibold text-dark hover:text-primary transition-colors font-sans"
                >
                    Login
                </Link>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link 
                        to="/register" 
                        className="px-6 py-2.5 text-sm md:text-base font-bold bg-primary text-white rounded-full hover:bg-[#00b067] shadow-md hover:shadow-primary/30 transition-all font-sans"
                    >
                        Registro
                    </Link>
                </motion.div>
            </div>
        </nav>
    );
}