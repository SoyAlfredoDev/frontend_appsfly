import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaBoxOpen,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaSearch,
    FaHistory,
    FaEye,
} from "react-icons/fa";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../components/ui/ExpensePageLayout.jsx";
import InventoryAdjustmentModal from "../components/modals/InventoryAdjustmentModal.jsx";
import {
    getInventorySummary,
    getInventoryStock,
    getInventoryMovements,
} from "../api/inventory.js";
import formatCurrency from "../utils/formatCurrency.js";
import formatDate from "../utils/formatDate.js";
import {
    KPI_CARD,
    KPI_ICON_PRIMARY,
    KPI_ICON_AMBER,
    KPI_ICON_SECONDARY,
    KPI_LABEL,
    KPI_VALUE,
    TABLE_WRAPPER,
    TABLE_TOOLBAR,
    TABLE_SECTION_TITLE,
    TABLE_SECTION_SUB,
    TABLE_SEARCH,
    THEAD,
    TH,
    TD,
    TD_MUTED,
    TR_ROW,
    TBODY,
    ACTION_VIEW,
    itemVariants,
} from "../utils/expenseUiPatterns.js";
import { getMovementBadgeClass, formatMovementQuantity } from "../utils/inventoryUi.js";

const MOVEMENT_FILTER_OPTIONS = [
    { value: "ALL", label: "Todos los tipos" },
    { value: "VENTA", label: "Ventas" },
    { value: "COMPRA", label: "Compras" },
    { value: "AJUSTE_MANUAL", label: "Ajustes manuales" },
    { value: "MERMA", label: "Mermas" },
    { value: "DEVOLUCION", label: "Devoluciones" },
];

function StockBadge({ qty, isLowStock }) {
    const badgeClass =
        qty <= 0
            ? "bg-red-100 text-red-700"
            : isLowStock
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700";

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums ${badgeClass}`}>
            {qty}
        </span>
    );
}

export default function InventoryPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [stockList, setStockList] = useState([]);
    const [movements, setMovements] = useState([]);
    const [movementsPagination, setMovementsPagination] = useState({
        total: 0,
        pages: 1,
        currentPage: 1,
        limit: 30,
    });

    const [stockSearch, setStockSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [movementSearch, setMovementSearch] = useState("");
    const [movementType, setMovementType] = useState("ALL");
    const [movementsPage, setMovementsPage] = useState(1);

    const fetchSummary = useCallback(async () => {
        const res = await getInventorySummary();
        setSummary(res.data);
    }, []);

    const fetchStock = useCallback(async () => {
        const res = await getInventoryStock({
            q: stockSearch.trim() || undefined,
            lowStockOnly: lowStockOnly || undefined,
        });
        setStockList(res.data ?? []);
    }, [stockSearch, lowStockOnly]);

    const fetchMovements = useCallback(async () => {
        const res = await getInventoryMovements({
            q: movementSearch.trim() || undefined,
            type: movementType,
            page: movementsPage,
            limit: 30,
        });
        setMovements(res.data?.rows ?? []);
        setMovementsPagination(res.data?.pagination ?? movementsPagination);
    }, [movementSearch, movementType, movementsPage]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchSummary(), fetchStock(), fetchMovements()]);
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchSummary, fetchStock, fetchMovements]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!loading) fetchStock();
    }, [stockSearch, lowStockOnly, fetchStock, loading]);

    useEffect(() => {
        if (!loading) fetchMovements();
    }, [movementSearch, movementType, movementsPage, fetchMovements, loading]);

    const filteredStockCount = stockList.length;

    const handleAdjusted = () => {
        setMovementsPage(1);
        fetchAll();
    };

    const movementRows = useMemo(() => movements, [movements]);

    return (
        <ExpensePageLayout
            title="Control de Inventario"
            subtitle="Stock en tiempo real, valorización y trazabilidad de movimientos"
            actions={
                <InventoryAdjustmentModal stockList={stockList} onAdjusted={handleAdjusted} />
            }
        >
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ExpenseAnimatedSection>
                    <div className={KPI_CARD}>
                        <div className={KPI_ICON_PRIMARY}>
                            <FaBoxOpen className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Productos en stock</p>
                            <p className={KPI_VALUE}>{summary?.productsInStock ?? "—"}</p>
                        </div>
                    </div>
                </ExpenseAnimatedSection>

                <ExpenseAnimatedSection>
                    <div className={KPI_CARD}>
                        <div className={KPI_ICON_AMBER}>
                            <FaExclamationTriangle className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Alertas bajo stock</p>
                            <p className={KPI_VALUE}>{summary?.lowStockAlerts ?? "—"}</p>
                        </div>
                    </div>
                </ExpenseAnimatedSection>

                <ExpenseAnimatedSection>
                    <div className={KPI_CARD}>
                        <div className={KPI_ICON_SECONDARY}>
                            <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div>
                            <p className={KPI_LABEL}>Valorización total</p>
                            <p className={KPI_VALUE}>
                                {summary ? formatCurrency(summary.totalValuation) : "—"}
                            </p>
                        </div>
                    </div>
                </ExpenseAnimatedSection>
            </div>

            {/* Stock table */}
            <ExpenseAnimatedSection>
                <div className={TABLE_WRAPPER}>
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <h2 className={TABLE_SECTION_TITLE}>Stock actual</h2>
                            <p className={TABLE_SECTION_SUB}>
                                {loading
                                    ? "Cargando..."
                                    : `${filteredStockCount} producto${filteredStockCount !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <label className="flex items-center gap-2 text-xs text-gray-600 px-2">
                                <input
                                    type="checkbox"
                                    checked={lowStockOnly}
                                    onChange={(e) => setLowStockOnly(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary border-gray-300"
                                />
                                Solo bajo stock
                            </label>
                            <div className="relative w-full sm:w-64">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={stockSearch}
                                    onChange={(e) => setStockSearch(e.target.value)}
                                    placeholder="Buscar producto o SKU..."
                                    className={TABLE_SEARCH}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Producto</th>
                                    <th className={TH}>SKU</th>
                                    <th className={TH}>Categoría</th>
                                    <th className={TH}>Stock</th>
                                    <th className={TH}>Costo prom.</th>
                                    <th className={TH}>Valor</th>
                                    <th className={TH}>Último mov.</th>
                                    <th className={`${TH} text-center`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            Cargando stock...
                                        </td>
                                    </tr>
                                ) : stockList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">No hay productos coincidentes.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    stockList.map((item) => (
                                        <tr key={item.productId} className={TR_ROW}>
                                            <td className={TD}>
                                                <span className="font-medium text-gray-900">{item.productName}</span>
                                            </td>
                                            <td className={TD_MUTED}>{item.productSKU}</td>
                                            <td className={TD_MUTED}>{item.categoryName}</td>
                                            <td className={TD}>
                                                <StockBadge
                                                    qty={item.quantityOnHand}
                                                    isLowStock={item.isLowStock}
                                                />
                                            </td>
                                            <td className={TD_MUTED}>{formatCurrency(item.unitValue)}</td>
                                            <td className={TD_MUTED}>{formatCurrency(item.totalValue)}</td>
                                            <td className={TD_MUTED}>
                                                {item.lastMovementAt
                                                    ? formatDate(item.lastMovementAt)
                                                    : "—"}
                                            </td>
                                            <td className={`${TD} text-center`}>
                                                <Link
                                                    to={`/products/${item.productId}`}
                                                    className={ACTION_VIEW}
                                                    title="Ver producto"
                                                >
                                                    <FaEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ExpenseAnimatedSection>

            {/* Movements table */}
            <ExpenseAnimatedSection>
                <Motion.div variants={itemVariants} className={TABLE_WRAPPER}>
                    <div className={TABLE_TOOLBAR}>
                        <div>
                            <h2 className={`${TABLE_SECTION_TITLE} flex items-center gap-2`}>
                                <FaHistory className="text-primary" />
                                Historial de movimientos
                            </h2>
                            <p className={TABLE_SECTION_SUB}>
                                {loading
                                    ? "Cargando..."
                                    : `${movementsPagination.total} movimiento${movementsPagination.total !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <select
                                value={movementType}
                                onChange={(e) => {
                                    setMovementType(e.target.value);
                                    setMovementsPage(1);
                                }}
                                className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {MOVEMENT_FILTER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="relative w-full sm:w-64">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={movementSearch}
                                    onChange={(e) => {
                                        setMovementSearch(e.target.value);
                                        setMovementsPage(1);
                                    }}
                                    placeholder="Buscar producto o referencia..."
                                    className={TABLE_SEARCH}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={THEAD}>
                                <tr>
                                    <th className={TH}>Fecha</th>
                                    <th className={TH}>Producto</th>
                                    <th className={TH}>Tipo</th>
                                    <th className={TH}>Cantidad</th>
                                    <th className={TH}>Stock</th>
                                    <th className={TH}>Referencia</th>
                                    <th className={TH}>Usuario</th>
                                    <th className={TH}>Motivo</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <tr key="loading">
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                Cargando movimientos...
                                            </td>
                                        </tr>
                                    ) : movementRows.length === 0 ? (
                                        <tr key="empty">
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                No hay movimientos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        movementRows.map((row) => (
                                            <Motion.tr
                                                key={row.movementId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={TR_ROW}
                                            >
                                                <td className={TD_MUTED}>{formatDate(row.createdAt)}</td>
                                                <td className={TD}>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{row.productName}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{row.productSKU}</p>
                                                    </div>
                                                </td>
                                                <td className={TD}>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getMovementBadgeClass(row)}`}
                                                    >
                                                        {row.movementTypeLabel}
                                                    </span>
                                                </td>
                                                <td className={TD}>
                                                    <span
                                                        className={`font-semibold tabular-nums ${
                                                            row.quantityDelta >= 0
                                                                ? "text-emerald-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {formatMovementQuantity(row.quantityDelta)}
                                                    </span>
                                                </td>
                                                <td className={TD_MUTED}>
                                                    {row.stockBefore} → {row.stockAfter}
                                                </td>
                                                <td className={TD_MUTED}>{row.referenceLabel || "—"}</td>
                                                <td className={TD_MUTED}>{row.userName}</td>
                                                <td className={TD_MUTED}>{row.reason || "—"}</td>
                                            </Motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {movementsPagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Página {movementsPagination.currentPage} de {movementsPagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={movementsPage <= 1}
                                    onClick={() => setMovementsPage((p) => Math.max(1, p - 1))}
                                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    disabled={movementsPage >= movementsPagination.pages}
                                    onClick={() =>
                                        setMovementsPage((p) =>
                                            Math.min(movementsPagination.pages, p + 1),
                                        )
                                    }
                                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </Motion.div>
            </ExpenseAnimatedSection>
        </ExpensePageLayout>
    );
}
