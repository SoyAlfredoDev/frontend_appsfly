import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import { useEffect, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { getSales } from "../../api/sale.js";

import { useNavigate } from "react-router-dom";
import { IconEye, IconPlus } from '../../components/IconComponent.jsx'

export default function SalesPage() {
    const [salesData, setSalesData] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(""); // Estado para el input de búsqueda
    const navigate = useNavigate();
    const handleAddSale = () => {
        navigate("/sales/register");
    };
    const [isLoading, setIsLoading] = useState(true);
    const columns = [
        { header: "Fecha", accessorFn: row => row.saleDate ?? "" },
        { header: "Nro", accessorFn: row => row.saleNumber ?? "" },
        { header: "Cliente", accessorFn: row => `${row.customer?.customerFirstName ?? ""} ${row.customer?.customerLastName ?? ""}` },
        {
            header: "Total", accessorFn: row => row.saleTotal ?? "", cell: ({ getValue }) => {
                const value = getValue();
                if (typeof value === 'number') {
                    return value.toLocaleString('es-CL', {
                        style: 'currency',
                        currency: 'CLP'
                    });
                }
                return value;
            },
        },
        {
            header: "Pendiente", accessorFn: row => row.salePendingAmount ?? "", cell: ({ getValue }) => {
                const value = getValue();
                if (typeof value === 'number') {
                    return value.toLocaleString('es-CL', {
                        style: 'currency',
                        currency: 'CLP'
                    });
                }
                return value;
            },
        },
        {
            header: "Vendedor", accessorFn: row => `${row.user?.userFirstName ?? ""} ${row.user?.userLastName ?? ""}`
        },
        { header: "Comentario", accessorFn: row => row.saleComment ?? "" },
        {
            header: "Acciones", id: "actions", cell: ({ row }) => (
                <>
                    <button
                        className="btn m-0 p-0"
                        onClick={() => handleEditSale(row.original.saleId)}
                    >
                        <IconEye color="success" />
                    </button>
                </>
            )
        }
    ];
    const handleEditSale = (saleId) => {
        navigate(`/sales/view/${saleId}`);
    }
    const table = useReactTable({
        // 1. **Datos completos:** Pasamos todos los datos sin filtrar.
        data: salesData,
        columns,
        state: {
            sorting,
            globalFilter, // 2. **Estado de Filtro:** Ahora TanStack Table gestiona este estado.
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter, // 3. **Manejador de Filtro:** Para actualizar el estado.
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // 4. **Modelo de Filtro:** Instruye a la tabla para aplicar el filtro global.
        getFilteredRowModel: getFilteredRowModel(),
        // Opcional: puedes definir 'fuzzy' o 'includesString' como globalFilterFn 
        // para un filtrado más inteligente si lo necesitas.
    });
    useEffect(() => {
        fetchSales();
    }, []);
    const fetchSales = async () => {
        try {
            const response = await getSales();
            setSalesData(response.data || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setIsLoading(false); // Finaliza la carga, haya sido exitosa o no
        }
    };
    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="container-fluid" style={{ marginTop: "80px" }}>
                <div className="row px-3  align-items-center">
                    <div className="col-md-4">
                        <h1>Ventas</h1>
                    </div>
                    <div className="col-md-2 text-center">
                        <button className="btn btn-success" onClick={handleAddSale}>
                            <IconPlus />
                            <span className="ms-2 d-none d-sm-inline">Agregar</span>
                        </button>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍Buscar venta por cualquier campo..."
                            value={globalFilter}
                            // Usamos setGlobalFilter para actualizar el estado, 
                            // que a su vez refresca la tabla a través de useReactTable.
                            onChange={e => setGlobalFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="p-2 bg-success text-white border-bottom"
                                                style={{ cursor: "pointer" }}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
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
                                    // 1. ESCENARIO DE CARGA
                                    <tr>
                                        <td colSpan={columns.length} className="text-center p-1">
                                            <div className="d-flex align-items-center px-3">
                                                <strong className="text-secondary"> Cargando datos... Por favor, espere.</strong>
                                                <div className="spinner-grow text-success spinner-grow-sm ms-auto" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : table.getRowModel().rows.length === 0 ? (
                                    // 2. ESCENARIO SIN DATOS (o sin resultados de filtro)
                                    <tr>
                                        <td colSpan={columns.length} className="text-center p-4">
                                            **No hay ventas registradas o no se encontraron resultados para su búsqueda.**
                                        </td>
                                    </tr>
                                ) : (
                                    // 3. ESCENARIO CON DATOS
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="p-2 border-bottom">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        </ProtectedView>
    );
}