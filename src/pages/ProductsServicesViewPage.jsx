import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaEye, FaArrowLeft, FaChartLine, FaHistory, FaLayerGroup, FaMoneyBillWave, FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import { getProductWithAnalyticsRequest } from "../api/product";
import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";
import { useToast } from "../context/ToastContext";

export default function ProductsServicesViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [salesHistory, setSalesHistory] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 10
    });
    
    const [kpis, setKpis] = useState({
        totalSold: 0,
        unitsSold: 0,
        frequency: 0
    });
    
    const [chartData, setChartData] = useState([]);

    const fetchProductData = async (page = 1) => {
        if (!product) {
            setLoading(true);
        } else {
            setTableLoading(true);
        }
        try {
            const res = await getProductWithAnalyticsRequest(id, page); 
           
            const { product, analytics, history, pagination: pagingData, chartSourceData } = res.data;   

            setProduct(product);
            setKpis(analytics);
            setSalesHistory(history);
            setPagination(pagingData);

            // Chart Data Generation (Using Global Chart Source Data for last 6 months)
            if (chartSourceData && chartSourceData.length > 0) {
                 const monthlyData = {};    
                 
                 // Process global data
                 chartSourceData.forEach(item => {
                    const date = new Date(item.createdAt);
                    // Check if valid date
                    if (!isNaN(date.getTime())) {
                        const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                        if (!monthlyData[key]) monthlyData[key] = 0;
                        monthlyData[key] += Number(item.saleDetailTotal) || 0;
                    }
                });
                
                 const formattedChartData = Object.entries(monthlyData).map(([name, value]) => ({
                    name,
                    value
                }));
                // Chart source data is ordered asc in backend, but map might mess order if keys differ.
                // Usually objects don't guarantee order, but JS preserves insertion order for strings.
                // To be safe, we might mostly rely on backend order, but aggregation by Month combines them.
                // Since we want standard time order, let's trust the insertion order (oldest to newest).
                
                setChartData(formattedChartData);
            } else {
                setChartData([]);
            }

            setLoading(false);
            setTableLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudo cargar la información del producto.");
            navigate('/products_services');
        }
    };

    useEffect(() => {
        if (id) fetchProductData(1);
    }, [id]);

    const handlePageChange = (newPage) => {
        fetchProductData(newPage);
    };

    // Columns Definition
    const columns = useMemo(() => [
        {
            header: 'Fecha',
            accessorKey: 'saleDetailCreatedAt',
            cell: info => formatDate(info.getValue()),
        },
        {
            header: 'Venta ID',
            accessorKey: 'saleNumber',
            cell: info => <span className="text-gray-500 font-medium">#{info.getValue()}</span>,
        },
        {
            header: 'Cliente',
            accessorKey: 'customerName',
            cell: info => <span className="text-dark font-medium">{info.getValue()}</span>,
        },
        {
            header: 'Cantidad',
            accessorKey: 'saleDetailQuantity',
            cell: info => <span className="text-gray-600">{info.getValue()}</span>,
        },
        {
            header: 'Precio Unit.',
            accessorKey: 'saleDetailPrice',
            cell: info => formatCurrency(info.getValue()),
        },
        {
            header: 'Total',
            accessorKey: 'saleDetailTotal',
            cell: info => <span className="text-primary font-bold">{formatCurrency(info.getValue())}</span>,
        },
        {
            header: 'Acciones',
            accessorKey: 'saleId',
            cell: info => (
                <Link 
                    to={`/sales/view/${info.getValue()}`} 
                    className="p-2 text-secondary hover:bg-blue-50 rounded-lg transition-colors inline-block"
                >
                    <FaEye />
                </Link>
            ),
        }
    ], []);

    const table = useReactTable({
        data: salesHistory,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: pagination.pages,
    });

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </ProtectedView>
    );

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 mt-[35px] font-sans">
                <Motion.div 
                    className="max-w-7xl mx-auto space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header & Navigation */}
                    <Motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <button 
                                onClick={() => navigate('/products_services')}
                                className="flex items-center gap-2 text-gray-400 hover:text-dark transition-colors mb-2 text-sm font-medium"
                            >
                                <FaArrowLeft /> Volver al catálogo
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold text-dark font-display tracking-wide">
                                {product?.productName}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                    SKU: {product?.productSKU}
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                    <FaLayerGroup /> {product?.category?.categoryName || 'Sin Categoría'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-6 shadow-sm">
                           <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Precio Actual</p>
                                <p className="text-2xl font-bold text-dark font-display">
                                    {formatCurrency(product?.productPrice)}
                                </p>
                           </div>
                           <div className="w-px h-10 bg-gray-200"></div>
                           <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Stock</p>
                                <p className={`text-2xl font-bold font-display ${product?.productStock > 10 ? 'text-primary' : 'text-amber-500'}`}>
                                    {product?.productStock}
                                </p>
                           </div>
                        </div>
                    </Motion.div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KPIs */}
                        <Motion.div variants={itemVariants} className="space-y-4">
                            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-semibold">Total Vendido</p>
                                        <h3 className="text-2xl font-bold text-dark">{formatCurrency(kpis?.totalSold)}</h3>
                                    </div>
                                    <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                                        <FaMoneyBillWave size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-semibold">Unidades Vendidas</p>
                                        <h3 className="text-2xl font-bold text-dark">{kpis?.unitsSold}</h3>
                                    </div>
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <FaShoppingCart size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-semibold">Transacciones</p>
                                        <h3 className="text-2xl font-bold text-dark">{kpis?.frequency}</h3>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                                        <FaHistory size={20} />
                                    </div>
                                </div>
                            </div>
                        </Motion.div>

                        {/* Chart */}
                        <Motion.div variants={itemVariants} className="md:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm relative">
                            <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2 font-display">
                                <FaChartLine className="text-primary" /> Tendencia de Ventas (Reciente)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#01c676" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#01c676" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#01c676', fontWeight: 600 }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#01c676" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Motion.div>
                    </div>

                    {/* History Table */}
                    <Motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-dark flex items-center gap-2 font-display">
                                <FaHistory className="text-gray-400" /> Historial de Transacciones
                            </h3>
                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
                                Total: {pagination.total} registros
                            </span>
                        </div>
                        <div className={`overflow-x-auto relative ${tableLoading ? 'opacity-60' : ''}`}>
                            {tableLoading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex justify-center items-start pt-20">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-4 font-semibold tracking-wider">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">
                                                No hay historial de ventas para este producto.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors text-sm group">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {pagination.pages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                                <div className="text-sm text-gray-500">
                                    Página <span className="font-medium text-dark">{pagination.currentPage}</span> de <span className="font-medium text-dark">{pagination.pages}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                                            pagination.currentPage === 1 
                                            ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-dark shadow-sm'
                                        }`}
                                    >
                                        <FaChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.pages}
                                        className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                                            pagination.currentPage === pagination.pages 
                                            ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-dark shadow-sm'
                                        }`}
                                    >
                                        <FaChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </Motion.div>
                </Motion.div>
            </div>
        </ProtectedView>
    );
}
