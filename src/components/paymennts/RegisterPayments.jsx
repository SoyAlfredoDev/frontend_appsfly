import { useState } from "react";
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";

export default function RegisterPayments({
    sendDetailPayment,
    paymentId,
    methodId,
    amount,
    disableDelete = false,
    required = false,
    lockAmount = false,
    mobile = false,
}) {
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
        if (lockAmount) return;
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

    const fieldHeight = mobile ? "h-11 text-base" : "h-9 sm:h-10 text-sm";
    const iconSize = mobile ? "w-11 h-11" : "w-8 h-8";
    const deleteSize = mobile
        ? "min-h-11 min-w-11"
        : "w-9 h-9";

    return (
        <div
            className={`flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50/50 p-2 ${
                mobile ? "" : "sm:flex-row sm:items-center sm:gap-2 sm:p-2"
            } ${mobile ? "!border-0 !bg-transparent !p-0 !gap-1.5" : ""}`}
        >
            <div className="flex gap-3 items-center flex-1 min-w-0">
                <div
                    className={`flex-shrink-0 ${iconSize} rounded-xl bg-white border border-slate-200 flex items-center justify-center`}
                >
                    {selectedMethod ? selectedMethod.icon : <FaCreditCard className="text-slate-300 text-sm" />}
                </div>

                <select
                    className={`select-field ${fieldHeight} flex-1 min-w-0 font-medium rounded-xl`}
                    value={payment.methodId}
                    onChange={handleMethodChange}
                    required={required}
                >
                    <option value="">{required ? "Método de pago *" : "Método de pago..."}</option>
                    {methods.map((m) => (
                        <option key={m.methodId} value={m.methodId}>
                            {m.methodName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3 items-center">
                <div className="relative flex-1 min-w-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        step={1}
                        value={payment.amount}
                        onChange={handleAmountChange}
                        readOnly={lockAmount}
                        required={required}
                        className={`input-field ${fieldHeight} w-full pl-8 pr-3 text-right font-mono font-semibold rounded-xl ${
                            lockAmount ? "bg-slate-100 text-slate-700 cursor-not-allowed" : ""
                        }`}
                    />
                </div>

                {!disableDelete && (
                <button
                    type="button"
                    className={`${deleteSize} flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all touch-manipulation`}
                    onClick={handleClickDelete}
                    title="Eliminar pago"
                    aria-label="Eliminar pago"
                >
                    <FaTimes className="text-sm" />
                </button>
                )}
            </div>
        </div>
    );
}
