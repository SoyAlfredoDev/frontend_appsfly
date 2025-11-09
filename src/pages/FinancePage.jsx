import { useEffect, useState } from 'react';
import NavBarComponent from '../components/NavBarComponent.jsx';
import { calculateTotalAvailableByPaymentMethod } from '../utils/financeUtils.js';
import { getFinancialMovements } from '../libs/getFinancialMovements.js'

export default function FinancePage() {
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [financialMovements, setFinancialMovements] = useState([]);
    useEffect(() => {
        fetchTotalAvailable(2);
        fetchFinancialMovements();
    }, []);
    const fetchTotalAvailable = async () => {
        const total = await calculateTotalAvailableByPaymentMethod(2);
        setTotalAvailable(total);
    };
    const fetchFinancialMovements = async () => {
        try {
            const movements = await getFinancialMovements(2);
            setFinancialMovements(movements);
        } catch (error) {
            console.error("Error fetching financial movements:", error);
        }
    };
    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '80px' }}>
                    <div className="col-9 col-md-5">
                        <h2 className="page-title">Transacciones</h2>
                    </div>
                    <div className="col-3 col-md-2 text-center">


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

            </div>
            <div className="container">
                <div className="card" style={{ backgroundColor: '#e3f2fd', width: '15%' }}>
                    <div className="m-2">
                        efectivo disponible: <strong>{totalAvailable?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                    </div>
                </div>
                <hr />
                <div className="m-2">
                    <div className="table-responsive">
                     <h5> Tabla movimientos </h5>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Origen</th>
                                    <th>Método de Pago</th>
                                    <th>Monto</th>
                                    <th>Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    financialMovements.map((movement) => (
                                        <tr key={movement.financeId}>
                                            <td>{movement.financeId}</td>
                                            <td>{movement.financeDate}</td>
                                            <td>{movement.type === 'expense' ? 'Gasto' : 'Venta'}</td>
                                            <td>{movement.source}</td>
                                            <td>

                                                {movement.financePaymentMethod == '0' && 'Tarjeta de Crédito'}
                                                {movement.financePaymentMethod == '1' && 'Tarjeta Débito'}
                                                {movement.financePaymentMethod == '2' && 'Efectivo'}
                                                {movement.financePaymentMethod == '3' && 'Transferencia'}
                                            </td>
                                            <td>{movement.financeAmount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                            <td>{movement.user}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </>
    );
}