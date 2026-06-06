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
            button: 'btn-danger shadow-lg hover:shadow-xl',
            bgIcon: 'bg-red-50'
        },
        success: {
            icon: <FaCheckCircle className="text-primary text-3xl" />,
            button: 'btn-primary shadow-lg hover:shadow-xl',
            bgIcon: 'bg-primary/10'
        },
        info: {
            icon: <FaInfoCircle className="text-secondary text-3xl" />,
            button: 'btn-secondary shadow-lg hover:shadow-xl',
            bgIcon: 'bg-secondary/10'
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
                className="modal-backdrop"
            />

            <Motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="modal-panel w-full max-w-md relative z-10"
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
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${currentVariant.bgIcon}`}>
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
                            className="btn-ghost w-full py-3 rounded-lg"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`w-full py-3 rounded-lg ${currentVariant.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}
