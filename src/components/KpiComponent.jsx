import { FcVlc } from "react-icons/fc";
import { motion } from "framer-motion";

export default function KpiComponent({
    title,
    icon,
    value,
    footer,
    loading,
    isCurrency = true
}) {
    return (
        <motion.div
            className="bg-white rounded-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full border border-gray-100 font-montserrat"
            whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >

            {/* Título */}
            <div className="px-[18px] pt-[14px]">
                <h4 className="text-base font-semibold text-[#1a1a1a] pb-2 m-0 border-b border-[#e8e8e8]">
                    {title}
                </h4>
            </div>

            {/* Icono + Valor */}
            <div className="flex justify-between items-center px-[18px] pt-[14px] pb-[10px] flex-1">
                <div className="text-[#1c7e2a] text-[32px] flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-[26px] font-bold text-[#111]">
                    {loading ? (
                        <div className="spinner-border spinner-border-sm text-green-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : value === null ? (
                        <div className="text-red-500 text-2xl">
                            <FcVlc />
                        </div>
                    ) : (
                        isCurrency
                            ? value.toLocaleString("es-CL", {
                                style: "currency",
                                currency: "CLP",
                            })
                            : value
                    )}
                </span>
            </div>

            {/* Footer */}
            <div className="bg-[#1c7e2a] text-white text-center py-[10px] px-4 text-sm font-medium border-t border-[#12861f] mt-auto">
                {footer}
            </div>

        </motion.div>
    );
}
