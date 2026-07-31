import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { FaEye } from "react-icons/fa";
import { getPurchaseCertificates } from "../../api/purchaseCertificates.js";
import { useToast } from "../../context/ToastContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
    ExpenseTableScroll,
    ExpenseTableLoading,
    ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import { ExpenseTableHead, ExpenseTableBody } from "../../components/ui/ExpenseTableElements.jsx";
import {
    PURCHASE_CERTIFICATE_STATUS_LABELS,
} from "../../utils/purchaseCertificate.js";
import formatDate from "../../utils/formatDate.js";
import formatName from "../../utils/formatName.js";

const STATUS_STYLES = {
    DRAFT: "bg-amber-100 text-amber-800 border-amber-200",
    ISSUED: "bg-teal-100 text-teal-800 border-teal-200",
    VOID: "bg-gray-100 text-gray-500 border-gray-200",
};

const FILTERS = [
    { id: "ALL", label: "Todos" },
    { id: "DRAFT", label: "Borradores" },
    { id: "ISSUED", label: "Emitidos" },
    { id: "VOID", label: "Anulados" },
];

export default function PurchaseCertificatesPage() {
    const toast = useToast();
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data } = await getPurchaseCertificates();
            setCertificates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Error", "No se pudieron cargar los certificados.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return certificates;
        return certificates.filter((c) => c.certificateStatus === statusFilter);
    }, [certificates, statusFilter]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "certificateNumber",
                header: "N°",
                cell: ({ row }) => (
                    <Link
                        to={`/purchase-certificates/${row.original.purchaseCertificateId}`}
                        className="font-medium text-teal-700 hover:underline"
                    >
                        {row.original.certificateNumber}
                    </Link>
                ),
            },
            {
                id: "sale",
                header: "Venta",
                cell: ({ row }) =>
                    row.original.sale?.saleNumber ? (
                        <Link
                            to={`/sales/view/${row.original.saleId}`}
                            className="text-gray-700 hover:underline"
                        >
                            #{row.original.sale.saleNumber}
                        </Link>
                    ) : (
                        "—"
                    ),
            },
            {
                accessorKey: "customerNameSnapshot",
                header: "Cliente",
                cell: ({ getValue }) => getValue() || "—",
            },
            {
                accessorKey: "certificateIssuedDate",
                header: "Fecha",
                cell: ({ row }) =>
                    formatDate(row.original.certificateIssuedDate || row.original.createdAt),
            },
            {
                accessorKey: "certificateStatus",
                header: "Estado",
                cell: ({ getValue }) => {
                    const status = getValue();
                    return (
                        <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                STATUS_STYLES[status] || STATUS_STYLES.DRAFT
                            }`}
                        >
                            {PURCHASE_CERTIFICATE_STATUS_LABELS[status] || status}
                        </span>
                    );
                },
            },
            {
                accessorKey: "certificateTotal",
                header: "Total",
                cell: ({ getValue }) => (
                    <span className="text-emerald-700 font-medium">
                        ${Number(getValue() || 0).toLocaleString("es-CL")}
                    </span>
                ),
            },
            {
                id: "user",
                header: "Usuario",
                cell: ({ row }) => {
                    const u = row.original.issuedBy || row.original.createdBy;
                    if (!u) return "—";
                    return [u.userFirstName, u.userLastName].map(formatName).filter(Boolean).join(" ");
                },
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => (
                    <Link
                        to={`/purchase-certificates/${row.original.purchaseCertificateId}`}
                        className="inline-flex p-1.5 text-teal-600 hover:bg-teal-50 rounded"
                        title="Ver"
                    >
                        <FaEye className="text-xs" />
                    </Link>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: filtered,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <ExpensePageLayout
            title="Certificados de Compra"
            subtitle="Documentos para reembolsos ISAPRE, FONASA, seguros y convenios"
        >
            <div className="flex flex-wrap gap-2 mb-4">
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                            statusFilter === f.id
                                ? "bg-teal-600 text-white border-teal-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <ExpenseTableCard
                sectionTitle="Historial de certificados"
                recordCount={table.getFilteredRowModel().rows.length}
                loading={isLoading}
                searchValue={globalFilter}
                onSearchChange={setGlobalFilter}
                searchPlaceholder="Buscar certificado, cliente..."
            >
                <ExpenseTableScroll>
                    <table className="w-full text-left border-collapse">
                        <ExpenseTableHead table={table} />
                        <ExpenseTableBody
                            table={table}
                            isLoading={isLoading}
                            loadingRow={
                                <ExpenseTableLoading
                                    colSpan={columns.length}
                                    message="Cargando certificados..."
                                />
                            }
                            emptyRow={
                                <ExpenseTableEmpty
                                    colSpan={columns.length}
                                    message="No hay certificados. Genéralos desde una venta."
                                />
                            }
                        />
                    </table>
                </ExpenseTableScroll>
            </ExpenseTableCard>
        </ExpensePageLayout>
    );
}
