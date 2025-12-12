import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import { getCustomers } from "../../api/customers.js"
import { getProductsAndServices } from "../../libs/productsAndServices.js"
import { useAuth } from "../../context/authContext.jsx";
import { useEffect, useState } from "react";
import CardRegisterPayments from "../../components/paymennts/CardRegisterPayments.jsx";
import NewCustomerModal from "../../components/modals/AddCustomerModal.jsx";
import formatName from "../../utils/formatName.js";
import { createSaleGeneral } from "../../utils/createSale.js";
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUserPlus, FaCalendarAlt, FaUserTie, FaSave, FaSearch } from "react-icons/fa";

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
    const [isLoading, setIsLoading] = useState(false);
    
    // Derived state for formatted date
    const todayDate = new Date().toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
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
            saleDetailType: null, 
            saleDetailPriceFixed: true,
        };
        setDataTable([...dataTable, itemSaleDetail]);
    };
    const handleDeleteRow = (idToRemove) => {
        setDataTable(prev => {
            const newDatatable = prev.filter(item => item.saleDetailId !== idToRemove);
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
        rows[index].saleDetailTotal = Number(total);
        setDataTable(rows)
        const totalGeneral = rows.reduce((sum, item) => sum + item.saleDetailTotal, 0);
        setTotal(totalGeneral);
    };
    const handleChangeSelect = (e, index) => {
        const value = e.target.value;
        const selectedProductService = productsServices.find(p => p.productId === value || p.serviceId === value);
        if (selectedProductService) {
            const updatedDataTable = [...dataTable];
            updatedDataTable[index].saleDetailSKU = selectedProductService.productSKU || selectedProductService.serviceSKU || '';
            updatedDataTable[index].saleDetailProductServiceId = value;
            updatedDataTable[index].saleDetailPrice = selectedProductService.productPrice || selectedProductService.servicePrice || 0;
            updatedDataTable[index].saleDetailTotal = updatedDataTable[index].saleDetailPrice * updatedDataTable[index].saleDetailAmount;
            updatedDataTable[index].saleDetailType = selectedProductService.productId ? 'PRODUCT' : 'SERVICE';
            updatedDataTable[index].saleDetailPriceFixed = selectedProductService.productPriceFixed || selectedProductService.servicePriceFixed;
            setDataTable(updatedDataTable);
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
        const updatedCustomers = await searchCustomers();
        setCustomers(updatedCustomers);
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
            title: <p className="text-lg font-bold">{message}</p>,
            text: text,
            icon: icon,
            confirmButtonText: "Entendido",
            customClass: {
                confirmButton: 'bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700'
            },
            buttonsStyling: false
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
        setIsLoading(true)
        const res = await createSale()
        if (res) {
            showAlert(`Nro de Venta ${res.dataSale.saleNumber}`, 'La venta se ha registrado correctamente.', 'success');
            // Reset states
            setDataSale({
                saleId: uuidv4(),
                saleComment: '',
                saleCustomerId: null,
                saleTotal: 0,
                saleTotalPayments: 0
            });
            setSaleId(uuidv4());
            setDataTable([{
                saleDetailId: uuidv4(),
                saleDetailSKU: '',
                saleDetailProductServiceId: undefined,
                saleDetailPrice: 0,
                saleDetailAmount: 1,
                saleDetailTotal: 0,
                saleDetailType: null,
                saleDetailPriceFixed: true,
            }]);
            setTotal(0);
            setTotalPayments(0);
            setAmountDue(0);
            setDataSalePayments([]);
            setIsLoading(false)
        }
    };
    const createSale = async () => {
        if (!dataSale.saleCustomerId) {
            showAlert('Cliente Requerido', 'Por favor selecciona un cliente para continuar.', 'error')
            setIsLoading(false)
            return false;
        }

        if (dataTable.length < 1) {
            showAlert('Sin Productos', 'Debes agregar al menos un producto o servicio.', 'error')
            setIsLoading(false)
            return false;
        }

        for (const data of dataTable) {
            if (!data.saleDetailProductServiceId && data.saleDetailAmount > 0) {
                showAlert('Producto Incompleto', 'Hay filas sin producto seleccionado.', 'error')
                setIsLoading(false)
                return false;
            }
            if (data.saleDetailProductServiceId && data.saleDetailAmount < 1) {
                showAlert('Cantidad Inválida', 'La cantidad debe ser al menos 1.', 'error')
                setIsLoading(false)
                return false;
            }
        };

        try {
            const res = await createSaleGeneral(dataSale, dataTable, dataSalePayments);
            return res;
        } catch (error) {
            console.error('Error creating sale:', error);
            showAlert('Error', 'No se pudo registrar la venta. Inténtalo de nuevo.', 'error');
            setIsLoading(false)
            return false;
        };
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="flex flex-col h-screen bg-gray-100 overflow-hidden pt-[60px]"> {/* Main Layout Container */}
                
                {/* 1. Top Section: Customer & Info */}
                <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm flex-none z-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                        
                        {/* Customer Selection */}
                        <div className="flex-1 max-w-2xl bg-gray-50 p-1.5 rounded-lg border border-gray-200 flex items-center gap-2">
                             <div className="flex-1 relative">
                                <select
                                    id="saleCustomer"
                                    className="w-full bg-transparent border-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer pl-2 py-1.5"
                                    value={dataSale.saleCustomerId || ''}
                                    onChange={(e) => handleChangeCustomerSelect(e.target.value)}
                                >
                                    <option value="">Seleccionar Cliente...</option>
                                    {customers.map((c) => (
                                        <option key={c.customerId} value={c.customerId}>
                                            {c.customerFirstName} {c.customerLastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
                                <NewCustomerModal 
                                    trigger={
                                        <button className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors" title="Registrar Cliente">
                                            <FaUserPlus className="text-lg" />
                                        </button>
                                    }
                                    title={'Registrar Cliente'} 
                                    onCreated={handleCreated} 
                                />
                                {dataSale.saleCustomerId && (
                                    <a
                                        href={`/customers/${dataSale.saleCustomerId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Ver Ficha Cliente"
                                    >
                                        <FaSearch className="text-xs" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Metadata Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                <FaCalendarAlt className="text-emerald-500" />
                                <span className="font-semibold text-gray-700">{todayDate}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                <FaUserTie className="text-blue-500" />
                                <span className="font-medium">{formatName(user?.userFirstName)} {formatName(user?.userLastName)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Middle Section: Dynamic Grid Table */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-100/50">
                    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[300px]">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-2 text-center w-10">#</th>
                                        <th className="p-2 w-20 text-center">Tipo</th>
                                        <th className="p-2 w-24">SKU</th>
                                        <th className="p-2">Producto / Servicio</th>
                                        <th className="p-2 w-20 text-center">Cant.</th>
                                        <th className="p-2 w-28 text-end">Precio</th>
                                        <th className="p-2 w-28 text-end">Total</th>
                                        <th className="p-2 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence initial={false}>
                                        {dataTable.map((d, index) => (
                                            <Motion.tr 
                                                key={d.saleDetailId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="hover:bg-gray-50 transition-colors group"
                                            >
                                                <td className="p-2 text-center text-gray-400 font-mono text-[10px]">{index + 1}</td>
                                                <td className="p-2 text-center">
                                                    {d.saleDetailType === 'PRODUCT' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">PROD</span>
                                                    )}
                                                    {d.saleDetailType === 'SERVICE' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">SERV</span>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={d.saleDetailSKU} 
                                                        className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-mono text-gray-500 p-0"
                                                        placeholder="N/A"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <select 
                                                        className="w-full text-xs border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm py-1"
                                                        onChange={(e) => handleChangeSelect(e, index)}
                                                        value={d.saleDetailProductServiceId || ''}
                                                    >
                                                        <option value="">Seleccionar Item...</option>
                                                        {productsServices.map((p) => (
                                                            <option key={p.productId || p.serviceId} value={p.productId || p.serviceId}>
                                                                {p.productName || p.serviceName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full text-center border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500 text-xs shadow-sm py-1"
                                                        value={d.saleDetailAmount}
                                                        onInput={(e) => handleOnInput(index, 'saleDetailAmount', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        className={`w-full text-end border-gray-200 rounded focus:ring-emerald-500 focus:border-emerald-500 text-xs shadow-sm py-1 ${d.saleDetailPriceFixed ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                                        value={d.saleDetailPrice}
                                                        onInput={(e) => handleOnInput(index, 'saleDetailPrice', e.target.value)}
                                                        disabled={d.saleDetailPriceFixed}
                                                    />
                                                </td>
                                                <td className="p-2 text-end font-bold text-gray-800 text-xs">
                                                    {d.saleDetailTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        className="size-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                        onClick={() => handleDeleteRow(d.saleDetailId)}
                                                        title="Eliminar fila"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </td>
                                            </Motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Add Row Button */}
                        <div className="p-1 border-t border-gray-200 bg-gray-50">
                            <button 
                                onClick={newRow}
                                className="w-full py-1.5 border border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-medium text-xs"
                            >
                                <FaPlus className="text-[10px]" /> Agregar Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Footer Section: Totals, Actions & Payments */}
                <div className="bg-white border-t border-gray-200 shadow-lg flex-none z-20">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row h-auto lg:h-40">
                        
                        {/* Left: Comments */}
                        <div className="lg:w-1/4 p-3 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Comentarios</label>
                            <textarea
                                className="w-full flex-1 bg-gray-50 border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-xs resize-none p-2"
                                placeholder="Notas adicionales..."
                                value={dataSale.saleComment || ''}
                                onChange={(e) => setDataSale({ ...dataSale, saleComment: e.target.value })}
                            />
                        </div>

                        {/* Middle: Payments Component */}
                        <div className="flex-1 p-3 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col min-h-[120px]">
                             <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Pagos</label>
                             <div className="flex-1 overflow-hidden">
                                <CardRegisterPayments sendPayments={handlePayments} />
                             </div>
                        </div>

                        {/* Right: Summary & Actions */}
                        <div className="lg:w-1/4 p-3 bg-gray-50 flex flex-col justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-500 text-xs">Total</span>
                                    <span className="text-lg font-bold text-gray-900">{total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-600 font-medium">Abonado</span>
                                    <span className="font-semibold text-emerald-600">{totalPayments.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-1 mt-1">
                                    <span className="text-red-500 font-medium">Pendiente</span>
                                    <span className="font-bold text-red-500">{amountDue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-transform active:scale-95 shadow-sm flex items-center justify-center gap-2 font-bold text-sm"
                                disabled={isLoading}
                            >
                                <FaSave /> {
                                    isLoading ? (
                                        <span className="ml-2">Guardando...</span>
                                    ) : (
                                        <span className="ml-2">Finalizar Venta</span>
                                    )
                                }
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </ProtectedView>
    )
}