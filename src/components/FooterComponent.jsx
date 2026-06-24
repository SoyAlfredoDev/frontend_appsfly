import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTiktok,
    FaTwitter,
    FaWhatsapp,
} from 'react-icons/fa';
import {
    LANDING_COMPANY_LINKS,
    LANDING_LEGAL_LINKS,
    LANDING_SECTIONS,
    LANDING_SOCIAL_LINKS,
    landingSectionHref,
} from '../constants/landingNavigation.js';
import {
    SUPPORT_WHATSAPP_DISPLAY,
    SUPPORT_WHATSAPP_URL,
} from '../constants/supportContact.js';

const SOCIAL_ICONS = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    twitter: FaTwitter,
    tiktok: FaTiktok,
    linkedin: FaLinkedin,
};

function SocialLink({ href, label, icon, hoverClass }) {
    const Icon = SOCIAL_ICONS[icon];
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all ${hoverClass} hover:border-transparent hover:text-white`}
        >
            <Icon className="text-lg" />
        </a>
    );
}

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden bg-dark text-slate-300 font-sans">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10" />
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-10">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 mb-14">
                    {/* Marca */}
                    <div className="lg:col-span-4 space-y-5">
                        <Link to="/" className="inline-block">
                            <img
                                src="/logo-appsfly-white.png"
                                alt="AppsFly"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                            Sistema para registrar ventas. Lleva el control de lo que vendes,
                            tus clientes, inventario y reportes en un solo lugar — simple y claro.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-[#00b067] transition-colors"
                                >
                                    Empezar gratis
                                </Link>
                            </motion.div>
                            <a
                                href={SUPPORT_WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:border-[#25D366]/50 hover:bg-[#25D366]/10 transition-colors"
                            >
                                <FaWhatsapp className="text-[#25D366]" />
                                {SUPPORT_WHATSAPP_DISPLAY}
                            </a>
                        </div>
                    </div>

                    {/* El sistema */}
                    <div className="lg:col-span-3">
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            El sistema
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {LANDING_SECTIONS.map(({ id, label }) => (
                                <li key={id}>
                                    <a
                                        href={landingSectionHref(id)}
                                        className="text-slate-300 hover:text-primary transition-colors"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div className="lg:col-span-2">
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Empresa
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {LANDING_COMPANY_LINKS.map(({ to, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className="text-slate-300 hover:text-primary transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Redes */}
                    <div className="lg:col-span-3">
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Síguenos
                        </h4>
                        <p className="mb-4 text-sm text-slate-400 leading-relaxed">
                            Novedades, tips para tu negocio y actualizaciones del sistema.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {LANDING_SOCIAL_LINKS.map((social) => (
                                <SocialLink key={social.href} {...social} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Barra inferior */}
                <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        &copy; {currentYear} AppsFly. Todos los derechos reservados.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {LANDING_LEGAL_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className="text-slate-400 hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
