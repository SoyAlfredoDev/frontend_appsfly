import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function RegisterPayments({ sendDetailPayment, paymentId, methodId, amount }) {
    const methods = [
        { methodId: 0, methodName: 'Débito' },
        { methodId: 1, methodName: 'Crédito' },
        { methodId: 2, methodName: 'Efectivo' },
        { methodId: 3, methodName: 'Transferencia' },
    ];
    
    // Local state to manage inputs before propagation if needed, 
    // though in this case we propagate immediately.
    const [payment, setPayment] = useState({
        paymentId: paymentId,
        methodId: methodId,
        amount: amount
    });

    const handleAmountChange = (e) => {
        let newAmount = Number(e.target.value);
        const newData = {
            paymentId: paymentId,
            methodId: payment.methodId,
            amount: newAmount
        }
        setPayment(newData);
        sendDetailPayment(newData);
    };

    const handleMethodChange = (e) => {
        const newMethodId = Number(e.target.value);
        const newData = {
            paymentId: paymentId,
            methodId: newMethodId,
            amount: payment.amount
        };
        setPayment(newData);
        sendDetailPayment(newData);
    };

    const handleClickDelete = () => {
        const data = {
            paymentId,
            delete: true
        };
        sendDetailPayment(data);
        setPayment({ paymentId: undefined, methodId: undefined, amount: undefined });
    };

    return (
        <div className="flex gap-1 mb-1 items-center">
            <select
                className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                value={payment.methodId}
                onChange={handleMethodChange}
            >
                <option value="">Método...</option>
                {methods.map((m) => (
                    <option key={m.methodId} value={m.methodId}>
                        {m.methodName}
                    </option>
                ))}
            </select>

            <input
                type="number"
                placeholder="0"
                step={1}
                value={payment.amount}
                onChange={handleAmountChange}
                className="w-24 bg-white border border-gray-200 text-gray-700 text-xs rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <button
                type="button"
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                onClick={handleClickDelete}
            >
                <FaTimes className="text-xs" />
            </button>
        </div>
    );
}
