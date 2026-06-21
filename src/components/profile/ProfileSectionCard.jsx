import { motion as Motion } from "framer-motion";
import { TABLE_WRAPPER, TABLE_TOOLBAR, TABLE_SECTION_TITLE, TABLE_SECTION_SUB, itemVariants } from "../../utils/expenseUiPatterns.js";

export function ProfileFieldRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-3 px-6 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
            {Icon && (
                <div className="mt-0.5 p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Icon className="text-sm" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">{label}</p>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{children}</div>
            </div>
        </div>
    );
}

export default function ProfileSectionCard({
    title,
    subtitle,
    icon: Icon,
    badge,
    children,
    toolbarExtra,
}) {
    return (
        <Motion.div variants={itemVariants} className={`${TABLE_WRAPPER} h-full flex flex-col`}>
            <div className={TABLE_TOOLBAR}>
                <div className="flex items-start gap-3 min-w-0">
                    {Icon && (
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                            <Icon className="text-lg" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h2 className={TABLE_SECTION_TITLE}>{title}</h2>
                        {subtitle && <p className={TABLE_SECTION_SUB}>{subtitle}</p>}
                    </div>
                </div>
                {badge && <div className="shrink-0">{badge}</div>}
                {toolbarExtra}
            </div>
            <div className="flex-1">{children}</div>
        </Motion.div>
    );
}
