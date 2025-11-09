import { getExpenses } from '../api/expense.js';
import { getPayments } from '../api/payment.js';

export const getFinancialMovements = async () => {
    try {
        // Cargar datos en paralelo
        const [expenses, payments] = await Promise.all([
            getExpenses(),
            getPayments()
        ]);
        // Formatear datos
        if (!expenses?.status === 200 || !payments?.status === 200) return { 'error': 'Error fetching data' };
        const expenseFormatted = expenses.data.map(expense => ({
            financeId: expense.expenseId,
            financeDate: expense.createdAt?.split('T')[0] || null,
            financePaymentMethod: String(expense.expensePaymentMethod) || null,
            financeAmount: expense.expenseAmount || 0,
            type: 'expense'
        }));
        const paymentFormatted = payments.data.map(payment => ({
            financeId: payment.paymentId,
            financeDate: payment.createdAt?.split('T')[0] || null,
            financePaymentMethod: String(payment.paymentMethod) || null,
            financeAmount: payment.paymentAmount || 0,
            type: 'payment'
        }));
        const movements = [...expenseFormatted, ...paymentFormatted].sort(
            (a, b) => new Date(b.financeDate) - new Date(a.financeDate)
        );
        return movements;
    } catch (error) {
        console.error("(getFinancialMovements.js): Error fetching financial movements:", error);
        throw error;
    }
};
