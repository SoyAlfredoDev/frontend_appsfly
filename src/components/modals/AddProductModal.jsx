import { useEffect, useState } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import { createProducts } from "../../api/product.js";
import { createServices } from "../../api/service.js";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getCategories } from "../../api/category.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function AddProductModal() {
    const { user } = useAuth();
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        sku: "",
        name: "",
        description: "",
        categoryId: "",
        createdByUserId: user.userId,
        typeSelect: "PRODUCT",
        unit: "UNIT",
        price: null,
        priceFixed: true,
    });
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            ['categoryId']: '',
        }))

        const searchCategories = async () => {
            try {
                const res = await getCategories();
                const categoriesFound = res.data
                if (formData.typeSelect === 'PRODUCT') {
                    const categoriesSelected = categoriesFound.filter(c => c.allowedFor === 'PRODUCTS' || c.allowedFor === 'BOTH')
                    setCategories(categoriesSelected)
                } else if (formData.typeSelect === 'SERVICE') {
                    const categoriesSelected = categoriesFound.filter(c => c.allowedFor === 'SERVICES' || c.allowedFor === 'BOTH')
                    setCategories(categoriesSelected)
                }
            } catch (error) {
                console.log(error)
            }
        }
        searchCategories()
    }, [formData.typeSelect])
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        handleInputChange(e);
        try {
            let res
            if (formData.typeSelect === 'PRODUCT') {
                res = await createProducts(formData);
                showAlert('Producto creado', 'Producto creado con exito', 'success');

            }
            else if (formData.typeSelect === 'SERVICE') {
                res = await createServices(formData);
                showAlert('Servicio creado', 'Servicio creado con exito', 'success');
            }
            if (!res.data) {
                setError('error al crear producto');
                return
            }
            const modalEl = document.getElementById('modalAddProduct');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.hide();
            setFormData({
                sku: "",
                name: "",
                description: "",
                categoryId: "",
                createdByUserId: user.userId,
                typeSelect: "PRODUCT",
                unit: "UNIT",
                price: null,
                priceFixed: true,
            })
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleInputBoxChange = (e) => {
        const { name, checked } = e.target;
        const newFormData = { ...formData, [name]: checked };
        setFormData(newFormData);
    };

    const showAlert = (message, text, icon) => {
        MySwal.fire({
            title: <p>{message}</p>,
            text: text,
            icon: icon,
            confirmButtonText: "OK"
        })
    }
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-success"
                data-bs-toggle="modal"
                data-bs-target="#modalAddProduct"
            >
                <i className="bi bi-plus-lg "></i> <span className="d-none d-md-inline-block fs-4"> agregar</span>
            </button>
            <div
                className="modal fade"
                id="modalAddProduct"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="modalAddProductLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar nueva categoría</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>

                        </div>
                        <form onSubmit={handleOnSubmit}>
                            <div className="p-3">
                                {/* agregar la validacion de que nmo se repita*/}
                                <InputFloatingComponent
                                    label="SKU"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    autoComplete={null}
                                />
                                <InputFloatingComponent
                                    label="Nombre"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    autoComplete={null}
                                />
                                <InputFloatingComponent
                                    label="Descripción"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    autoComplete={null}
                                />

                                <div className="form-floating mb-3">
                                    <select
                                        className="form-select"
                                        id="typeSelect"
                                        name="typeSelect"
                                        value={formData.typeSelect}
                                        onChange={handleInputChange}
                                    >
                                        <option value="PRODUCT">Producto</option>
                                        <option value="SERVICE">Servicio</option>
                                    </select>
                                    <label htmlFor="typeSelect">Tipo</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <select
                                        className="form-select"
                                        id="categoryId"
                                        name="categoryId"
                                        onChange={handleInputChange}
                                        value={formData.categoryId}
                                        required

                                    >
                                        <option value={null}>Selecciona una opción</option>

                                        {

                                            categories.map((c) => (
                                                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                            ))
                                        }
                                    </select>
                                    <label htmlFor="category">Categoria</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <select
                                        className="form-select"
                                        id="unit"
                                        name="unit"
                                        dvalue={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {
                                            formData.typeSelect == "PRODUCT"
                                                ? (
                                                    <>
                                                        <option value={null} disabled>Selecciona una opción</option>
                                                        <option value="UNIT">Unidad</option>
                                                        <option value="KILOGRAM">Kg</option>
                                                        <option value="GRAM">g</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value={null} disabled>Selecciona una opción</option>
                                                        <option value="UNIT">Unidad</option>
                                                        <option value="MONT">Mes</option>
                                                        <option value="DAY">Día</option>
                                                        <option value="HOUR">Hora</option>
                                                    </>
                                                )
                                        }
                                    </select>
                                    <label htmlFor="unit">Unidad de medida</label>
                                </div>

                                <div className="row">
                                    <div className="col-md-7">
                                        <InputFloatingComponent
                                            label="Precio"
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            autoComplete={null}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <div className="form-check d-flex align-items-center gap-2 pe-5">
                                            <input
                                                className="form-check-input"
                                                id="priceFixed"
                                                name="priceFixed"
                                                type="checkbox"
                                                checked={formData.priceFixed}
                                                onChange={handleInputBoxChange}
                                            />
                                            <label className="form-check-label" htmlFor="priceFixed">
                                                Precio fijo
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {error && <div className="alert alert-danger mt-2">{error}</div>}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-success">
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>

    )
}