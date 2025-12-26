import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Función para agregar un toast
  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto eliminar después de 4 segundos
    setTimeout(() => {
      removeToast(id);
    }, 10000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Helpers rápidos para usar en los componentes
  const toast = {
    success: (title, msg) => addToast("success", title, msg),
    error: (title, msg) => addToast("error", title, msg),
    info: (title, msg) => addToast("info", title, msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Contenedor de Toasts (Renderizado en Portal o fijo en pantalla) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Componente Visual Individual
const ToastItem = ({ type, title, message, onClose }) => {
  // Configuración de estilos según tu paleta
  const styles = {
    success: {
      border: "border-[#01c676]", // Primary Green
      icon: <FaCheckCircle className="text-[#01c676] text-xl" />,
      bgIcon: "bg-[#01c676]/10",
    },
    error: {
      border: "border-red-500", // Standard Red for errors
      icon: <FaExclamationCircle className="text-red-500 text-xl" />,
      bgIcon: "bg-red-500/10",
    },
    info: {
      border: "border-[#094fd1]", // Secondary Blue
      icon: <FaInfoCircle className="text-[#094fd1] text-xl" />,
      bgIcon: "bg-[#094fd1]/10",
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto w-80 md:w-96 bg-white shadow-xl rounded-lg overflow-hidden border-l-4 ${currentStyle.border} flex p-4 relative font-inter`}
    >
      {/* Icono */}
      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${currentStyle.bgIcon} mr-3`}>
        {currentStyle.icon}
      </div>

      {/* Contenido */}
      <div className="flex-1 pr-4">
        <h4 className="text-[#021f41] font-bold text-sm mb-0.5 font-chillax">
          {title}
        </h4>
        {message && (
          <p className="text-gray-500 text-xs leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Botón Cerrar */}
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 text-gray-400 hover:text-[#021f41] transition-colors"
      >
        <FaTimes size={12} />
      </button>
    </motion.div>
  );
};