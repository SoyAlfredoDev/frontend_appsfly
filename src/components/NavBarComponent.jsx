import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import formatName from '../utils/formatName.js';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBarComponent() {
    const { user, logout, subscriptions } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Filter items based on subscriptions logic
    const filteredItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Clientes', path: '/customers' },
        { name: 'Productos', path: '/products_services' },
        { name: 'Ventas', path: '/sales' },
        { name: 'Compras', path: '/purchase' },
        { name: 'Proveedores', path: '/providers' },
        { name: 'Usuarios', path: '/users' },
        { name: 'Perfil', path: '/profile' },
    ].filter(() => subscriptions.length > 0);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-primary shadow-md h-14">
            <div className="max-w-7xl mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2 no-underline group">
                        <span className="text-xl font-bold text-white tracking-wide group-hover:text-emerald-50 transition-colors">
                            AppsFly
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        {filteredItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                                    isActive(item.path)
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User & Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        {user && (
                            <span className="text-sm text-emerald-100 font-medium">
                                Hola, <span className="text-white font-semibold">{formatName(user?.userFirstName)}</span>
                            </span>
                        )}
                        <button 
                            onClick={logout} 
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:text-white border border-emerald-500 hover:border-emerald-300 rounded-md transition-colors uppercase tracking-wider flex items-center gap-2"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Salir
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1 rounded-md text-white hover:bg-white/10 focus:outline-none"
                        >
                            <span className="sr-only">Open menu</span>
                            {!isOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-emerald-700 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {user && (
                                <div className="px-3 py-2 text-sm text-emerald-100 border-b border-emerald-600 mb-2">
                                    Hola, {formatName(user?.userFirstName)}
                                </div>
                            )}
                            {filteredItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium no-underline ${
                                        isActive(item.path)
                                            ? 'bg-emerald-800 text-white'
                                            : 'text-emerald-100 hover:text-white hover:bg-emerald-600'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-200 hover:text-white hover:bg-red-500/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Salir
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
