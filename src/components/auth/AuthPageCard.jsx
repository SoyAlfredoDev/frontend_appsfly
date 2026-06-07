import { Link } from "react-router-dom";

const LOGO_SRC = "/logo_appsfly.png";

export default function AuthPageCard({
    title,
    subtitle,
    wide = false,
    footer,
    children,
    headerSpacing = "mb-8",
    centered = true,
}) {
    return (
        <div className={`login-card ${wide ? "login-card--wide" : ""}`}>
            <div className="login-card__logo-wrap">
                <Link to="/" className="inline-block">
                    <img src={LOGO_SRC} className="login-card__logo" alt="AppsFly" />
                </Link>
            </div>

            {(title || subtitle) && (
                <div className={`${centered ? "text-center" : ""} ${headerSpacing}`}>
                    {title && (
                        <h2 className="text-2xl font-bold text-dark font-display tracking-tight">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-slate-500 text-sm mt-2 font-sans">{subtitle}</p>
                    )}
                </div>
            )}

            {children}

            {footer}
        </div>
    );
}
