import { useEffect, useState } from "react";
import { getProductsAndServices } from "../../libs/productsAndServices";

export default function ProductsTableComponent() {
    const [products, setProducts] = useState([]);
    const fechProducts = async () => {
        try {
            const res = await getProductsAndServices();
            setProducts(res);
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
    useEffect(() => {
        fechProducts();
    }, []);
    return (
        <div className="table-responsive">
            <table className="table custom-table table-hover table-bordered align-middle">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Categoria</th>
                        <th>Costo</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.map((product) => (
                            <tr key={product.productId || product.serviceId}>
                                <td>{product.productSKU || product.serviceSKU}</td>
                                <td>{product.productName || product.serviceName}</td>
                                <td>
                                    {({ PRODUCT: "Producto", SERVICE: "Servicio" }[product.type] || "")}
                                </td>
                                <td>
                                    {product.category?.categoryName}
                                </td>
                                <td className="text-end">0</td>
                                <td className="text-end">
                                    {product?.productPrice?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) || product?.servicePrice?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                </td>
                                <td></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}