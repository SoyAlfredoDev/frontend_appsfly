const VARIANTS = {
    error: "bg-red-50 text-red-600 border-red-100",
    success: "bg-primary/5 text-dark border-primary/20",
    info: "bg-secondary/5 text-slate-700 border-secondary/15",
};

export default function AuthAlert({ variant = "error", children, className = "" }) {
    return (
        <div
            className={`px-4 py-3 rounded-lg mb-6 text-sm border font-sans ${VARIANTS[variant] ?? VARIANTS.error} ${className}`}
            role="alert"
        >
            {children}
        </div>
    );
}
