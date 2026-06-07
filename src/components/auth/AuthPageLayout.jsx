import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../../styles/AuthPage.css";

const DEFAULT_BRAND = {
    tagline: "Plataforma B2B",
    title: (
        <>
            Operaciones claras.
            <span className="block text-primary mt-1">Decisiones rápidas.</span>
        </>
    ),
    description:
        "Ventas, inventario, gastos y reportes en un solo ecosistema. Accede con tu cuenta corporativa.",
};

export default function AuthPageLayout({
    brandTagline = DEFAULT_BRAND.tagline,
    brandTitle = DEFAULT_BRAND.title,
    brandDescription = DEFAULT_BRAND.description,
    children,
}) {
    return (
        <div className="login-page">
            <div className="login-page__ambient" aria-hidden="true" />

            <div className="login-page__grid">
                <aside className="login-brand-panel" aria-hidden="true">
                    <Link to="/" className="inline-block">
                        <img
                            src="/logo-appsfly-white.png"
                            alt=""
                            className="h-9 w-auto object-contain opacity-95"
                        />
                    </Link>

                    <div className="max-w-sm">
                        <div className="login-brand-panel__accent-line" />
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                            {brandTagline}
                        </p>
                        <h1 className="text-3xl xl:text-[2rem] font-bold font-display text-white leading-tight">
                            {brandTitle}
                        </h1>
                        <p className="mt-4 text-sm text-white/70 leading-relaxed font-sans">
                            {brandDescription}
                        </p>
                    </div>

                    <p className="text-xs text-white/40 font-sans">
                        © {new Date().getFullYear()} AppsFly. Todos los derechos reservados.
                    </p>
                </aside>

                <main className="login-form-column">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full flex justify-center"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
