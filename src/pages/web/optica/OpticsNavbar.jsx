import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import {
    OPTICS_LANDING_NAVBAR_SECTIONS,
    OPTICS_LANDING_SECTIONS,
} from "../../../constants/opticsLandingNavigation.js";
import { OPTICS_PROMO_REGISTER_TO } from "../../../utils/opticsPromoHost.js";

export default function OpticsNavbar({ basePath = "/" }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isLandingRoot = location.pathname === basePath || location.pathname === "/";

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const sectionHref = (id) => (isLandingRoot ? `#${id}` : `${basePath}#${id}`);

    const navLinkClass =
        "text-sm font-semibold text-slate-600 hover:text-primary transition-colors whitespace-nowrap";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
                <Link to={basePath} className="shrink-0 flex items-center gap-2.5">
                    <img
                        src="/logo_appsfly.png"
                        alt="AppsFly"
                        className="h-9 w-auto object-contain sm:h-10"
                    />
                    <span className="hidden sm:inline text-sm font-display font-semibold text-dark tracking-tight border-l border-slate-200 pl-2.5">
                        Óptica
                    </span>
                </Link>

                <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                    {OPTICS_LANDING_NAVBAR_SECTIONS.map(({ id, label }) => (
                        <a key={id} href={sectionHref(id)} className={navLinkClass}>
                            {label}
                        </a>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <Link to="/login" className={`px-3 py-2 ${navLinkClass}`}>
                        Login
                    </Link>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Link
                            to={OPTICS_PROMO_REGISTER_TO}
                            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-[#00b067] transition-colors"
                        >
                            Probar gratis
                        </Link>
                    </motion.div>
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-dark"
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </nav>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
                    >
                        <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                            {OPTICS_LANDING_SECTIONS.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href={sectionHref(id)}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface hover:text-primary"
                                >
                                    {label}
                                </a>
                            ))}
                            <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-dark"
                                >
                                    Login
                                </Link>
                                <Link
                                    to={OPTICS_PROMO_REGISTER_TO}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-bold text-white"
                                >
                                    Probar gratis
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
