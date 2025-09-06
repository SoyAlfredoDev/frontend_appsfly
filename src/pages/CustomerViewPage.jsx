import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../api/customers.js';
import NavBarComponent from '../components/NavBarComponent.jsx';
//import { formatName } from '../context'; // Assuming you have a utility function for formatting names
export default function CustomerViewPage() {
    const [customer, setCustomer] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchCustomer = async () => {
        try {
            const result = await getCustomerById(id);
            setCustomer(result.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    if (!customer) return <div>Loading...</div>;

    return (
        <div className="customer-view-container">
            <NavBarComponent />
            <h1 className="page-title">Detalles del Cliente</h1>
            <div className="customer-details">
                <p><strong>Nombre:</strong> {customer.name}</p>
                <p><strong>Documento:</strong> {customer.documentNumber}</p>
                <p><strong>Teléfono:</strong> {customer.phone}</p>
                <button onClick={() => navigate('/customers')} className="btn btn-primary">Volver a Clientes</button>
            </div>
        </div>
    );
}