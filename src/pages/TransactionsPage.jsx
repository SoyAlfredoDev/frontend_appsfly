import { useEffect, useState } from "react";
import NavBarComponent from "../components/NavBarComponent";
import AddTransactionModal from "../components/modals/AddTransactionModal.jsx";
import { v4 as uuidv4 } from 'uuid';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const transactionId = uuidv4();
        setTransactions([{
            transactionId,
            transactionDate: new Date().toISOString(),
            transactionType: 'ADJUSTMENT',
            transactionMethod: 0,
            transactionTable: 'TRANSACTIONS',
            transactionRecordId: transactionId,
            transactionOldValue: null,
            transactionNewValue: 100000,
            transactionDescription: 'Ajuste de saldo',
        }])
    }, []);
    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '80px' }}>
                    <div className="col-9 col-md-5">
                        <h2 className="page-title">Transacciones</h2>
                    </div>
                    <div className="col-3 col-md-2 text-center">
                        <AddTransactionModal />

                    </div>
                    <div className="col-md-5">
                        <div className="search-container">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="🔍 Buscar cierre por fecha"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="card" style={{ backgroundColor: '#e3f2fd', width: '15%' }}>
                        <div className="m-2">
                            efectivo disponible: <strong>{2000000 .toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr className="text-center">
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Método</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index} className="text-center">
                                    <td>{transaction.transactionId}</td>
                                    <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
                                    <td>{transaction.transactionType}</td>
                                    <td>{transaction.transactionMethod}</td>
                                    <td>{transaction.transactionDescription}</td>
                                    <td>{transaction.transactionNewValue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
