const VARIANTS = {
    default:
        'text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary bg-[length:200%_auto] animate-gradient',
    onDark:
        'text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary bg-[length:200%_auto] animate-gradient',
    light:
        'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-50 to-white bg-[length:200%_auto] animate-gradient',
};

export default function GradientText({ children, variant = 'default', className = '' }) {
    return (
        <span className={`${VARIANTS[variant] ?? VARIANTS.default} ${className}`.trim()}>
            {children}
        </span>
    );
}
