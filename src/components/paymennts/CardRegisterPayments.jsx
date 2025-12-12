import { useState } from "react";
import RegisterPayments from "./RegisterPayments";
import { v4 as uuidv4 } from 'uuid';
import { FaPlus } from "react-icons/fa";

export default function CardRegisterPayments({ sendPayments }) {
    const [payments, setPayments] = useState([
        {
            paymentId: uuidv4(),
            methodId: '',
            amount: ''
        }
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
            const newData = payments.map(p => {
                if (p.paymentId === data.paymentId) {
                    return { ...p, methodId: data.methodId, amount: data.amount };
                } else {
                    return p;
                }
            });
            setPayments(newData);
            sendPayments(newData);
        };

    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {payments.map(payment => (
                    <RegisterPayments
                        key={payment.paymentId}
                        paymentId={payment.paymentId}
                        sendDetailPayment={handleGetPayment}
                        methodId={payment.methodId}
                        amount={payment.amount}
                    />
                ))}
            </div>

            <button
                onClick={handledClickAddRowPayment}
                className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 border border-dashed border-gray-300 rounded text-gray-500 text-xs hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all font-medium"
            >
                <FaPlus className="text-[10px]" /> Agregar pago
            </button>
        </div>
    );
}
