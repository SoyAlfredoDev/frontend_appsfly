import { useEffect, useState } from "react";
import NavBarComponent from "../components/NavBarComponent";
import { getExpenses, deleteExpense } from "../api/expense.js";
import { getTotalFromColumn } from "../api/utils.js";

import AddExpenseModal from "../components/modals/AddExpenseModal.jsx";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true); // Nuevo estado para la carga
    const [error, setError] = useState(null);   // Nuevo estado para errores
    const [totalExpenses, setTotalExpenses] = useState(0); // Nuevo estado para el total de gastos  

    useEffect(() => {
        fetchData();
        getTotalExpenses();
    }, [expenses.length]);

    const fetchData = async () => {
        try {
            // 1. Iniciar la carga
            setLoading(true);
            setError(null);
            const result = await getExpenses();
            // 2. Éxito: guardar los datos
            setExpenses(result.data);
        } catch (err) {
            // 3. Error: guardar el error
            console.error("Error fetching expenses:", err);
            setError("Ocurrió un error al cargar los gastos.");
        } finally {
            // 4. Finalizar la carga
            setLoading(false);
        }
    };

    const getTotalExpenses = async () => {
        try {
            const total = await getTotalFromColumn('expense', 'expenseAmount');
            setTotalExpenses(total.data.total);
        } catch (error) {
            console.error("Error calculating total expenses:", error);
            throw error;
        }
    };

    const deletedExpense = async (expenseId) => {
        try {
            // confirmation dialog
            const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este gasto?");
            if (!confirmDelete) return;
            await deleteExpense(expenseId);
            alert("Gasto eliminado exitosamente.");
            fetchData();
            getTotalExpenses();

        } catch (error) {
            console.error("Error deleting expense:", error);
            throw error;

        }
    };
    if (error) {
        return (
            <div className="alert alert-danger mt-5" role="alert">
                Error: {error}
            </div>
        );
    };

    // Función utilitaria para formatear la fecha
    const formatDateChile = (dateString) => {
        if (!dateString) return "";

        // Intenta crear un objeto Date con el string (que debe ser 'row.createdAt')
        const date = new Date(dateString);

        // Si la fecha es inválida (ej. "Invalid Date"), retornamos el string original o vacío
        if (isNaN(date.getTime())) {
            return dateString;
        }

        // Aplicamos tu formato preferido 'es-CL' (Chile)
        return date.toLocaleDateString('es-CL');
    };

    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '80px' }}>
                    <div className="col-5 col-md-5">
                        <h1 className="page-title">Gastos</h1>
                    </div>
                    <div className="col-2 col-md-3 text-center">
                        <AddExpenseModal />
                    </div>
                    <div className="col-5 col-md-4 text-center">
                        <h4>Total Gastos: {totalExpenses.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</h4>
                    </div>
                </div>

                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr className="text-center">
                                    {/* Encabezados de tabla COMPLETO */}
                                    <th>Fecha</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Usuario</th>
                                    <th>Acciones</th> {/* Columna para Editar/Eliminar */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    loading ? (
                                        <tr className="text-center">
                                            <td colSpan="5">Cargando gastos...</td>
                                        </tr>
                                    ) : null
                                }
                                {/* Lógica para mostrar gastos o mensaje de vacío */}
                                {expenses?.length === 0 ? (
                                    <tr className="text-center">
                                        <td colSpan="5">No hay gastos registrados.</td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense?.expenseId} className="text-center">
                                            <td>{new Date(expense?.createdAt).toLocaleDateString('es-CL')}</td>
                                            <td>{expense?.expenseDescription}</td>
                                            <td>{expense?.expenseAmount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>

                                            <td>{expense?.user?.userFirstName} {expense?.user?.userLastName}</td>
                                            <td>
                                                {expense?.expenseImageUrl && (
                                                    <a
                                                        href={expense.expenseImageUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn me-2"
                                                        title="Ver Comprobante"
                                                    >
                                                        <b><i className="bi bi-eye-fill text-success"></i></b>
                                                    </a>
                                                )}
                                                {
                                                    !expense?.expenseImageUrl && (
                                                        <button
                                                            className="btn me-2"
                                                        >
                                                            <b>
                                                                <i
                                                                    className="bi bi-eye-fill text-secondary">
                                                                </i>
                                                            </b>
                                                        </button>
                                                    )}

                                                <button
                                                    disabled={!expense}
                                                    className="btn me-2">
                                                    <i className="bi bi-pencil text-warning"></i>
                                                </button>
                                                <button
                                                    className="btn"
                                                    onClick={() => deletedExpense(expense?.expenseId)}
                                                >
                                                    <i className="bi bi-trash text-danger"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </>
    );
}