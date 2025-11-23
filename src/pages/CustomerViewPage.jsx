import NavBarComponent from '../components/NavBarComponent.jsx';
import ProtectedView from "../components/ProtectedView";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../api/customers.js';
import { getSalesByCustomerIdRequest } from '../api/sale.js';
import { getPaymentByCustomerId } from '../api/payment.js';
import formatCurrency from '../utils/formatCurrency.js';
import formatDate from '../utils/formatDate.js';
import formatName from '../utils/formatName.js'



export default function CustomerViewPage() {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [sales, setSales] = useState([]);
    const [payments, setPayments] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const methodsPaymets = [
        { methodId: '0', methodName: 'Tarjeta de Débito' },
        { methodId: '1', methodName: 'Tarjeta de Crédito' },
        { methodId: '2', methodName: 'Efectivo' },
        { methodId: '3', methodName: 'Transferencia Bancaria' },
    ];


    const fetchCustomer = async () => {
        try {
            const customerFound = await getCustomerById(id);
            const salesFound = await getSalesByCustomerIdRequest(id);
            const paymentsFound = await getPaymentByCustomerId(id);
            setSales(salesFound.data);
            setPayments(paymentsFound.data);
            setCustomer(customerFound.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    return (
        <ProtectedView>
            <NavBarComponent />

            <div className="container py-4 mt-5">

                {/* TÍTULO */}
                <div className="d-flex align-items-center mb-4">
                    <h2 className="fw-bold m-0">Detalles del Cliente</h2>
                </div>

                {/* CARD DE INFORMACIÓN GENERAL */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <p className="mb-1">
                                    <strong>Nombre:</strong>{" "}
                                    {loading ? (
                                        <div className="ms-3 spinner-grow spinner-grow-sm text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    ) : (
                                        formatName(customer?.customerFirstName)
                                    )}
                                </p>

                                <p className="mb-1">
                                    <strong>Apellido:</strong>{" "}
                                    {loading ? "..." : formatName(customer?.customerLastName)}
                                </p>

                                <p className="mb-1">
                                    <strong>Documento:</strong>{" "}
                                    {loading ? "..." : customer?.customerDocumentNumber}
                                </p>

                                <p className="mb-1">
                                    <strong>Teléfono:</strong>{" "}
                                    {loading ? "..." : customer?.customerPhoneNumber}
                                </p>
                            </div>


                            {/* FOTO O ESPACIO PARA FOTO */}
                            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                                <div className="border rounded bg-light d-flex justify-content-center align-items-center"
                                    style={{
                                        width: "140px",
                                        height: "140px",
                                        fontSize: "0.9rem",
                                        color: "#777"
                                    }}>
                                    IMG
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HISTORIAL DE VENTAS */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="fw-semibold mb-3">Historial de Ventas</h5>

                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha de Venta</th>
                                        <th>Nro Venta</th>
                                        <th>Total</th>
                                        <th>Comentarios</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(sale => (
                                        <tr key={sale?.saleId}>
                                            <td>{formatDate(sale?.createdAt)}</td>
                                            <td>{sale?.saleNumber}</td>
                                            <td>{formatCurrency(sale?.saleTotal)}</td>
                                            <td>{sale?.salePendingAmount > 0 ? 'Pendiente' : 'Pagado'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* HISTORIAL DE PAGOS */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="fw-semibold mb-3">Historial de Pagos</h5>

                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha de Pago</th>
                                        <th>Venta Relacionada</th>
                                        <th>Total</th>
                                        <th>Método de Pago</th>
                                        <th>Usuario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment?.paymentId}>
                                            <td>{formatDate(payment?.createdAt)}</td>
                                            <td>{payment?.Sale?.saleNumber}</td>
                                            <td>{formatCurrency(payment?.paymentAmount)}</td>
                                            <td>{
                                                methodsPaymets.find(method => method.methodId === payment?.paymentMethod)?.methodName

                                            }</td>
                                            <td>
                                                {[payment?.user?.userFirstName, payment?.user?.userLastName]
                                                    .map(formatName)
                                                    .filter(Boolean)
                                                    .join(" ")
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* BOTONES */}
                <div className="d-flex justify-content-between mt-4">
                    <button
                        onClick={() => navigate('/customers')}
                        className="btn btn-secondary px-4"
                    >
                        Volver
                    </button>

                    <button className="btn btn-warning px-4">
                        Editar
                    </button>
                </div>

            </div>
        </ProtectedView>
    );
}
