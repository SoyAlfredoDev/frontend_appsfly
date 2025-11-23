import NavBarComponent from "../../components/NavBarComponent"
import ProtectedView from "../../components/ProtectedView";
import { v4 as uuidv4 } from 'uuid';
import { getSaleById } from '../../api/sale.js'
import { getSaleDetailById } from '../../api/saleDetail.js'
import { getPaymentBySaleId } from '../../api/payment.js'
import { useEffect, useState } from "react"
import { useParams, Link } from 'react-router-dom'
import { IconComponent, IconPrinter } from "../../components/IconComponent.jsx"
import { createPayment } from '../../api/payment.js'
import { PDFDownloadLink } from '@react-pdf/renderer'
import SimpleTestPDFContent from '../../components/Printables/SimpleTestPDF.jsx'

export default function ViewSalePage() {
    const [sale, setSale] = useState({});
    const [tableProductAndService, setTableProductAndService] = useState([]);
    const [tablaPayment, setTablaPayment] = useState([])
    const { id } = useParams();
    const [paymentId, setPaymentId] = useState(uuidv4());
    const [method, setMethod] = useState("");
    const [payment, setPayment] = useState(0);
    const [btnModal, setBtnModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Payment methods for the modal
    const methods = [
        { methodId: 0, methodName: 'Debit Card' },
        { methodId: 1, methodName: 'Credit Card' },
        { methodId: 2, methodName: 'Cash' },
        { methodId: 3, methodName: 'Bank Transfer' },
    ];

    const searchSaleById = async () => {
        try {
            const saleData = await getSaleById(id);
            const saleDetailData = await getSaleDetailById(id);
            const payments = await getPaymentBySaleId(id)

            setSale(saleData.data);
            setTableProductAndService(saleDetailData.data);
            setTablaPayment(payments.data)

            // Update initial amount to pending amount
            setPayment(saleData.data.salePendingAmount || 0);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    // Call search function on initial load
    useEffect(() => {
        searchSaleById();
    }, [id]);

    const handleAmountChange = (e) => {
        const newAmount = Number(e.target.value);
        if (newAmount > sale.salePendingAmount) {
            alert('The payment amount cannot exceed the sale pending amount.')
            setPayment(sale.salePendingAmount);
            return;
        }
        setPayment(newAmount)
    };

    const handleClickModal = () => {
        setBtnModal(true);
        if (method === "") {
            alert('You must select a payment method.')
            setBtnModal(false);
            return;
        }

        if (payment <= 0) {
            alert('The payment amount must be greater than 0.')
            setBtnModal(false);
            return;
        }

        const data = {
            paymentId: paymentId,
            paymentMethod: method,
            paymentAmount: payment,
            saleId: sale.saleId
        }

        if (data.paymentAmount > sale.salePendingAmount) {
            alert('The payment amount cannot exceed the sale pending amount.')
            setBtnModal(false);
            return;
        }

        createPayment(data).then(() => {
            setPaymentId(uuidv4());
            searchSaleById(); // Reload data to view the payment
        });

        //close modal
        const modal = document.getElementById('addPaymentModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modal);
        if (modalInstance) modalInstance.hide();

        //reset form
        setMethod("");
        setPayment(0);
        setBtnModal(false);

    };

    const handleClickModalOpen = () => {
        setPayment(sale.salePendingAmount || 0);
        setMethod(methods[0].methodId.toString()); // Select first method by default
    };

    // Helper to format currency (for readability in JSX)
    const formatCurrency = (amount) => {
        return amount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || '$0';
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="container" style={{ marginTop: '80px' }}>
                <div className="card shadow-sm p-3 mb-4 rounded-3">

                    <h5 className="mb-3 text-success">
                        Detalle de la venta
                        {
                            isLoading && (
                                <div className="spinner-grow spinner-grow-sm text-success ms-3" role="status">

                                </div>
                            )
                        }
                    </h5>

                    <div className="row">

                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Número de venta:</span>
                            <span><strong>{sale?.saleNumber}</strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Fecha:</span>
                            <span><strong>{new Date(sale?.createdAt).toLocaleDateString('es-CL')}</strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Cliente:</span>
                            <span><strong>{sale.customer?.customerFirstName} {sale.customer?.customerLastName}</strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Vendedor:</span>
                            <span><strong>{sale.user?.userFirstName} {sale.user?.userLastName}</strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Total de Venta:</span>
                            <span className="text-success"><strong>
                                {formatCurrency(sale.saleTotal)}
                            </strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Pendiente:</span>
                            <span>
                                <strong> {formatCurrency(sale.salePendingAmount)}</strong>
                            </span>
                        </div>
                        <div className="col-md-12 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Observaciones: </span>
                            <span><strong> {sale?.saleObservation} </strong></span>
                        </div>
                    </div>
                </div>
                <hr />
                {/* --- PRODUCT DETAIL TABLE (HTML) --- */}
                <div className="row">
                    <h5>Detalle de productos y servicios</h5>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr >
                                    <th>Tipo</th>
                                    <th>SKU</th>
                                    <th>Nombre del producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>

                                </tr>
                            </thead>
                            <tbody>
                                {tableProductAndService?.map((ps) => (
                                    <tr key={ps.saleDetailId}>
                                        <td>
                                            {(ps.saleDetailType === 'PRODUCT' && 'Product')}
                                            {(ps.saleDetailType === 'SERVICE' && 'Service')}
                                        </td>
                                        <td>{ps.product?.productSKU} {ps.service?.serviceSKU}</td>
                                        <td>{ps.product?.productName} {ps.service?.serviceName}</td>
                                        <td className="text-center">{ps?.saleDetailQuantity}</td>
                                        <td className="text-end">{formatCurrency(ps?.saleDetailPrice)}</td>
                                        <td className="text-end">{formatCurrency(ps.saleDetailTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* --- PAYMENT DETAIL TABLE (HTML) --- */}
                <div className="row">
                    <h5>Detalle de Pagos</h5>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Metodo de pago</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tablaPayment?.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center">No hay pagos registrados</td>
                                        </tr>
                                    )

                                }
                                {
                                    tablaPayment?.map((payment) => (
                                        <tr key={payment.paymentId}>
                                            <td>
                                                {new Date(payment?.createdAt).toLocaleDateString('en-US')}
                                            </td>
                                            <td>
                                                {(() => {
                                                    switch (payment?.paymentMethod) {
                                                        case '0': return 'Tarjeta de Débito';
                                                        case '1': return 'Tarjeta de Crédito';
                                                        case '2': return 'Efectivo';
                                                        case '3': return 'Transferencia Bancaria';
                                                        default: return 'Método Desconocido';
                                                    }
                                                })()}
                                            </td>
                                            <td className="text-end">
                                                {formatCurrency(payment?.paymentAmount)}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {
                    !isLoading && (
                        <>
                            {/* --- ACTION BUTTONS --- */}
                            <div className="d-flex flex-wrap gap-2">

                                {/* 1. ABONAR BUTTON (MODAL TRIGGER) */}
                                <button
                                    type="button"
                                    className={`btn btn-success btn-sm ${sale.salePendingAmount === 0 ? 'disabled btn-secondary' : ''} text-center`}
                                    data-bs-toggle="modal"
                                    data-bs-target="#addPaymentModal"
                                    onClick={handleClickModalOpen}
                                    style={{ width: '200px' }}>
                                    <i className="bi bi-plus-lg me-1"></i> Agregar Abono
                                </button>

                                {/* 2. PDF DOWNLOAD BUTTON */}
                                <PDFDownloadLink
                                    document={
                                        <SimpleTestPDFContent
                                            sale={sale}
                                            tableProductAndService={tableProductAndService}
                                        />}
                                    fileName={`boleta-${sale.saleNumber}`}
                                >
                                    {({ loading }) => (

                                        <button className={`btn btn-warning btn-sm txt-secundary`} data-testid="download-pdf-button" style={{ width: '200px' }}>
                                            {loading ? 'Generando comprobante de venta ...' : (<><IconPrinter /> 'Descargar PDF'</>)}
                                        </button>

                                    )}
                                </PDFDownloadLink>

                                {/* 3. VOLVER BUTTON */}
                                <Link to="/sales" className="btn btn-secondary btn-sm" style={{ width: '200px' }}>
                                    <i className="bi bi-arrow-left-circle me-1"></i> Volver a Ventas
                                </Link>
                            </div>
                        </>
                    )
                }
            </div >

            {/* --- ADD PAYMENT MODAL --- */}
            <div className="modal fade" id="addPaymentModal" tabIndex="-1" aria-labelledby="addPaymentModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addPaymentModalLabel">+ Abonar </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body input-group">
                            <select
                                className="form-select form-select-sm w-50 py-0"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                            >
                                <option value="">Seleccionar Método de Pago</option>
                                {methods.map((m) => (
                                    <option key={m.methodId} value={m.methodId}>{m.methodName}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                step={1}
                                value={payment}
                                onChange={handleAmountChange}
                                className="form-control form-control-sm text-center"
                                style={{ width: "40%" }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" disabled={btnModal} data-bs-dismiss="modal" style={{ width: '120px' }}>Cerrar</button>
                            <button type="button" className="btn btn-success" disabled={btnModal} onClick={handleClickModal} style={{ width: '120px' }}>Agregar</button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedView>
    )
};