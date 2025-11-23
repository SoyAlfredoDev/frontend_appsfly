import NavBarComponent from "../components/NavBarComponent";
import ProtectedView from "../components/ProtectedView";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";
import { getCustomers, deleteCustomerById } from "../api/customers.js";
import { useEffect, useState } from "react";
import AddCustomerModal from "../components/modals/AddCustomerModal.jsx";
import validateRut from '../libs/validateRut.js'
import { FcOk } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEdit, IconDelete } from '../components/IconComponent.jsx'
import SectionHeader from "../components/SetionHeader.jsx";

export default function CustomerPage() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const fetchCustomers = async () => {
        try {
            const result = await getCustomers();
            setCustomers(result.data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }

    };
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchCustomers();
    }, []);
    const handleViewCustomer = (customerId) => {
        // Navegar a la página de vista del cliente
        navigate(`/customers/${customerId}`);
    };
    const handleEditCustomer = (customerId) => {
        // Navegar a la página de vista del cliente
        //navigate(`/customer/view/${customerId}`);
        console.log("Editar cliente con ID:", customerId);
    };
    const handleDeleteCustomer = async (customerId, firstName = '', lastName = '') => {
        try {
            // Lógica para eliminar cliente
            if (confirm(`¿Estás seguro de que deseas eliminar a ${formatName(firstName)} ${formatName(lastName)}? Esta acción no se puede deshacer.`)) {
                // Aquí iría la llamada a la API para eliminar el cliente
                const res = await deleteCustomerById(customerId);
                if (res.status === 200) { fetchCustomers(); alert('Cliente eliminado con éxito.') }
                if (res.status === 400) alert(' no se puede eliminmar el cliente porque tiene datos asociados.')
                if (res.status === 500) alert('Error del servidor. Por favor, inténtelo de nuevo más tarde.')
            }
        } catch (error) {

            if (error.status === 400) {
                alert("No se puede eliminar el cliente porque tiene datos asociados.");
                return;
            } else {
                alert("Ocurrió un error al eliminar el cliente. Por favor, inténtelo de nuevo más tarde.");
            }


        }

    };
    const formatName = (name) =>
        name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

    const columns = [
        {
            header: "Nombre y Apellido ", accessorFn: row => {
                const firstName = formatName(row?.customerFirstName) ?? "";
                const lastName = formatName(row?.customerLastName) ?? "";
                return `${firstName} ${lastName}`.trim();
            }
        },
        {
            header: "Número Documento",
            accessorFn: row => {
                const type = row?.customerDocumentType?.toUpperCase() ?? "";
                const number = row?.customerDocumentNumber ?? "";
                return `${type} ${number}`;   // <-- AHORA ES UN STRING
            },
            cell: ({ getValue }) => {
                const value = getValue(); // "RUT 12345678-9"
                const [type, number] = value.split(" ");

                const isValidRut = type === "RUT" && validateRut(number);

                return (
                    <span>
                        {type}: {number}
                        {isValidRut && (
                            <span className="ms-2" title="RUT válido">
                                <FcOk />
                            </span>
                        )}
                    </span>
                );
            }
        },
        {
            header: "Teléfono",
            accessorFn: row => {
                const code = row?.customerCodePhoneNumber ?? "";
                const number = row?.customerPhoneNumber ?? "";
                return `${code} ${number}`.trim();
            }
        }, {
            header: 'Acciones', id: "actions", cell: ({ row }) => (
                <div className="d-flex gap-2 m-0 p-0" >
                    <button
                        className="btn m-0 p-0 "
                        onClick={() => handleViewCustomer(row.original.customerId)}
                    >
                        <IconEye color="success" />
                    </button>
                    <button
                        className="btn m-0 p-0 "
                        onClick={() => handleEditCustomer(row.original.customerId)}>
                        <IconEdit color="warning" />
                    </button>
                    <button
                        className="btn m-0 p-0"
                        onClick={() => handleDeleteCustomer(row.original.customerId, row.original.customerFirstName, row.original.customerLastName)}
                    >
                        <IconDelete color="danger" />
                    </button>
                </div>
            )
        }
    ];
    const table = useReactTable({
        // 1. **Datos completos:** Pasamos todos los datos sin filtrar.
        data: customers,
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
    return (
        <ProtectedView>
            <NavBarComponent />
            <SectionHeader
                title={"Clientes"}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                button={
                    <AddCustomerModal
                        title={'Nuevo cliente'}
                        onCreated={fetchCustomers}
                    />}
                placeholderInputSearch="Buscar Cliente por nombre y apellido, número de documento o teléfono..."
            />
            <div className="container-fluid">
                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-sm table-striped table-hover">
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
                                            **No hay clientes registrados o no se encontraron resultados para su búsqueda.**
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
