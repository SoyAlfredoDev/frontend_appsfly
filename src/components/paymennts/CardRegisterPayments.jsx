import { useState } from "react";
import RegisterPayments from "./RegisterPayments";
import { v4 as uuidv4 } from 'uuid';

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
        <>
            {payments.map(payment => (
                <RegisterPayments
                    key={payment.paymentId}
                    paymentId={payment.paymentId}
                    sendDetailPayment={handleGetPayment}
                    methodId={payment.methodId}
                    amount={payment.amount}
                />
            ))}

            <button
                onClick={handledClickAddRowPayment}
                className="btn btn-sm btn-primary w-100"
            >
                <i className="bi bi-plus"></i> Agregar pago
            </button>
        </>
    );
}
