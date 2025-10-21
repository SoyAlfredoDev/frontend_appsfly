import { useEffect, useState } from "react";
import NavBarComponent from "../components/NavBarComponent";
import AddDailySaleModal from "../components/modals/AddDailySaleModal";
import { getDailySales } from "../api/dailySales.js";

export default function PageDailySales() {
    const [dailySalesData, setDailySalesData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDailySales();
                setDailySalesData(result.data || []); // protección por si no hay datos
                console.log("Fetched daily sales data:", result.data);
            } catch (error) {
                console.error("Error fetching daily sales:", error);
                setDailySalesData([]); // en caso de error, deja el array vacío
            }
        };

        fetchData();
    }, []);
    const methods = [
        { methodId: 0, methodName: 'Tarjeta de Débito' },
        { methodId: 1, methodName: 'Tarjeta de Crédito' },
        { methodId: 2, methodName: 'Efectivo' },
        { methodId: 3, methodName: 'Transferencia Bancaria' },
    ];
    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '70px' }}>
                    <div className="col-9 col-md-5">
                        <h1 className="page-title">Cierre Diario Ventas</h1>
                    </div>
                    <div className="col-3 col-md-2 text-center">
                        <AddDailySaleModal />
                    </div>
                    <div className="col-md-5">
                        <div className="search-container">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="🔍 Buscar cierre por fecha"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr className="text-center">
                                <th>Fecha </th>
                                <th>Nro Ventas</th>
                                <th>Total Ventas</th>
                                <th>Total Ingresos</th>
                                {
                                    methods.map((m) => (
                                        <th key={m.methodId}> {m.methodName} </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {dailySalesData.map((dailySale, index) => (
                                <tr key={index} className="text-center">
                                    <td>{dailySale?.dailySalesDay}</td>
                                    <td>{dailySale?.dailySalesNumberOfSales}</td>
                                    <td className="text-end text-success">
                                        <b>
                                            {dailySale?.dailySalesTotalSales.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </b>
                                    </td>
                                    <td>{dailySale?.dailySalesTotalIncome.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                    {
                                        methods.map((m) => (
                                            <td key={m.methodId}>{dailySale?.dailySalesDetailIncome?.[m.methodId].toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                        ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
