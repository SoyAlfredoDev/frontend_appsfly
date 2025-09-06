import { useState } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import { createCategory } from "../../api/category";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function CategoryModal() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        categoryName: "",
        allowedFor: "BOTH",
        allowedForProducts: true,
        allowedForServices: true,
        createdByUserId: user.userId
    });

    const [error, setError] = useState(null);

    const createCategoryFn = async (data) => {
        try {
            const category = await createCategory(data);
            console.log(category);
            if (category.status == 200) {
                showAlert(`Categoría ${category.data.categoryName} creada`, 'La categoría se creó con éxito', 'success');
                const modalEl = document.getElementById("modalCreateCategory");
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
            } else {
                showAlert("Error al crear la categoría", 'La categoría no se pudo crear', 'error');
            };
        } catch (error) {
            console.log(error);
        }
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        let allowedFor = "NONE";
        if (formData.allowedForProducts && formData.allowedForServices) {
            allowedFor = "BOTH";
        } else if (formData.allowedForProducts) {
            allowedFor = "PRODUCTS";
        } else if (formData.allowedForServices) {
            allowedFor = "SERVICES";
        } else {
            setError('Debe seleccionar una opción');
            return;
        }

        // Formatear nombre de categoría
        const formattedName = formData.categoryName
            .trim()
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase());

        // Construir payload final
        const payload = {
            ...formData,
            categoryName: formattedName,
            allowedFor
        };
        createCategoryFn(payload);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
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
                className="btn btn-sm btn-secondary"
                data-bs-toggle="modal"
                data-bs-target="#modalCreateCategory"
            >
                Admin Categorías
            </button>

            <div
                className="modal fade"
                id="modalCreateCategory"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="modalCreateCategoryLabel"
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
                                <InputFloatingComponent
                                    label="Nombre"
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleInputChange}
                                    autoComplete={null}
                                />
                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="allowedForProducts"
                                                name="allowedForProducts"
                                                checked={formData.allowedForProducts}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="allowedForProducts"
                                            >
                                                Productos
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="allowedForServices"
                                                name="allowedForServices"
                                                checked={formData.allowedForServices}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="allowedForServices"
                                            >
                                                Servicios
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
    );
}
