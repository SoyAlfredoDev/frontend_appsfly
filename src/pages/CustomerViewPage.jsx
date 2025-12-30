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
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaHistory, FaCreditCard, FaArrowLeft, FaEdit, FaPhone, FaIdCard, FaEnvelope } from 'react-icons/fa';

import AddCustomerModal from '../components/modals/AddCustomerModal.jsx';

export default function CustomerViewPage() {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [sales, setSales] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const methodsPaymets = [
        { methodId: '0', methodName: 'Tarjeta de Débito' },
        { methodId: '1', methodName: 'Tarjeta de Crédito' },
        { methodId: '2', methodName: 'Efectivo' },
        { methodId: '3', methodName: 'Transferencia Bancaria' },
    ];

    const getData = async () => {
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
        getData();
    }, [id]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />

            <Motion.div 
                className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* TÍTULO Y BOTONES SUPERIORES */}
                    <Motion.div 
                        variants={itemVariants}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaUser className="text-emerald-600" />
                                Detalles del Cliente
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Información completa y registros asociados</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/customers')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                            >
                                <FaArrowLeft /> Volver
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm text-sm font-medium"
                            >
                                <FaEdit /> Editar
                            </button>
                        </div>
                    </Motion.div>

                    {/* CARD DE INFORMACIÓN GENERAL */}
                    <Motion.div 
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-2">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Columna 1: Info Principal */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Nombre Completo</label>
                                        <div className="text-lg font-medium text-gray-900">
                                            {loading ? (
                                                <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
                                            ) : (
                                                <>
                                                    {formatName(customer?.customerFirstName)} {formatName(customer?.customerLastName)}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                            <FaIdCard className="text-gray-400" /> Documento
                                        </label>
                                        <div className="text-gray-700">
                                            {loading ? <div className="h-5 w-24 bg-gray-100 rounded animate-pulse"></div> : customer?.customerDocumentNumber}
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 2: Contacto */}
                                <div className="space-y-4">
                                     <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                            <FaPhone className="text-gray-400" /> Teléfono
                                        </label>
                                        <div className="text-gray-700">
                                            {loading ? <div className="h-5 w-24 bg-gray-100 rounded animate-pulse"></div> : customer?.customerPhoneNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                            <FaEnvelope className="text-gray-400" /> Email
                                        </label>
                                        <div className="text-gray-700">
                                            {loading ? <div className="h-5 w-24 bg-gray-100 rounded animate-pulse"></div> : customer?.customerEmail}
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 3: Avatar Placeholder */}
                                <div className="flex justify-center md:justify-end">
                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex flex-col items-center justify-center text-gray-400 border-4 border-white shadow-lg">
                                        <FaUser size={40} className="mb-2" />
                                        <span className="text-xs font-medium">SIN FOTO</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* HISTORIAL DE VENTAS */}
                        <Motion.div 
                            variants={itemVariants}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FaHistory className="text-blue-500" /> Historial de Ventas
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{sales.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Nro Venta</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sales.length === 0 ? (
                                            <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No hay ventas registradas</td></tr>
                                        ) : (
                                            sales.map(sale => (
                                                <tr key={sale?.saleId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-600">{formatDate(sale?.createdAt)}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">#{sale?.saleNumber}</td>
                                                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(sale?.saleTotal)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            sale?.salePendingAmount > 0 
                                                            ? 'bg-amber-100 text-amber-700' 
                                                            : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {sale?.salePendingAmount > 0 ? 'Pendiente' : 'Pagado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Motion.div>

                        {/* HISTORIAL DE PAGOS */}
                        <Motion.div 
                            variants={itemVariants}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FaCreditCard className="text-purple-500" /> Historial de Pagos
                                </h3>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{payments.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Venta</th>
                                            <th className="px-4 py-3">Monto</th>
                                            <th className="px-4 py-3">Método</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.length === 0 ? (
                                            <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No hay pagos registrados</td></tr>
                                        ) : (
                                            payments.map(payment => (
                                                <tr key={payment?.paymentId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-600">{formatDate(payment?.createdAt)}</td>
                                                    <td className="px-4 py-3 text-gray-800">#{payment?.Sale?.saleNumber}</td>
                                                    <td className="px-4 py-3 text-emerald-600 font-semibold">{formatCurrency(payment?.paymentAmount)}</td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                                        {methodsPaymets.find(method => method.methodId === payment?.paymentMethod)?.methodName || 'Desconocido'}
                                                        <div className="text-gray-400 text-[10px] mt-0.5">
                                                                {[payment?.user?.userFirstName, payment?.user?.userLastName]
                                                                .map(formatName)
                                                                .filter(Boolean)
                                                                .join(" ")
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Motion.div>
                    </div>

                    <AddCustomerModal
                        title={'Editar Cliente'}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        customerToEdit={customer}
                        onCreated={getData}
                    />
                </div>
            </Motion.div>
        </ProtectedView>
    );
}
