import { useState } from "react";
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";

export default function RegisterPayments({ sendDetailPayment, paymentId, methodId, amount }) {
    const methods = [
        { methodId: 0, methodName: 'Débito', icon: <FaCreditCard className="text-secondary text-xs" /> },
        { methodId: 1, methodName: 'Crédito', icon: <FaCreditCard className="text-purple-500 text-xs" /> },
        { methodId: 2, methodName: 'Efectivo', icon: <FaMoneyBillWave className="text-primary text-xs" /> },
        { methodId: 3, methodName: 'Transferencia', icon: <FaExchangeAlt className="text-amber-500 text-xs" /> },
    ];

    const [payment, setPayment] = useState({
        paymentId: paymentId,
        methodId: methodId,
        amount: amount
    });

    const handleAmountChange = (e) => {
        const newAmount = Number(e.target.value);
        const newData = {
            paymentId: paymentId,
            methodId: payment.methodId,
            amount: newAmount
        };
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
        sendDetailPayment({ paymentId, delete: true });
        setPayment({ paymentId: undefined, methodId: undefined, amount: undefined });
    };

    const selectedMethod = methods.find(m => m.methodId === payment.methodId);

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-slate-50/80 rounded-lg p-2.5 sm:p-2 border border-slate-200">
            <div className="flex gap-2 items-center flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    {selectedMethod ? selectedMethod.icon : <FaCreditCard className="text-slate-300 text-xs" />}
                </div>

                <select
                    className="select-field h-9 sm:h-10 flex-1 min-w-0 text-sm font-medium"
                    value={payment.methodId}
                    onChange={handleMethodChange}
                >
                    <option value="">Método de pago...</option>
                    {methods.map((m) => (
                        <option key={m.methodId} value={m.methodId}>
                            {m.methodName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 items-center">
                <div className="relative flex-1 sm:flex-none">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">$</span>
                    <input
                        type="number"
                        placeholder="0"
                        step={1}
                        value={payment.amount}
                        onChange={handleAmountChange}
                        className="input-field h-9 sm:h-10 w-full sm:w-28 pl-7 pr-3 text-right font-mono font-semibold text-sm"
                    />
                </div>

                <button
                    type="button"
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    onClick={handleClickDelete}
                    title="Eliminar pago"
                >
                    <FaTimes className="text-xs" />
                </button>
            </div>
        </div>
    );
}
