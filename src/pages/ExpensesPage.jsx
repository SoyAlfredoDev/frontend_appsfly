import { useEffect, useState, useCallback } from "react";
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import { getExpenses, deleteExpense } from "../api/expense.js";
import { getTotalFromColumn } from "../api/utils.js";
import AddExpenseModal from "../components/modals/AddExpenseModal.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEdit, FaEye, FaReceipt, FaMoneyBillWave } from "react-icons/fa";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getExpenses();
            setExpenses(result.data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setError("Ocurrió un error al cargar los gastos.");
        } finally {
            setLoading(false);
        }
    }, []);

    const getTotalExpenses = useCallback(async () => {
        try {
            const total = await getTotalFromColumn('expense', 'expenseAmount');
            setTotalExpenses(total.data.total);
        } catch (error) {
            console.error("Error calculating total expenses:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        getTotalExpenses();
    }, [fetchData, getTotalExpenses]);

    const handleExpenseAdded = () => {
        fetchData();
        getTotalExpenses();
    };

    const deletedExpense = async (expenseId) => {
        try {
            const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este gasto?");
            if (!confirmDelete) return;
            await deleteExpense(expenseId);
            alert("Gasto eliminado exitosamente.");
            fetchData();
            getTotalExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Error al eliminar el gasto.");
        }
    };

    if (error) {
        return (
            <ProtectedView>
                <NavBarComponent />
                <div className="flex justify-center items-center min-h-screen">
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </ProtectedView>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                <Motion.div 
                    className="max-w-7xl mx-auto space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaReceipt className="text-emerald-600" />
                                Gestión de Gastos
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Registro y control de gastos operativos</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                    <FaMoneyBillWave />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Gastos</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {totalExpenses.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <AddExpenseModal onExpenseAdded={handleExpenseAdded} />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4">Monto</th>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                                                    <p className="text-sm">Cargando gastos...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : expenses.length === 0 ? (
                                        <Motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No hay gastos registrados.
                                            </td>
                                        </Motion.tr>
                                    ) : (
                                        expenses.map((expense) => (
                                            <Motion.tr 
                                                key={expense?.expenseId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-gray-50 transition-colors group"
                                            >
                                                <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                    {new Date(expense?.createdAt).toLocaleDateString('es-CL')}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800 font-medium text-sm">
                                                    {expense?.expenseDescription}
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 font-semibold text-sm whitespace-nowrap">
                                                    {expense?.expenseAmount ? expense.expenseAmount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : '$0'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                    {expense?.user?.userFirstName} {expense?.user?.userLastName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {expense?.expenseImageUrl ? (
                                                            <a
                                                                href={expense.expenseImageUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Ver Comprobante"
                                                            >
                                                                <FaEye />
                                                            </a>
                                                        ) : (
                                                            <button disabled className="p-2 text-gray-300 cursor-not-allowed">
                                                                <FaEye />
                                                            </button>
                                                        )}
                                                        
                                                        <button 
                                                            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => deletedExpense(expense?.expenseId)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </Motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </ProtectedView>
    );
}