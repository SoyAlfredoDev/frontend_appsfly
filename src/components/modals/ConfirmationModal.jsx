import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    variant = 'danger',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar' 
}) {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <FaExclamationTriangle className="text-red-500 text-3xl" />,
            button: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
            bgIcon: 'bg-red-50'
        },
        success: {
            icon: <FaCheckCircle className="text-emerald-500 text-3xl" />,
            button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
            bgIcon: 'bg-emerald-50'
        },
        info: {
            icon: <FaInfoCircle className="text-blue-500 text-3xl" />,
            button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            bgIcon: 'bg-blue-50'
        }
    };

    const currentVariant = variants[variant] || variants.danger;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 min-h-screen">
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            />

            <Motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors"
                >
                    <FaTimes />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${currentVariant.bgIcon}`}>
                        {currentVariant.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl md:text-2xl font-bold text-[#021f41] mb-3 font-display tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm font-sans leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col-reverse md:flex-row gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-full px-5 py-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all focus:outline-none"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`w-full px-5 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all focus:outline-none transform active:scale-95 flex-1 ${currentVariant.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}
