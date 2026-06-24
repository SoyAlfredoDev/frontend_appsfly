import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import {
    LANDING_NAVBAR_SECTIONS,
    LANDING_SECTIONS,
    landingSectionHref,
} from '../../constants/landingNavigation.js';

export default function NavbarHome() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const navLinkClass =
        'text-sm font-semibold text-slate-600 hover:text-primary transition-colors whitespace-nowrap';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
                <Link to="/" className="shrink-0">
                    <img
                        src="/logo_appsfly.png"
                        alt="AppsFly"
                        className="h-9 w-auto object-contain sm:h-10"
                    />
                </Link>

                {/* Desktop — secciones */}
                <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                    {LANDING_NAVBAR_SECTIONS.map(({ id, label }) => (
                        <a
                            key={id}
                            href={isHome ? `#${id}` : landingSectionHref(id)}
                            className={navLinkClass}
                        >
                            {label}
                        </a>
                    ))}
                </div>

                {/* Desktop — acciones */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <Link to="/login" className={`px-3 py-2 ${navLinkClass}`}>
                        Login
                    </Link>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Link
                            to="/register"
                            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-[#00b067] transition-colors"
                        >
                            Registro
                        </Link>
                    </motion.div>
                </div>

                {/* Mobile — toggle */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-dark"
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
                    >
                        <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                            {LANDING_SECTIONS.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href={isHome ? `#${id}` : landingSectionHref(id)}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface hover:text-primary"
                                >
                                    {label}
                                </a>
                            ))}
                            <div className="my-3 border-t border-slate-100" />
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                                className="mt-2 block rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                            >
                                Registro gratis
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
