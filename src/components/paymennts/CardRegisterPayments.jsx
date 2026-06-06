import { useState } from "react";
import RegisterPayments from "./RegisterPayments";
import { v4 as uuidv4 } from 'uuid';
import { FaPlus } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";

export default function CardRegisterPayments({ sendPayments }) {
    const [payments, setPayments] = useState([
        { paymentId: uuidv4(), methodId: '', amount: '' }
    ]);

    const handledClickAddRowPayment = () => {
        setPayments(prev => [
            ...prev,
            { paymentId: uuidv4(), methodId: '', amount: '' }
        ]);
    };

    const handleGetPayment = (data) => {
        if (data.delete) {
            const newData = payments.filter(p => p.paymentId !== data.paymentId);
            setPayments(newData);
            sendPayments(newData);
        } else {
            const newData = payments.map(p =>
                p.paymentId === data.paymentId
                    ? { ...p, methodId: data.methodId, amount: data.amount }
                    : p
            );
            setPayments(newData);
            sendPayments(newData);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {payments.map(payment => (
                        <Motion.div
                            key={payment.paymentId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <RegisterPayments
                                paymentId={payment.paymentId}
                                sendDetailPayment={handleGetPayment}
                                methodId={payment.methodId}
                                amount={payment.amount}
                            />
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                type="button"
                onClick={handledClickAddRowPayment}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-semibold"
            >
                <FaPlus className="text-[10px]" /> Agregar pago
            </button>
        </div>
    );
}
