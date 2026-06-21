import { useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaInfoCircle,
    FaUserShield,
    FaUserTie,
    FaCheck,
    FaBan,
    FaCompass,
} from "react-icons/fa";
import { TENANT_ROLES } from "../../utils/tenantPermissions.js";
import {
    TENANT_ROLE_CAPABILITIES,
    TENANT_ROLE_LABELS,
    TENANT_ROLE_RESTRICTIONS,
    TENANT_ROLE_SUMMARIES,
    getNavLabelsForRole,
} from "../../utils/tenantRolesInfo.js";

function RoleCard({ role, icon: Icon, accentClass, iconBgClass }) {
    const navLabels = getNavLabelsForRole(role);
    const capabilities = TENANT_ROLE_CAPABILITIES[role] ?? [];

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className={`px-4 py-3 border-b border-gray-100 flex items-start gap-3 ${iconBgClass}`}>
                <div className={`p-2 rounded-lg shrink-0 ${accentClass}`}>
                    <Icon className="text-lg" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900">{TENANT_ROLE_LABELS[role]}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {TENANT_ROLE_SUMMARIES[role]}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide mb-2 flex items-center gap-1.5">
                        <FaCompass className="text-primary" />
                        Vistas en el menú
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {navLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide mb-2">
                        Permisos principales
                    </p>
                    <ul className="space-y-2">
                        {capabilities.map((item) => (
                            <li key={item.label} className="flex gap-2 text-xs text-gray-700">
                                <FaCheck className="text-primary shrink-0 mt-0.5" />
                                <span>
                                    <span className="font-semibold text-gray-800">{item.label}:</span>{" "}
                                    {item.detail}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {role === TENANT_ROLES.USER && TENANT_ROLE_RESTRICTIONS[TENANT_ROLES.USER]?.length > 0 && (
                    <div className="rounded-lg border border-amber-100 bg-amber-50/80 p-3">
                        <p className="text-[10px] uppercase font-semibold text-amber-700 tracking-wide mb-2">
                            Restricciones
                        </p>
                        <ul className="space-y-1.5">
                            {TENANT_ROLE_RESTRICTIONS[TENANT_ROLES.USER].map((line) => (
                                <li key={line} className="flex gap-2 text-xs text-amber-900/90">
                                    <FaBan className="text-amber-600 shrink-0 mt-0.5" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TenantRolesInfoModal({ isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tenant-roles-modal-title"
                >
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    <Motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(event) => event.stopPropagation()}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/80 shrink-0">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary shrink-0">
                                    <FaInfoCircle className="text-lg" />
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        id="tenant-roles-modal-title"
                                        className="text-lg font-bold text-gray-800"
                                    >
                                        Roles y permisos del negocio
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Referencia informativa al invitar miembros a{" "}
                                        <strong className="font-semibold text-gray-700">AppsFly</strong>.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 rounded-lg transition-colors shrink-0"
                                aria-label="Cerrar"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Cada persona invitada recibe un rol dentro de tu negocio. Los permisos
                                aplican en la app y también se validan en el servidor por seguridad.
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <RoleCard
                                    role={TENANT_ROLES.ADMIN}
                                    icon={FaUserShield}
                                    accentClass="bg-secondary/10 text-secondary"
                                    iconBgClass="bg-secondary/5"
                                />
                                <RoleCard
                                    role={TENANT_ROLES.USER}
                                    icon={FaUserTie}
                                    accentClass="bg-slate-200 text-slate-600"
                                    iconBgClass="bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
