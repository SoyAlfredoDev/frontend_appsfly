import "./RegisterPayments.css";
import { useState } from "react";

export default function RegisterPayments({ sendDetailPayment, paymentId, methodId, amount }) {
    const methods = [
        { methodId: 0, methodName: 'Tarjeta de Débito' },
        { methodId: 1, methodName: 'Tarjeta de Crédito' },
        { methodId: 2, methodName: 'Efectivo' },
        { methodId: 3, methodName: 'Transferencia Bancaria' },
    ];
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
        ;
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
        <div className="input-group m-0 p-0 mb-1">
            <select
                className="form-select form-select-sm w-50 py-0"
                value={payment.methodId}
                onChange={handleMethodChange}
            >
                <option value="">Seleccionar método de pago</option>
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
                className="form-control form-control-sm w-40"
            />

            <button
                type="button"
                className="btn btn-sm btn-secondary w-10"
                onClick={handleClickDelete}
            >
                x
            </button>
        </div>
    );
}
