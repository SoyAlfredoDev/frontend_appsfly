/** Anclas de la landing — usadas en navbar y footer */
export const LANDING_SECTIONS = [
    { id: 'que-es', label: '¿Qué es AppsFly?' },
    { id: 'ventas-clientes', label: 'Ventas y clientes' },
    { id: 'productos-inventario', label: 'Productos e inventario' },
    { id: 'inteligencia-artificial', label: 'Inteligencia artificial' },
    { id: 'notificaciones-whatsapp', label: 'Notificaciones WhatsApp' },
    { id: 'planes', label: 'Planes' },
];

/** Enlaces visibles en el navbar (más cortos para caber en pantalla) */
export const LANDING_NAVBAR_SECTIONS = [
    { id: 'que-es', label: '¿Qué es?' },
    { id: 'ventas-clientes', label: 'Ventas' },
    { id: 'productos-inventario', label: 'Inventario' },
    { id: 'inteligencia-artificial', label: 'IA' },
    { id: 'planes', label: 'Planes' },
];

export const LANDING_COMPANY_LINKS = [
    { to: '/about-us', label: 'Nosotros' },
    { to: '/login', label: 'Iniciar sesión' },
    { to: '/register', label: 'Crear cuenta' },
];

export const LANDING_LEGAL_LINKS = [
    { to: '/politicas', label: 'Privacidad' },
    { to: '/terminos', label: 'Términos de uso' },
];

export const LANDING_SOCIAL_LINKS = [
    {
        href: 'https://www.instagram.com/appsfly.app/',
        label: 'Instagram',
        icon: 'instagram',
        hoverClass: 'hover:bg-[#E1306C]',
    },
    {
        href: 'https://www.facebook.com/61585307100875',
        label: 'Facebook',
        icon: 'facebook',
        hoverClass: 'hover:bg-[#1877F2]',
    },
    {
        href: 'https://twitter.com/appsfly_app',
        label: 'X (Twitter)',
        icon: 'twitter',
        hoverClass: 'hover:bg-slate-800',
    },
    {
        href: 'https://www.tiktok.com/@appsfly.software',
        label: 'TikTok',
        icon: 'tiktok',
        hoverClass: 'hover:bg-slate-900',
    },
    {
        href: 'https://www.linkedin.com/company/appsfly/',
        label: 'LinkedIn',
        icon: 'linkedin',
        hoverClass: 'hover:bg-[#0077b5]',
    },
];

export function landingSectionHref(sectionId) {
    return `/#${sectionId}`;
}
