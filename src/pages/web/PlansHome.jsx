import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { getPlansRequest } from '../../api/plans.js';
import { parsePlanFeatures } from '../../utils/planUtils.js';
import { FREE_TRIAL_PLAN_ID } from '../../utils/subscriptionAccess.js';
import GradientText from '../../components/web/GradientText.jsx';

const BASIC_MONTHLY_PRICE = 9990;

const PRO_FEATURES = [
    '5 usuarios',
    'Compras y Ventas',
    'Inventario',
    'Reportes',
    'Boletas electrónicas',
    'Facturas electrónicas',
    'Asistente con IA',
    'Envío de correos a clientes',
    'Soporte 24/7',
];

const FALLBACK_PLANS = [
    {
        planId: 'P001',
        planName: 'Plan Básico',
        planPrice: 0,
        planDuration: 2,
        planFeatures: ['5 usuarios', 'Compras y Ventas', 'Inventario', 'Reportes', 'Soporte 24/7'],
        planActive: true,
    },
    {
        planId: 'P003',
        planName: 'Plan Profesional',
        planPrice: 39990,
        planDuration: 1,
        planFeatures: PRO_FEATURES,
        planActive: true,
    },
];

/** Solo estos planes se muestran en la landing */
const LANDING_PLAN_IDS = ['P001', 'P003'];
const PLAN_ORDER = LANDING_PLAN_IDS;

const PLAN_META = {
    P001: {
        subtitle: 'Promoción de lanzamiento',
        badge: '🎁 2 meses gratis',
        recommended: true,
        monthlyPrice: BASIC_MONTHLY_PRICE,
    },
    P003: {
        subtitle: 'Facturación y automatización',
        badge: '🔥 Más completo',
        recommended: false,
        highlight: true,
    },
};

function formatPrice(amount) {
    return `$${Number(amount).toLocaleString('es-CL')}`;
}

function buildDisplayPlans(rawPlans) {
    const landingPlans = rawPlans.filter((p) => LANDING_PLAN_IDS.includes(p.planId));
    const sorted = [...landingPlans].sort(
        (a, b) => PLAN_ORDER.indexOf(a.planId) - PLAN_ORDER.indexOf(b.planId),
    );

    return sorted.map((plan) => {
        const meta = PLAN_META[plan.planId] ?? {
            subtitle: 'Plan AppsFly',
            badge: null,
            recommended: false,
        };
        const features = parsePlanFeatures(plan.planFeatures);
        const isTrial = plan.planId === FREE_TRIAL_PLAN_ID;
        const monthlyPrice = isTrial
            ? meta.monthlyPrice ?? BASIC_MONTHLY_PRICE
            : Number(plan.planPrice);

        return {
            planId: plan.planId,
            name: plan.planName,
            subtitle: meta.subtitle,
            badge: meta.badge,
            recommended: meta.recommended,
            highlight: meta.highlight,
            features,
            price: monthlyPrice,
            priceSuffix: '/mes',
            promoLabel: isTrial ? `🎁 ${plan.planDuration} meses gratis` : null,
            promoNote: isTrial ? 'Sin costo los primeros 2 meses al registrarte' : null,
            monthlyNote: isTrial ? `Luego ${formatPrice(monthlyPrice)} mensual` : 'Pago mensual recurrente',
        };
    });
}

function PlanCardSkeleton() {
    return (
        <div className="w-full max-w-[360px] p-8 rounded-[2rem] bg-slate-50 border border-gray-100 animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-40 bg-slate-100 rounded mb-6" />
            <div className="h-12 w-28 bg-slate-200 rounded mb-6" />
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-slate-100 rounded" />
                ))}
            </div>
        </div>
    );
}

export default function PlansHome() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await getPlansRequest();
                const list = Array.isArray(res.data) ? res.data : [];
                const active = list.filter(
                    (p) => p.planActive !== false && LANDING_PLAN_IDS.includes(p.planId),
                );
                if (!cancelled) {
                    setPlans(active.length ? active : FALLBACK_PLANS);
                }
            } catch {
                if (!cancelled) setPlans(FALLBACK_PLANS);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const displayPlans = useMemo(() => buildDisplayPlans(plans), [plans]);
    const MotionLink = motion(Link);

    return (
        <section className="py-16 md:py-24 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#021f41] font-display mb-3">
                        💎 Planes <GradientText>Flexibles</GradientText>
                    </h2>
                    <p className="text-gray-500 text-base max-w-2xl mx-auto">
                        🎁 Plan Básico a {formatPrice(BASIC_MONTHLY_PRICE)}/mes con 2 meses gratis,
                        o Plan Profesional a {formatPrice(39990)}/mes.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 lg:gap-10 max-w-4xl mx-auto">
                    {loading
                        ? PLAN_ORDER.map((id) => <PlanCardSkeleton key={id} />)
                        : displayPlans.map((plan, index) => (
                            <motion.div
                                key={plan.planId}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                className={`relative w-full max-w-[360px] p-8 rounded-[2rem] flex flex-col transition-all duration-300 ${
                                    plan.recommended
                                        ? 'bg-white shadow-[0_15px_40px_rgba(1,198,118,0.12)] border-2 border-[#01c676]'
                                        : plan.highlight
                                          ? 'bg-white shadow-[0_15px_40px_rgba(9,79,209,0.1)] border-2 border-[#094fd1]/30'
                                          : 'bg-slate-50 border border-gray-100'
                                }`}
                            >
                                {(plan.recommended || plan.badge) && (
                                    <div
                                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md text-white ${
                                            plan.recommended ? 'bg-[#01c676]' : 'bg-[#094fd1]'
                                        }`}
                                    >
                                        {plan.badge ?? 'Recomendado'}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold font-display text-[#021f41]">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-1">{plan.subtitle}</p>
                                </div>

                                <div className="mb-6 border-b border-gray-50 pb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span
                                            className={`text-4xl sm:text-5xl font-black tracking-tighter font-display ${
                                                plan.promoLabel ? 'text-[#01c676]' : 'text-[#021f41]'
                                            }`}
                                        >
                                            {formatPrice(plan.price)}
                                        </span>
                                        <span className="text-gray-400 text-sm font-medium">
                                            {plan.priceSuffix}
                                        </span>
                                    </div>
                                    {plan.promoLabel && (
                                        <div className="mt-2 inline-flex items-center bg-[#01c676]/10 px-2.5 py-1 rounded-md">
                                            <span className="text-[10px] text-[#01a866] font-bold uppercase">
                                                {plan.promoLabel}
                                            </span>
                                        </div>
                                    )}
                                    {plan.promoNote && (
                                        <p className="text-[#01a866] text-[11px] mt-2 font-semibold">
                                            {plan.promoNote}
                                        </p>
                                    )}
                                    {plan.monthlyNote && (
                                        <p className="text-gray-400 text-[11px] mt-1 italic">
                                            {plan.monthlyNote}
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3 text-[#021f41]/90"
                                        >
                                            <FaCheckCircle className="text-[#01c676] text-base flex-shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <MotionLink
                                    to="/register"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-3.5 rounded-xl font-bold text-center flex justify-center items-center transition-all font-display tracking-wide text-sm ${
                                        plan.recommended
                                            ? 'bg-[#01c676] text-white shadow-lg shadow-[#01c676]/20 hover:bg-[#01b069]'
                                            : plan.highlight
                                              ? 'bg-[#094fd1] text-white shadow-lg shadow-[#094fd1]/20 hover:bg-[#073da3]'
                                              : 'bg-[#021f41] text-white hover:bg-[#032d5e]'
                                    }`}
                                >
                                    Empezar ahora
                                </MotionLink>
                            </motion.div>
                        ))}
                </div>
            </div>
        </section>
    );
}
