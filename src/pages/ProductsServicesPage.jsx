import CategoryModal from "../components/modals/CategoryModal.jsx";
import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import { getCategories } from "../api/category";
import { getProductsAndServices } from "../libs/productsAndServices";
import { useEffect, useState } from "react";
import AddProductModal from "../components/modals/AddProductModal";
import SectionHeader from "../components/SetionHeader.jsx";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { IconEye } from "../components/IconComponent.jsx";

export default function ProductsServicesPage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // ➡️ ESTADOS PRINCIPALES DE DATOS
    const [allProducts, setAllProducts] = useState([]); // Fuente de verdad (datos originales de la API)
    const [displayedProducts, setDisplayedProducts] = useState([]); // Datos que se muestran en la tabla
    const [categories, setCategories] = useState([]);
    // Estados para filtros
    const [showProducts, setShowProducts] = useState(true);
    const [showServices, setShowServices] = useState(true);
    const [activeCategories, setActiveCategories] = useState({});

    // Cargar productos y servicios (La fuente de verdad)
    const fetchProducts = async () => {
        try {
            const resProductsAndServices = await getProductsAndServices();
            const loadedProducts = resProductsAndServices ?? [];
            setAllProducts(loadedProducts); // Guardar la lista completa
            setDisplayedProducts(loadedProducts); // Mostrarla inicialmente

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

            // Crear mapa { categoriaID: true } para que todas empiecen activas
            const initialCategoriesState = data.reduce((acc, c) => {
                acc[c.categoryId] = true;
                return acc;
            }, {});
            setActiveCategories(initialCategoriesState);
        } catch (error) {
            console.log(error);
        }
    };
    // Ejecutar solo una vez al montar
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // ➡️ APLICAR FILTROS DE TIPO Y CATEGORÍA (Se ejecuta al cambiar los filtros o al cargar los datos)
    useEffect(() => {
        let filtered = allProducts; // Siempre empezar desde la lista completa (allProducts)

        // 1. FILTRAR POR TIPO (PRODUCT / SERVICE)
        filtered = filtered.filter(item => {
            if (!showProducts && item.type === "PRODUCT") return false;
            if (!showServices && item.type === "SERVICE") return false;
            return true;
        });

        // 2. FILTRAR POR CATEGORÍA
        filtered = filtered.filter(item => {
            const categoryId = item?.category?.categoryId;

            // Si el item tiene categoría, solo se incluye si está activa en 'activeCategories'
            // Si no tiene categoría, lo dejamos pasar (ajusta esto si quieres un comportamiento diferente)
            if (categoryId) {
                return activeCategories[categoryId] === true;
            }
            return true;
        });

        setDisplayedProducts(filtered); // Actualizar la lista que ve el usuario

    }, [showProducts, showServices, activeCategories, allProducts]);

    const columns = [
        {
            header: "Producto",
            accessorFn: row =>
                (row?.productName || row?.serviceName) ?? ""
        },
        {
            header: "SKU",
            accessorFn: row =>
                (row?.productSKU || row?.serviceSKU) ?? ""
        },
        {
            header: "Tipo",
            accessorFn: row => row?.type ?? "",
            cell: info => {
                const value = info.getValue();
                return value === "PRODUCT"
                    ? "Producto"
                    : value === "SERVICE"
                        ? "Servicio"
                        : "";
            }
        },
        {
            header: "Categoría",
            accessorFn: row => row?.category?.categoryName ?? ""
        },
        {
            header: "Precio",
            accessorFn: row => row?.productPrice ?? row?.servicePrice ?? "",
            cell: info => {
                const price = info.getValue();
                const safePrice = Number(price) || 0;
                return (
                    <span className="text-end">
                        {safePrice.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP"
                        })}
                    </span>
                );
            }
        },
        {
            header: "Acciones ",
            accessorFn: row => row?._id ?? "",
            cell: info => {
                const productId = info.getValue();
                return (
                    <Link className="btn m-0 p-0" to={`/products/${productId}`}>
                        <IconEye color="success" />
                    </Link>
                );
            }
        }
    ];

    const table = useReactTable({
        data: displayedProducts, // ➡️ Usar los productos filtrados para la tabla
        columns,
        state: {
            sorting,
            globalFilter
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    });

    return (
        <ProtectedView>
            <NavBarComponent />
            <SectionHeader
                title="Productos y Servicios"
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                placeholderInputSearch="Buscar Producto o Servicio por nombre o SKU"
                button={
                    <AddProductModal
                        title="Nuevo producto o servicio"
                        onCreated={fetchProducts}
                    />
                }
            />
            <div className="container-fluid">
                <div className="row">
                    {/* Filtros */}
                    <div className="col-md-3 col-lg-2">
                        {/* Filtros de Tipo */}
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="checkProducts"
                                checked={showProducts}
                                onChange={e => setShowProducts(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="checkProducts">
                                Productos
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="checkServices"
                                checked={showServices}
                                onChange={e => setShowServices(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="checkServices">
                                Servicios
                            </label>
                        </div>
                        <hr className="" />

                        {/* Filtros de Categoría */}
                        {categories.map(cat => {
                            // Filtrado visual según allowedFor
                            const allowed =
                                cat.allowedFor === "BOTH" ||
                                (cat.allowedFor === "PRODUCTS" && showProducts) ||
                                (cat.allowedFor === "SERVICES" && showServices);

                            if (!allowed) return null;

                            return (
                                <div className="form-check" key={cat.categoryId}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`cat-${cat.categoryId}`}
                                        checked={activeCategories[cat.categoryId] ?? true}
                                        onChange={e =>
                                            setActiveCategories(prev => ({
                                                ...prev,
                                                [cat.categoryId]: e.target.checked
                                            }))
                                        }
                                    />
                                    <label
                                        className="form-check-label small"
                                        htmlFor={`cat-${cat.categoryId}`}
                                    >
                                        {cat.categoryName}
                                    </label>
                                </div>
                            );
                        })}

                        <CategoryModal />
                    </div>

                    {/* Tabla */}
                    <div className="col-md-9 col-lg-10">
                        <div className="table-responsive">
                            <table className="table table-sm table-striped table-hover">

                                <thead>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="p-2 bg-success text-white"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getIsSorted() === "asc"
                                                        ? " 🔼"
                                                        : header.column.getIsSorted() === "desc"
                                                            ? " 🔽"
                                                            : null}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        // ESCENARIO DE CARGA
                                        <tr>
                                            <td colSpan={columns.length} className="text-center p-1">
                                                <div className="d-flex align-items-center px-3">
                                                    <strong className="text-secondary">
                                                        Cargando datos... Por favor, espere.
                                                    </strong>
                                                    <div
                                                        className="spinner-grow text-success spinner-grow-sm ms-auto"
                                                        role="status"
                                                    >
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : table.getRowModel().rows.length === 0 ? (
                                        // ESCENARIO SIN DATOS
                                        <tr>
                                            <td colSpan={columns.length} className="text-center p-4">
                                                No hay registros o no se encontraron resultados para su
                                                búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        // ESCENARIO CON DATOS
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="p-2 border-bottom">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedView>
    );
}