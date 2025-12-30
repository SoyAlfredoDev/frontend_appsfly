import CategoryModal from "../components/modals/CategoryModal.jsx";
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import { getCategories } from "../api/category";
import { getProductsAndServices } from "../libs/productsAndServices";
import { useEffect, useState } from "react";
import AddProductModal from "../components/modals/AddProductModal";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaEye, FaSort, FaSortUp, FaSortDown, FaSearch, FaBox, FaFilter } from "react-icons/fa";

export default function ProductsServicesPage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // ➡️ ESTADOS PRINCIPALES DE DATOS
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    // Estados para filtros
    const [showProducts, setShowProducts] = useState(true);
    const [showServices, setShowServices] = useState(true);
    const [activeCategories, setActiveCategories] = useState({});

    // Cargar productos y servicios
    const fetchProducts = async () => {
        try {
            const resProductsAndServices = await getProductsAndServices();
            const loadedProducts = resProductsAndServices ?? [];
            setAllProducts(loadedProducts);
            setDisplayedProducts(loadedProducts);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    // Cargar categorías
    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            const data = res?.data ?? [];
            setCategories(data);
            // Crear mapa { categoriaID: true }
            const initialCategoriesState = data.reduce((acc, c) => {
                acc[c.categoryId] = true;
                return acc;
            }, {});
            setActiveCategories(initialCategoriesState);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // ➡️ APLICAR FILTROS
    useEffect(() => {
        let filtered = allProducts;
        // 1. FILTRAR POR TIPO
        filtered = filtered.filter(item => {
            if (!showProducts && item.type === "PRODUCT") return false;
            if (!showServices && item.type === "SERVICE") return false;
            return true;
        });
        // 2. FILTRAR POR CATEGORÍA
        filtered = filtered.filter(item => {
            const categoryId = item?.category?.categoryId;
            if (categoryId) {
                return activeCategories[categoryId] === true;
            }
            return true;
        });
        setDisplayedProducts(filtered);
    }, [showProducts, showServices, activeCategories, allProducts]);

    const columns = [
        {
            header: "Producto",
            accessorFn: row => (row?.productName || row?.serviceName) ?? "",
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
        },
        {
            header: "SKU",
            accessorFn: row => (row?.productSKU || row?.serviceSKU) ?? "",
            cell: info => <span className="text-gray-500 font-mono text-xs">{info.getValue()}</span>
        },
        {
            header: "Tipo",
            accessorFn: row => row?.type ?? "",
            cell: info => {
                const value = info.getValue();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        value === "PRODUCT" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                        {value === "PRODUCT" ? "Producto" : "Servicio"}
                    </span>
                );
            }
        },
        {
            header: "Categoría",
            accessorFn: row => row?.category?.categoryName ?? "",
            cell: info => <span className="text-gray-600 text-sm">{info.getValue()}</span>
        },
        {
            header: "Precio",
            accessorFn: row => row?.productPrice ?? row?.servicePrice ?? "",
            cell: info => {
                const price = info.getValue();
                const safePrice = Number(price) || 0;
                return (
                    <span className="font-medium text-emerald-600">
                        {safePrice.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                    </span>
                );
            }
        },
        {
            header: "Acciones ",
            accessorFn: row => row?.productId ?? "",
            cell: info => {
                const productId = info.getValue();
                return (
                    <Link 
                        to={`/products/${productId}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                        title="Ver Detalles"
                    >
                        <FaEye />
                    </Link>
                );
            }
        }
    ];

    const table = useReactTable({
        data: displayedProducts,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                <Motion.div 
                    className="max-w-7xl mx-auto space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaBox className="text-emerald-600" />
                                Productos y Servicios
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Gestión de inventario y catálogo de servicios</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={globalFilter ?? ""}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    placeholder="Buscar por nombre o SKU..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64"
                                />
                            </div>
                            <AddProductModal title="Nuevo Item" onCreated={fetchProducts} />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filters */}
                        <div className="lg:w-64 flex-shrink-0 space-y-6">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold border-b border-gray-100 pb-2">
                                    <FaFilter className="text-emerald-600" />
                                    <h2>Filtros</h2>
                                </div>
                                
                                {/* Filtros de Tipo */}
                                <div className="space-y-3 mb-6">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</h3>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showProducts}
                                            onChange={e => setShowProducts(e.target.checked)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">Productos</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showServices}
                                            onChange={e => setShowServices(e.target.checked)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">Servicios</span>
                                    </label>
                                </div>

                                {/* Filtros de Categoría */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorías</h3>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {categories.map(cat => {
                                            const allowed =
                                                cat.allowedFor === "BOTH" ||
                                                (cat.allowedFor === "PRODUCTS" && showProducts) ||
                                                (cat.allowedFor === "SERVICES" && showServices);

                                            if (!allowed) return null;

                                            return (
                                                <label key={cat.categoryId} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={activeCategories[cat.categoryId] ?? true}
                                                        onChange={e => setActiveCategories(prev => ({ ...prev, [cat.categoryId]: e.target.checked }))}
                                                        className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                    />
                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate" title={cat.categoryName}>
                                                        {cat.categoryName}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <CategoryModal onCategoryAdded={fetchCategories} />
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th
                                                        key={header.id}
                                                        className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            <span className="text-gray-400">
                                                                {{
                                                                    asc: <FaSortUp />,
                                                                    desc: <FaSortDown />,
                                                                }[header.column.getIsSorted()] ?? <FaSort className="opacity-0 group-hover:opacity-50" />}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-3">
                                                            <div className="animate-spin h-8 w-8 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                                                            <p className="text-gray-500 text-sm">Cargando catálogo...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : table.getRowModel().rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <FaBox className="text-4xl text-gray-300" />
                                                            <p>No hay registros coincidentes.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                table.getRowModel().rows.map(row => (
                                                    <Motion.tr
                                                        key={row.id}
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                        layout
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        {row.getVisibleCells().map(cell => (
                                                            <td key={cell.id} className="px-6 py-4">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </td>
                                                        ))}
                                                    </Motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </ProtectedView>
    );
}