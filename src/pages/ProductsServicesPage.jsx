import CategoryModal from "../components/modals/CategoryModal.jsx";
import NavBarComponent from "../components/NavBarComponent";
import ProductsTableComponent from "../components/Tables/ProductsTableComponent";
import { getCategories } from "../api/category";
import { useEffect, useState } from "react";
import AddProductModal from "../components/modals/AddProductModal";

export default function ProductsServicesPage() {
    const [categories, setCategories] = useState([]);

    const searchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        searchCategories()
    }, []);

    return (
        <>
            <NavBarComponent />
            <div className="container-fluid">
                <div className="row" style={{ marginTop: '70px' }}>
                    <div className="col-9 col-md-4">
                        <h1 className="page-title">Productos y Servicios</h1>
                    </div>
                    <div className="col-3 col-md-2 text-center">
                        <AddProductModal />
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
                    <div className="col-md-2 pt-3">
                        <div className="row">
                            <div className="col-6 col-md-12">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value={true} id="flexCheckDefault" />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Productos
                                    </label>
                                </div>
                            </div>
                            <div className="col-6 col-md-12">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value={true} id="flexCheckDefault" />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Servicios
                                    </label>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <select name="" id="" className="form-select mb-2">
                            <option value={'allCategorys'}>Todas</option>
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}

                        </select>
                        <div className="text-center">
                            <CategoryModal />
                        </div>
                        <hr className="m-2 p-0" />
                    </div>
                    <div className="col-md-10">
                        <ProductsTableComponent />
                    </div>

                </div>
            </div>
        </>
    )
}