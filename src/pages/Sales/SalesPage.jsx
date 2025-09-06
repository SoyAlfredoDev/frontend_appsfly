import { useEffect, useState } from "react";
import NavBarComponent from "../../components/NavBarComponent";
import { useNavigate, Link } from "react-router-dom";
import { getSales } from '../../api/sale.js'

export default function SalesPage() {
    const [dataSale, seDataSale] = useState([])
    const navigate = useNavigate()
    const handleOnClick = () => {
        navigate('/sales/register');
    }

    //get sale
    useEffect(() => {
        searchSales()
    }, [])

    const searchSales = async () => {
        try {
            const data = await getSales()
            const sales = data.data
            seDataSale(sales)
            return sales

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '70px' }}>
                    <div className="col-9 col-md-4">
                        <h1 className="page-title">Ventas</h1>
                    </div>
                    <div className="col-3 col-md-2 text-center">
                        <button className="btn btn-success" onClick={handleOnClick}>
                            AGREGAR
                        </button>

                    </div>
                    <div className="col-md-6">
                        <div className="search-container">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="🔍 Buscar producto o servicio por nombre o sku"
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr className="text-center">
                                    <th>Fecha </th>
                                    <th>Nro Venta</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Por Cobrar</th>
                                    <th>Vendedor</th>
                                    <th>Comentario</th>
                                    <th>acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    dataSale.map((sale) => (
                                        <tr key={sale.saleId}>
                                            <td className="text-center">
                                                {new Date(sale.createdAt).toLocaleDateString('es-CL')}
                                            </td>
                                            <td></td>
                                            <td>{sale.customer.customerFirstName} {sale.customer.customerLastName}</td>
                                            <td className="text-end text-success">
                                                <b>
                                                    {sale.saleTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </b>
                                            </td>
                                            <td className={'text-danger text-end'}>
                                                {sale.salePendingAmount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                            </td>
                                            <td className="text-center">{sale.user.userFirstName} {sale.user.userLastName}</td>
                                            <td className="text-start">{sale?.saleComment}</td>
                                            <td>
                                                <Link className="btn btn-sm text-success " to={`/sale/${sale.saleId}`}>
                                                    <i className="bi bi-eye-fill"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}