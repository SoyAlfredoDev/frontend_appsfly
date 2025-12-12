import { useState, useRef } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import { createCategory } from "../../api/category";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTags } from "react-icons/fa";

const MySwal = withReactContent(Swal);

export default function CategoryModal({ onCategoryAdded }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        categoryName: "",
        allowedFor: "BOTH",
        allowedForProducts: true,
        allowedForServices: true,
        createdByUserId: user.userId
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setError(null);
        setFormData({
            categoryName: "",
            allowedFor: "BOTH",
            allowedForProducts: true,
            allowedForServices: true,
            createdByUserId: user.userId
        });
    };

    const createCategoryFn = async (data) => {
        try {
            setLoading(true);
            const category = await createCategory(data);
            if (category.status === 200) {
                showAlert(`Categoría ${category.data.categoryName} creada`, 'La categoría se creó con éxito', 'success');
                closeModal();
                if (onCategoryAdded) onCategoryAdded(); // Notify parent if prop exists
            } else {
                showAlert("Error al crear la categoría", 'La categoría no se pudo crear', 'error');
            }
        } catch (error) {
            console.log(error);
            setError(error.message || "Error desconocido");
        } finally {
            setLoading(false);
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
            setError('Debe seleccionar para qué tipo aplica la categoría (Producto o Servicio)');
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
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'bg-emerald-600'
            }
        })
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm text-sm font-medium mt-4"
            >
                <FaTags /> Admin Categorías
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        
                        {/* Modal Content */}
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800">Nueva Categoría</h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <form onSubmit={handleOnSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <InputFloatingComponent
                                            label="Nombre de Categoría"
                                            name="categoryName"
                                            value={formData.categoryName}
                                            onChange={handleInputChange}
                                            autoComplete={null}
                                        />

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-sm font-semibold text-gray-700 mb-3 block">Disponible para:</p>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                                        type="checkbox"
                                                        id="allowedForProducts"
                                                        name="allowedForProducts"
                                                        checked={formData.allowedForProducts}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Productos</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                                        type="checkbox"
                                                        id="allowedForServices"
                                                        name="allowedForServices"
                                                        checked={formData.allowedForServices}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Servicios</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                                        >
                                            {error}
                                        </Motion.div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creando...' : 'Crear Categoría'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
