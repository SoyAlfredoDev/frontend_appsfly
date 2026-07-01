import { useEffect, useState } from "react";
import RegisterPayments from "./RegisterPayments";
import { v4 as uuidv4 } from 'uuid';
import { FaPlus } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";

export default function CardRegisterPayments({
    sendPayments,
    requireFullPayment = false,
    saleTotal = 0,
    mobile = false,
}) {
    const [payments, setPayments] = useState([
        { paymentId: uuidv4(), methodId: '', amount: '' },
    ]);

    useEffect(() => {
        if (!requireFullPayment) return;

        setPayments((prev) => {
            const current = prev[0] ?? {
                paymentId: uuidv4(),
                methodId: "",
                amount: "",
            };
            const nextAmount = saleTotal > 0 ? saleTotal : "";

            if (
                prev.length === 1
                && Number(current.amount) === Number(nextAmount)
            ) {
                return prev;
            }

            const updated = [{ ...current, amount: nextAmount }];
            sendPayments(updated);
            return updated;
        });
    }, [requireFullPayment, saleTotal, sendPayments]);

    const handledClickAddRowPayment = () => {
        if (requireFullPayment) return;
        setPayments((prev) => [
            ...prev,
            { paymentId: uuidv4(), methodId: '', amount: '' },
        ]);
    };

    const handleGetPayment = (data) => {
        if (data.delete) {
            if (requireFullPayment) return;
            const newData = payments.filter((p) => p.paymentId !== data.paymentId);
            setPayments(newData);
            sendPayments(newData);
            return;
        }

        const newData = payments.map((p) =>
            p.paymentId === data.paymentId
                ? {
                    ...p,
                    methodId: data.methodId,
                    amount: requireFullPayment && saleTotal > 0 ? saleTotal : data.amount,
                }
                : p,
        );
        setPayments(newData);
        sendPayments(newData);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {payments.map((payment) => (
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
                                disableDelete={requireFullPayment}
                                required={requireFullPayment}
                                lockAmount={requireFullPayment}
                                mobile={mobile}
                            />
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {!requireFullPayment && (
                <button
                    type="button"
                    onClick={handledClickAddRowPayment}
                    className={`mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-semibold touch-manipulation ${
                        mobile ? "min-h-12 text-sm" : "py-2 text-xs"
                    }`}
                >
                    <FaPlus className="text-xs" /> Agregar pago
                </button>
            )}
        </div>
    );
}
