import { useEffect, useState } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import { createProducts } from "../../api/product.js";
import { createServices } from "../../api/service.js";
import { getCategories } from "../../api/category.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaBoxOpen, FaHandHoldingHeart } from "react-icons/fa";

const MySwal = withReactContent(Swal);

export default function AddProductModal({ onCreated, title }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Initial State
    const initialFormState = {
        sku: "",
        name: "",
        description: "",
        categoryId: "",
        createdByUserId: user.userId,
        typeSelect: "PRODUCT",
        unit: "UNIT",
        price: 0,
        priceFixed: true,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);

    // Open/Close Handlers
    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setError(null);
        setFormData(initialFormState);
    };

    // Load Categories when type changes or modal opens
    useEffect(() => {
        if (!isOpen) return;

        setFormData((prev) => ({
            ...prev,
            ['categoryId']: '',
        }));

        const searchCategories = async () => {
            try {
                const res = await getCategories();
                const categoriesFound = res.data ?? [];
                if (formData.typeSelect === 'PRODUCT') {
                    const categoriesSelected = categoriesFound.filter(c => c.allowedFor === 'PRODUCTS' || c.allowedFor === 'BOTH');
                    setCategories(categoriesSelected);
                } else if (formData.typeSelect === 'SERVICE') {
                    const categoriesSelected = categoriesFound.filter(c => c.allowedFor === 'SERVICES' || c.allowedFor === 'BOTH');
                    setCategories(categoriesSelected);
                }
            } catch (error) {
                console.log(error);
            }
        };
        searchCategories();
    }, [formData.typeSelect, isOpen]);

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            let res;
            if (formData.typeSelect === 'PRODUCT') {
                res = await createProducts(formData);
                showAlert('Producto creado', 'Producto creado con exito', 'success');
            } else if (formData.typeSelect === 'SERVICE') {
                res = await createServices(formData);
                showAlert('Servicio creado', 'Servicio creado con exito', 'success');
            }

            if (!res.data) {
                throw new Error('Error al crear producto/servicio');
            }

            closeModal();
            if (onCreated) onCreated();

        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
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
        setFormData(prev => ({ ...prev, [name]: checked }));
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
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
            >
                <FaPlus /><span className='hidden md:inline'>Agregar</span>
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
                            className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{title || "Nuevo Registro"}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Ingresa los detalles del nuevo item</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Body - Scrollable */}
                            <div className="p-6 overflow-y-auto">
                                <form id="addProductForm" onSubmit={handleOnSubmit} className="space-y-6">
                                    
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setFormData(prev => ({ ...prev, typeSelect: 'PRODUCT' }))}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                                                formData.typeSelect === 'PRODUCT' 
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                                : 'border-slate-200 hover:border-emerald-300 text-slate-500'
                                            }`}
                                        >
                                            <FaBoxOpen className="text-2xl" />
                                            <span className="font-semibold text-sm">Producto</span>
                                        </div>
                                        <div 
                                            onClick={() => setFormData(prev => ({ ...prev, typeSelect: 'SERVICE' }))}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                                                formData.typeSelect === 'SERVICE' 
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                                : 'border-slate-200 hover:border-emerald-300 text-slate-500'
                                            }`}
                                        >
                                            <FaHandHoldingHeart className="text-2xl" />
                                            <span className="font-semibold text-sm">Servicio</span>
                                        </div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>

                                    <InputFloatingComponent
                                        label="Descripción"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        autoComplete={null}
                                    />

                                    {/* Selects Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <select
                                                id="categoryId"
                                                name="categoryId"
                                                className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                                                value={formData.categoryId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Selecciona una opción</option>
                                                {categories.map((c) => (
                                                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                                ))}
                                            </select>
                                            <label htmlFor="categoryId" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-emerald-700 pointer-events-none select-none">
                                                Categoría
                                            </label>
                                        </div>

                                        <div className="relative">
                                            <select
                                                id="unit"
                                                name="unit"
                                                className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                                                value={formData.unit}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" disabled>Selecciona una opción</option>
                                                {formData.typeSelect === "PRODUCT" ? (
                                                    <>
                                                        <option value="UNIT">Unidad</option>
                                                        <option value="KILOGRAM">Kg</option>
                                                        <option value="GRAM">g</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="UNIT">Unidad</option>
                                                        <option value="MONT">Mes</option>
                                                        <option value="DAY">Día</option>
                                                        <option value="HOUR">Hora</option>
                                                    </>
                                                )}
                                            </select>
                                            <label htmlFor="unit" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-emerald-700 pointer-events-none select-none">
                                                Unidad de medida
                                            </label>
                                        </div>
                                    </div>

                                    {/* Price Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <InputFloatingComponent
                                            label="Precio"
                                            type="number"
                                            name="price"
                                            value={formData.price || ''}
                                            onChange={handleInputChange}
                                            autoComplete={null}
                                        />
                                        
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    name="priceFixed"
                                                    id="priceFixed"
                                                    checked={formData.priceFixed}
                                                    onChange={handleInputBoxChange}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">Precio Fijo</span>
                                            </label>
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
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-50 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    form="addProductForm"
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Registro'}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}