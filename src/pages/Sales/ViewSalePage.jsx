import NavBarComponent from "../../components/NavBarComponent"
import { v4 as uuidv4 } from 'uuid';
import { getSaleById } from '../../api/sale.js'
import { getSaleDetailById } from '../../api/saleDetail.js'
import { getPaymentBySaleId } from '../../api/payment.js'
import { useEffect, useState } from "react"
import { useParams, Link } from 'react-router-dom'
import IconComponent from "../../components/IconComponent.jsx"
import { createPayment } from '../../api/payment.js'

//import { formatName } from '../../utils/formatName.js'

export default function ViewSalePage() {
    const [sale, setSale] = useState({});
    const [tableProductAndService, setTableProductAndService] = useState([]);
    const [tablaPayment, setTablaPayment] = useState([])
    const { id } = useParams();
    const [paymentId, setPaymentId] = useState(uuidv4());
    const [method, setMethod] = useState("");
    const [payment, setPayment] = useState(0);
    const [btnModal, setBtnModal] = useState(false);
    useEffect(() => {
        searchSaleById();
        setPayment(sale.salePendingAmount);
    }, []);
    const handleAmountChange = (e) => {
        if (e.target.value > sale.salePendingAmount) {
            alert('El monto del abono no puede ser mayor al monto pendiente de la venta.')
        }
        setPayment(Number(e.target.value))
    };
    const searchSaleById = async () => {
        try {
            const data = await getSaleById(id);
            const saleDetailData = await getSaleDetailById(id);
            const payments = await getPaymentBySaleId(id)
            setSale(data.data);
            setTableProductAndService(saleDetailData.data);
            setTablaPayment(payments.data)
        } catch (error) {
            console.log(error);
        }
    };

    const methods = [
        { methodId: 0, methodName: 'Tarjeta de Débito' },
        { methodId: 1, methodName: 'Tarjeta de Crédito' },
        { methodId: 2, methodName: 'Efectivo' },
        { methodId: 3, methodName: 'Transferencia Bancaria' },
    ];

    const handleClickModal = () => {
        setBtnModal(true);
        if (method === "") {
            alert('Debe seleccionar un método de pago.')
            setBtnModal(false);
            return;
        }

        if (payment <= 0) {
            alert('El monto del abono debe ser mayor a 0.')
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
            alert('El monto del abono no puede ser mayor al monto pendiente de la venta.')
            return;
        }
        createPayment(data)
        setPaymentId(uuidv4())

        //close modal
        const modal = document.getElementById('addPaymentModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        //reset form
        setMethod("");
        setPayment(0);
        setBtnModal(false);

    };

    const handleClickModalOpen = () => {
        setPayment(sale.salePendingAmount);
        setMethod(0);
    };
    return (
        <>
            <NavBarComponent />
            <div className="container" style={{ marginTop: '80px' }}>
                <div className="card shadow-sm p-3 mb-4 rounded-3">

                    <h5 className="mb-3 text-success">Detalle de Venta</h5>

                    <div className="row">

                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Id:</span>
                            <span><strong>{sale?.saleId}</strong></span>
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
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Total Venta:</span>
                            <span className="text-success"><strong>
                                {sale.saleTotal?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}

                            </strong></span>
                        </div>
                        <div className="col-md-6 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Por Cobrar:</span>
                            <span>
                                <strong> {sale.salePendingAmount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                            </span>
                        </div>
                        <div className="col-md-12 mb-2 d-flex">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>Observaciones: </span>
                            <span><strong>  </strong></span>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <h3>Detalle de venta</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr >
                                    <th>Tipo</th>
                                    <th>SKU</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableProductAndService?.map((ps) => (
                                    <tr key={ps.saleDetailId}>
                                        <td>
                                            {(ps.saleDetailType === 'PRODUCT' && 'Producto')}
                                            {(ps.saleDetailType === 'SERVICE' && 'Servicio')}
                                        </td>
                                        <td>{ps.product?.productSKU} {ps.service?.serviceSKU}</td>
                                        <td>{ps.product?.productName} {ps.service?.serviceName}</td>
                                        <td className="text-center">{ps?.saleDetailQuantity}</td>
                                        <td className="text-end">{ps?.saleDetailPrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                        <td className="text-end">{ps.saleDetailTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                        <td className="text-center">
                                            <Link className="btn btn-sm btn-success">
                                                O
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <h3>Detalle de pagos y abonos</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Metodo de Pago</th>
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
                                                {new Date(payment?.createdAt).toLocaleDateString('es-CL')}
                                            </td>
                                            <td>
                                                {(() => {
                                                    switch (payment?.paymentMethod) {
                                                        case '0': return 'Tarjeta de Débito';
                                                        case '1': return 'Tarjeta de Crédito';
                                                        case '2': return 'Efectivo';
                                                        case '3': return 'Transferencia Bancaria';
                                                        default: return 'Método desconocido';
                                                    }
                                                })()}
                                            </td>
                                            <td className="text-end">
                                                {
                                                    payment?.paymentAmount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>


                    </div>
                </div>
                <div className="row ">
                    <IconComponent
                        ico='printer'
                        title='Imprimir'
                        type='btn'
                        size='sm'
                    />

                    <button
                        type="button"
                        className={`btn btn-success btn-sm m-1 ${sale.salePendingAmount === 0 ? 'disabled btn-secondary' : ''} text-center `}
                        data-bs-toggle="modal"
                        data-bs-target="#addPaymentModal"
                        onClick={handleClickModalOpen}
                        style={{ maxWidth: '200px' }}>
                        <i className="bi bi-plus-lg me-1"></i> Abonar
                    </button>

                    <IconComponent
                        ico='back'
                        title='Volver'
                        type='link'
                        size='sm'
                    />
                </div>
            </div >

            <> {/*modal*/}
                <div className="modal fade" id="addPaymentModal" tabIndex="-1" aria-labelledby="addPaymentModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="addPaymentModalLabel">Agregar Abono</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>

                            <div className="modal-body input-group">
                                <select
                                    className="form-select form-select-sm w-50 py-0"
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                >
                                    <option value="">Seleccionar método de pago</option>
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
            </>
        </>
    )
};
