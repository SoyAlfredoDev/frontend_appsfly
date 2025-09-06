import NavBarComponent from "../components/NavBarComponent";
import { getCustomers } from "../api/customers.js";
import { useEffect, useState } from "react";
import AddCustomerModal from "../components/modals/AddCustomerModal.jsx";
import { useNavigate } from "react-router-dom";
import "./CustomerPage.css";

export default function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();
    const fetchCustomers = async () => {
        try {
            const result = await getCustomers();
            setCustomers(result.data);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchCustomers();
    }, []);
    const formatName = (name) =>
        name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();
    const handleClick = (customerId) => {
        // Navigate to the customer detail page
        // This will replace the current URL with the new one   
        navigate(`/customers/${customerId}`);
    };

    return (
        <>
            <NavBarComponent />
            <div className="customer-container">
                <div className="container-fluid">
                    <div className="row align-items-center mb-2">
                        <div className="col-6 col-md-4">
                            <h1 className="page-title">Clientes</h1>
                        </div>
                        <div className="col-6 col-md-2  text-center pb-2">
                            <AddCustomerModal title={'Nuevo cliente'} onCreated={fetchCustomers} />
                        </div>
                        <div className="col-md-6">
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="form-control search-input"
                                    placeholder="🔍 Buscar cliente por nombre, documento o teléfono..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table custom-table table-hover table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th className="text-center">Nombre y Apellido</th>
                                    <th className="text-center">Número documento</th>
                                    <th className="text-center">Teléfono</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.customerId}>
                                        <td>
                                            {formatName(customer.customerFirstName)}{" "}
                                            {formatName(customer.customerLastName)}
                                        </td>
                                        <td className="text-center">
                                            {customer.customerDocumentType.toUpperCase()}:{" "}
                                            {customer.customerDocumentNumber}
                                        </td>
                                        <td className="text-center">
                                            {customer.customerCodePhoneNumber}{" "}
                                            {customer.customerPhoneNumber}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn action-btn text-success me-2"
                                                onClick={() => handleClick(customer.customerId)}
                                            >
                                                <i className="bi bi-eye-fill"></i>
                                            </button>
                                            <button className="btn action-btn text-success">
                                                <i className="bi bi-telephone-fill"></i>
                                            </button>
                                            <button className="btn action-btn text-danger">
                                                <i className="bi bi-archive-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
