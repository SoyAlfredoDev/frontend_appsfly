import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "../components/modals/ConfirmationModal.jsx";

const ConfirmationContext = createContext();

export const useConfirm = () => useContext(ConfirmationContext);

export const ConfirmationProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });

    const resolveRef = useRef(null);

    const confirm = useCallback(({ 
        title, 
        message, 
        variant = 'danger',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    }) => {
        setConfig({ title, message, variant, confirmText, cancelText });
        setIsOpen(true);

        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        if (resolveRef.current) resolveRef.current(true);
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (resolveRef.current) resolveRef.current(false);
        setIsOpen(false);
    };

    return (
        <ConfirmationContext.Provider value={confirm}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <ConfirmationModal
                        isOpen={isOpen}
                        onClose={handleCancel}
                        onConfirm={handleConfirm}
                        title={config.title}
                        message={config.message}
                        variant={config.variant}
                        confirmText={config.confirmText}
                        cancelText={config.cancelText}
                    />
                )}
            </AnimatePresence>
        </ConfirmationContext.Provider>
    );
};
