import NavBarComponent from "../../components/NavBarComponent";
import { getCustomers } from "../../api/customers.js"
import { getProductsAndServices } from "../../libs/productsAndServices.js"
import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import "./NewSalePage.css"
import CardRegisterPayments from "../../components/paymennts/CardRegisterPayments.jsx";
import NewCustomerModal from "../../components/modals/AddCustomerModal.jsx";
import formatName from "../../utils/formatName.js";
import { createSaleGeneral } from "../../utils/createSale.js";
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function NewSalePage() {
    const [saleId, setSaleId] = useState(uuidv4());
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [dataTable, setDataTable] = useState([{
        saleDetailId: uuidv4(),
        saleDetailSKU: '',
        saleDetailProductServiceId: undefined,
        saleDetailPrice: 0,
        saleDetailPriceFixed: true,
        saleDetailAmount: 1,
        saleDetailTotal: 0,
        saleDetailType: null,
    }]);
    const [dataSalePayments, setDataSalePayments] = useState([]);
    const [totalPayments, setTotalPayments] = useState(0);
    const [amountDue, setAmountDue] = useState(0);
    const [productsServices, setProductsServices] = useState([])
    const [total, setTotal] = useState(0);
    const [dataSale, setDataSale] = useState({
        saleId: saleId,
        saleComment: '',
        saleCustomerId: null,
        saleTotal: total,
        saleTotalPayments: totalPayments
    });
    const searchCustomers = async () => {
        try {
            const res = await getCustomers();
            setCustomers(res.data);
            return res.data;
        } catch (error) {
            console.log(error);
            return []
        }
    };
    const searchProductsServices = async () => {
        try {
            const res = await getProductsAndServices();
            setProductsServices(res);
            return res.data;
        } catch (error) {
            console.log(error);
            return []
        };
    };
    const newRow = () => {
        const itemSaleDetail = {
            saleDetailId: uuidv4(),
            saleDetailSKU: '',
            saleDetailProductServiceId: '',
            saleDetailPrice: 0,
            saleDetailAmount: 1,
            saleDetailTotal: 0,
            saleDetailType: null, // 'PRODUCT' or 'SERVICE'
            saleDetailPriceFixed: true,
        };
        setDataTable([...dataTable, itemSaleDetail]);
    };
    const handleDeleteRow = (idToRemove) => {
        setDataTable(prev => {
            const newDatatable = prev.filter(item => item.saleDetailId !== idToRemove);

            // Recalcular el total después de eliminar la fila
            const totalGeneral = newDatatable.reduce((sum, item) => sum + item.saleDetailTotal, 0);

            setTotal(totalGeneral);
            setDataSale({
                ...dataSale,
                saleTotal: totalGeneral
            });

            return newDatatable;
        });
    };
    const handleOnInput = (index, field, value) => {
        const rows = [...dataTable]
        rows[index][field] = value;
        const total = rows[index].saleDetailPrice * rows[index].saleDetailAmount
        // actualizar total de la fila
        rows[index].saleDetailTotal = Number(total);
        setDataTable(rows)
        // recalcular total general
        const totalGeneral = rows.reduce((sum, item) => sum + item.saleDetailTotal, 0);
        setTotal(totalGeneral);
    };
    const handleChangeSelect = (e, index) => {
        const value = e.target.value;
        const selectedProductService = productsServices.find(p => p.productId === value || p.serviceId === value);
        console.log('productFound', selectedProductService)
        if (selectedProductService) {
            const updatedDataTable = [...dataTable];
            updatedDataTable[index].saleDetailSKU = selectedProductService.productSKU || selectedProductService.serviceSKU || '';
            updatedDataTable[index].saleDetailProductServiceId = value;
            updatedDataTable[index].saleDetailPrice = selectedProductService.productPrice || selectedProductService.servicePrice || 0;
            updatedDataTable[index].saleDetailTotal = updatedDataTable[index].saleDetailPrice * updatedDataTable[index].saleDetailAmount;
            updatedDataTable[index].saleDetailType = selectedProductService.productId ? 'PRODUCT' : 'SERVICE';
            updatedDataTable[index].saleDetailPriceFixed = selectedProductService.productPriceFixed || selectedProductService.servicePriceFixed;
            setDataTable(updatedDataTable);
            console.log('Updated Data Table:', updatedDataTable);

            // Recalcular el total general
            const totalGeneral = updatedDataTable.reduce((sum, item) => sum + item.saleDetailTotal, 0);

            setTotal(totalGeneral);
        }
        handleOnInput(index, 'saleDetailProductServiceId', value);



    };
    const handleChangeCustomerSelect = (value) => {
        setDataSale({
            ...dataSale,
            saleCustomerId: value
        });
    };
    const handleCreated = async (customerCreatedId) => {
        // Actualizar la lista de clientes después de crear uno nuevo
        const updatedCustomers = await searchCustomers();
        setCustomers(updatedCustomers);
        // Dar tiempo a que React renderice la nueva lista antes de seleccionar
        setTimeout(() => {
            handleChangeCustomerSelect(customerCreatedId);
        }, 150);
    };
    const handlePayments = (totalPayments) => {
        setDataSalePayments(totalPayments);
        const total = totalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        setTotalPayments(total);
        calculateAmountDue();
    }
    const calculateAmountDue = () => {
        setDataSale({
            ...dataSale,
            saleTotal: total,
            saleTotalPayments: totalPayments
        });
        setAmountDue(total - totalPayments);
    }
    const showAlert = (message, text, icon) => {
        MySwal.fire({
            title: <p>{message}</p>,
            text: text,
            icon: icon,
            confirmButtonText: "OK"
        });
    };
    useEffect(() => {
        searchCustomers();
        searchProductsServices();
    }, []);
    useEffect(() => {
        calculateAmountDue();
        setDataSale({
            ...dataSale,
            saleTotal: total,
            saleTotalPayments: totalPayments

        });
    }, [totalPayments, total]);

    const handleSubmit = async () => {
        const res = await createSale()
        if (res) {
            showAlert('Venta nro 001', 'Venta registrada con exito', 'success');
            // se formatea el cliente
            setDataSale({
                ...dataSale,
                saleId: uuidv4(),
                saleCustomerId: '',
                saleTotal: total,
                saleTotalPayments: totalPayments
            });

            setSaleId(uuidv4());

            // e formatea la tabla de productos 
            setDataTable(
                [{
                    saleDetailId: uuidv4(),
                    saleDetailSKU: '',
                    saleDetailProductServiceId: undefined,
                    saleDetailPrice: 0,
                    saleDetailAmount: 1,
                    saleDetailTotal: 0,
                    saleDetailType: null,
                }]
            )
        }
    };
    const createSale = async () => {
        //Validaciones previas

        // validar que exista un usuario seleccionado 
        if (!dataSale.saleCustomerId) {
            const res = false;
            showAlert('Importante:', 'Es necesario seleccionar un cliente', 'error')
            return res;
        }

        // validad que exista un producto selecionado
        // validar que hayan productos 

        if (dataTable.length < 1) {
            const res = false;
            showAlert('Importante:', 'Es necesario seleccionar un producto', 'error')
            return res;

        }
        for (const data of dataTable) {
            if (!data.saleDetailProductServiceId && data.saleDetailAmount > 0) {
                const res = false;
                showAlert('Importante:', 'Es necesario seleccionar un producto', 'error')
                return res;
            }
            if (data.saleDetailProductServiceId && data.saleDetailAmount < 1) {
                const res = false;
                showAlert('Importante:', 'La cantidad de los productos no puede ser menor a 1', 'error')
                return res;

            }
        };

        try {
            // 🚀 Llamada al servicio/API
            const res = await createSaleGeneral(dataSale, dataTable, dataSalePayments);
            return res;
        } catch (error) {
            console.error('Error creating sale:', error);
            showAlert('Ocurrió un error', 'Intenta nuevamente más tarde', 'error');
        };


    };

    return (
        < div className="containerNewSale">
            <div className="row m-0 p-0 navBarRow">
                <NavBarComponent />
            </div>
            <div className="row p-2 m-0 customerRow">
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text" >Cliente: </span>
                        <select
                            id="saleCustomer"
                            name="saleCustomer"
                            value={dataSale.saleCustomerId || ''}
                            className="form-select form-select-sm"
                            onChange={(e) => { handleChangeCustomerSelect(e.target.value) }}>
                            <option value={null}>seleccionar cliente</option>
                            {
                                customers.map((c) => (
                                    <option key={c.customerId} value={c.customerId}>
                                        {c.customerFirstName}  {c.customerLastName}
                                    </option>
                                ))
                            }
                        </select>
                        <NewCustomerModal nameBottom={<i className="bi bi-plus-lg"></i>} title={'Registrar Cliente'} idModal="newCustomer" onCreated={handleCreated} />
                        <a
                            href={`/customers/${dataSale.saleCustomerId}`}
                            className="btn btn-warning w-10"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-eye"></i>
                        </a>
                    </div>
                </div>
                <div className="col-md-4">
                    <div>
                        Fecha: {new Date().toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            weekday: 'long',
                            year: 'numeric'
                        })}
                    </div>
                    <div>
                        Vendedor: {formatName(user.userFirstName) + ' ' + formatName(user.userLastName)}
                    </div>
                </div>
                <div className="col-md-3">
                </div>
            </div>
            <div className="row tableDetalle m-0 p-0 pt-2">
                <div className="table-responsibe">
                    <table className="table table-striped table-hover table-sm">
                        <colgroup>
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "5%", minWidth: "100px" }} />
                            <col style={{ width: "10%", minWidth: "100px" }} />
                            <col style={{ width: "35%", minWidth: "200px" }} />
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "10%", minWidth: "100px" }} />
                            <col style={{ width: "10%", minWidth: "100px" }} />
                            <col style={{ width: "5%" }} />
                        </colgroup>
                        <thead>
                            <tr className="table-success text-center">
                                <th>Nro</th>
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
                            {dataTable.map((d, index) => (
                                <tr key={d.saleDetailId}>
                                    <th scope="row" className="text-center"> {index + 1}</th>
                                    <td>
                                        <>
                                            {d.saleDetailType === 'PRODUCT' && (
                                                <span className="badge bg-success">Producto</span>
                                            )}
                                            {d.saleDetailType === 'SERVICE' && (
                                                <span className="badge bg-primary">Servicio</span>
                                            )}
                                        </>

                                    </td>
                                    <td className="text-center"> {d.saleDetailSKU}</td>
                                    <td>
                                        <select className="form-select inputSaleDetail p-0 ps-3" onChange={() => handleChangeSelect(event, index)}>
                                            <option className="p-0" value={null}>selecionar producto o servicio</option>
                                            {
                                                productsServices.map((p) => (

                                                    <option className="p-0" key={p.productId || p.serviceId} value={p.productId || p.serviceId}>
                                                        {p.productName || p.serviceName}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control inputSaleDetail text-center p-0"
                                            required
                                            value={d.saleDetailAmount || 1}
                                            onInput={(e) => handleOnInput(index, 'saleDetailAmount', e.target.value)}
                                        />
                                    </td>
                                    <td className="text-end pe-3">
                                        <input
                                            type="number"
                                            className="form-control inputSaleDetail text-end p-0"
                                            required
                                            value={d.saleDetailPrice || 0}
                                            onInput={(e) => handleOnInput(index, 'saleDetailPrice', e.target.value)}
                                            disabled={!!d.saleDetailPriceFixed} />
                                    </td>
                                    <td className="text-end pe-3">
                                        <b>
                                            {d.saleDetailTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </b>
                                    </td>
                                    <td className="text-center">
                                        <div className="row m-0 p-0 text-center px-2">
                                            <div className="col-6 p-0 text-center">
                                                <button
                                                    className="btn text-success text-center p-0"
                                                    title="descuento">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            </div>
                                            <div className="col-6 p-0 text-center">
                                                <button
                                                    className="btn text-danger text-center p-0"
                                                    title="eliminar"
                                                    onClick={() => handleDeleteRow(d.saleDetailId)}>
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-sm btn-success w-100" onClick={newRow}>
                        agregar
                    </button>
                </div>
            </div>
            <div className="row m-p p-0 actiones">
                <div className="ps-4">
                    <button className="btn btn-sm btn-success me-2" style={{ width: '120px' }} onClick={handleSubmit}>Generar</button>
                    <button className="btn btn-sm btn-secondary me-2" style={{ width: '120px' }}>Limpiar</button>
                    <button className="btn btn-sm btn-secondary me-2" style={{ width: '120px' }}>Buscar</button>
                    <button className="btn btn-sm btn-secondary me-2" style={{ width: '120px' }}>Guardar</button>
                </div>
            </div>
            <div className="row bg-secondary m-0 p-0 footerRow">
                <div className="col-4 m-0 p-1 h-100">
                    <textarea
                        name="saleComment"
                        className="form-control"
                        placeholder="Comentarios"
                        value={dataSale.saleComment || ''}
                        onChange={(e) => setDataSale({ ...dataSale, saleComment: e.target.value })}
                    />
                </div>
                <div className="col-5 p-1">
                    <CardRegisterPayments sendPayments={handlePayments} />
                </div>
                <div className="col-3 p-1">
                    <div className="row">
                        <div className="w-100">
                            <div className="row">
                                <div className="col-6 text-end">Total</div>
                                <div className="col-6 text-end text-warning">
                                    <b>{total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</b>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 text-end">
                                    Abonado
                                </div>
                                <div className="col-6 text-end">
                                    <b>{totalPayments.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</b>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 text-end">
                                    Por Cobrar
                                </div>
                                <div className="col-6 text-end text-danger">
                                    {amountDue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}