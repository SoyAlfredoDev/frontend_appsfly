import { getSumPaymentsByPaymentMethod } from "../api/payment.js";
import { getSumExpensesByPaymentMethod } from "../api/expense.js";

export async function calculateTotalAvailableByPaymentMethod(paymentMethod) {
    try {
        const [paymentsByMethod, expensesByMethod] = await Promise.all([
            getSumPaymentsByPaymentMethod(paymentMethod),
            getSumExpensesByPaymentMethod(paymentMethod)
        ]);

        const totalPayments = Number(paymentsByMethod.data.total) || 0;
        const totalExpenses = Number(expensesByMethod.data.total) || 0;

        return totalPayments - totalExpenses;
    } catch (error) {
        console.error("Error calculating total payments by method:", error);
        throw error;
    }
}
