import CategoryModal from "../components/modals/CategoryModal.jsx";
import { getCategories } from "../api/category";
import { getProductsAndServices } from "../libs/productsAndServices";
import { useEffect, useState } from "react";
import AddProductModal from "../components/modals/AddProductModal";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { FaEye, FaBox, FaFilter } from "react-icons/fa";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
  ExpenseTableEmpty,
} from "../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../components/ui/ExpenseTableElements.jsx";
import {
  ACTION_VIEW,
  TD_AMOUNT,
} from "../utils/expenseUiPatterns.js";

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
                    <span className={TD_AMOUNT.replace('px-6 py-4 ', '')}>
                        {safePrice.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
                    </span>
                );
            }
        },
        {
            header: "Acciones",
            id: "actions",
            accessorFn: row => row?.productId ?? row?.serviceId ?? "",
            cell: info => {
                const productId = info.getValue();
                return (
                    <div className="flex items-center justify-center">
                        <Link to={`/products/${productId}`} className={ACTION_VIEW} title="Ver detalle">
                            <FaEye />
                        </Link>
                    </div>
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

    const filteredCount = table.getFilteredRowModel().rows.length;

    return (
        <ExpensePageLayout
            title="Productos y Servicios"
            subtitle="Gestión de inventario y catálogo de servicios"
            actions={<AddProductModal title="Nuevo Item" onCreated={fetchProducts} />}
        >
            <div className="flex flex-col lg:flex-row gap-6">
                <ExpenseAnimatedSection className="lg:w-64 flex-shrink-0">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold border-b border-gray-100 pb-2">
                            <FaFilter className="text-primary" />
                            <h2 className="text-sm">Filtros</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</h3>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={showProducts}
                                    onChange={e => setShowProducts(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary border-gray-300"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">Productos</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={showServices}
                                    onChange={e => setShowServices(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary border-gray-300"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">Servicios</span>
                            </label>
                        </div>

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
                                                className="rounded text-primary focus:ring-primary border-gray-300"
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
                </ExpenseAnimatedSection>

                <div className="flex-1 min-w-0">
                    <ExpenseTableCard
                        sectionTitle="Catálogo"
                        recordCount={filteredCount}
                        loading={isLoading}
                        searchValue={globalFilter}
                        onSearchChange={setGlobalFilter}
                        searchPlaceholder="Buscar por nombre o SKU..."
                    >
                        <ExpenseTableScroll>
                            <table className="w-full text-left border-collapse">
                                <ExpenseTableHead table={table} centerColumns={['actions']} />
                                <ExpenseTableBody
                                    table={table}
                                    isLoading={isLoading}
                                    loadingRow={<ExpenseTableLoading colSpan={columns.length} message="Cargando catálogo..." />}
                                    emptyRow={
                                        <ExpenseTableEmpty
                                            colSpan={columns.length}
                                            icon={<FaBox className="text-4xl text-gray-300" />}
                                            title="No hay registros coincidentes."
                                        />
                                    }
                                />
                            </table>
                        </ExpenseTableScroll>
                    </ExpenseTableCard>
                </div>
            </div>
        </ExpensePageLayout>
    );
}