import { useEffect, useMemo, useState } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import { createProducts, updateProducts, getProductById } from "../../api/product.js";
import { createServices } from "../../api/service.js";
import { getCategories } from "../../api/category.js";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaBoxOpen, FaHandHoldingHeart, FaEdit } from "react-icons/fa";
import { useToast } from "../../context/ToastContext.jsx";
import { isOpticsBusiness } from "../../utils/businessModality.js";

function parseAttrOptions(optionsJson) {
    if (!optionsJson) return [];
    try {
        const parsed = JSON.parse(optionsJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return String(optionsJson)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
}

function boolFromStored(value) {
    return value === true || value === "true" || value === "1";
}

const LAB_WORK_CODES = new Set(["FRAMES", "LENSES"]);

export default function AddProductModal({
    onCreated,
    onUpdated,
    title,
    productToEdit = null,
    productId = null,
    trigger = "default",
}) {
    const { user, business } = useAuth();
    const toast = useToast();
    const showOpticsFields = isOpticsBusiness(business);
    const isEditMode = Boolean(productToEdit || productId);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);

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
        allowZeroStock: false,
        productRequiresLabWork: false,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [attributes, setAttributes] = useState({});
    const [codes, setCodes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);

    const selectedCategory = useMemo(
        () => categories.find((c) => c.categoryId === formData.categoryId) || null,
        [categories, formData.categoryId],
    );

    const visibleAttributes = useMemo(() => {
        if (formData.typeSelect !== "PRODUCT") return [];
        const attrs = selectedCategory?.attributes ?? [];
        return attrs.filter((a) => a.isVisible !== false);
    }, [selectedCategory, formData.typeSelect]);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setError(null);
        setFormData(initialFormState);
        setAttributes({});
        setCodes([]);
        setEditingProductId(null);
    };

    const codesFromProduct = (product) =>
        (product.codes || [])
            .filter((c) => c.codeType === "BARCODE" || c.codeType === "QR")
            .map((c) => ({
                codeType: c.codeType,
                codeValue: c.codeValue || "",
                isPrimary: Boolean(c.isPrimary),
            }));

    const applyProductToForm = (product) => {
        setEditingProductId(product.productId);
        setFormData({
            sku: product.productSKU || "",
            name: product.productName || "",
            description: product.productDescription || "",
            categoryId: product.categoryId || "",
            createdByUserId: user.userId,
            typeSelect: "PRODUCT",
            unit: product.productUnit || "UNIT",
            price: product.productPrice ?? 0,
            priceFixed: product.productPriceFixed !== false,
            allowZeroStock: product.productAllowZeroStock === true,
            productRequiresLabWork: product.productRequiresLabWork === true,
        });
        setAttributes(product.attributes && typeof product.attributes === "object" ? { ...product.attributes } : {});
        setCodes(codesFromProduct(product));
    };

    useEffect(() => {
        if (!isOpen) return;

        const load = async () => {
            try {
                const res = await getCategories();
                const categoriesFound = res.data ?? [];
                if (formData.typeSelect === "PRODUCT") {
                    setCategories(
                        categoriesFound.filter(
                            (c) => c.allowedFor === "PRODUCTS" || c.allowedFor === "BOTH",
                        ),
                    );
                } else {
                    setCategories(
                        categoriesFound.filter(
                            (c) => c.allowedFor === "SERVICES" || c.allowedFor === "BOTH",
                        ),
                    );
                }
            } catch (err) {
                console.log(err);
            }
        };
        load();
    }, [formData.typeSelect, isOpen]);

    useEffect(() => {
        if (!isOpen || !isEditMode) return;

        const loadProduct = async () => {
            try {
                setLoadingProduct(true);
                let product = productToEdit;
                if (!product?.codes && (productId || productToEdit?.productId)) {
                    const id = productId || productToEdit.productId;
                    const res = await getProductById(id);
                    product = res.data?.product || res.data;
                }
                if (product?.productId) applyProductToForm(product);
            } catch (err) {
                const msg = err.response?.data?.message || "No se pudo cargar el producto.";
                setError(msg);
                toast.error("Error", msg);
            } finally {
                setLoadingProduct(false);
            }
        };
        loadProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEditMode, productId, productToEdit?.productId]);

    useEffect(() => {
        if (!selectedCategory || isEditMode) return;
        if (LAB_WORK_CODES.has(selectedCategory.categoryCode) && showOpticsFields) {
            setFormData((prev) => ({ ...prev, productRequiresLabWork: true }));
        }
    }, [selectedCategory?.categoryId, selectedCategory?.categoryCode, showOpticsFields, isEditMode]);

    const handleCategoryChange = (e) => {
        const { value } = e.target;
        const cat = categories.find((c) => c.categoryId === value);
        const suggestLab =
            Boolean(cat) && LAB_WORK_CODES.has(cat.categoryCode) && showOpticsFields;
        setFormData((prev) => ({
            ...prev,
            categoryId: value,
            ...(suggestLab ? { productRequiresLabWork: true } : {}),
        }));
        setAttributes({});
    };

    const handleAttrChange = (key, value) => {
        setAttributes((prev) => ({ ...prev, [key]: value }));
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name?.trim() || !formData.sku?.trim() || !formData.categoryId) {
            toast.info("Campos incompletos", "Completa nombre, SKU y categoría antes de guardar.");
            return;
        }

        const missingRequired = visibleAttributes.filter(
            (a) => a.isRequired && (attributes[a.attributeKey] === undefined || attributes[a.attributeKey] === "" || attributes[a.attributeKey] === null),
        );
        if (missingRequired.length > 0) {
            toast.info(
                "Atributos incompletos",
                `Completa: ${missingRequired.map((a) => a.attributeLabel).join(", ")}`,
            );
            return;
        }

        try {
            setLoading(true);
            let res;
            if (formData.typeSelect === "PRODUCT") {
                const payload = {
                    ...formData,
                    attributes,
                    codes: codes
                        .map((c) => ({
                            codeType: c.codeType,
                            codeValue: String(c.codeValue || "").trim(),
                            isPrimary: Boolean(c.isPrimary),
                        }))
                        .filter((c) => c.codeValue),
                };
                if (editingProductId) {
                    res = await updateProducts(editingProductId, payload);
                } else {
                    res = await createProducts(payload);
                }
            } else if (formData.typeSelect === "SERVICE") {
                res = await createServices(formData);
            }

            if (!res?.data) {
                throw new Error("Error al guardar producto/servicio");
            }

            const isProduct = formData.typeSelect === "PRODUCT";
            const wasEdit = Boolean(editingProductId);
            toast.success(
                wasEdit ? "Producto actualizado" : isProduct ? "Producto creado" : "Servicio creado",
                wasEdit
                    ? "Los cambios se guardaron correctamente."
                    : isProduct
                      ? "El producto se registró correctamente."
                      : "El servicio se registró correctamente.",
            );

            closeModal();
            if (wasEdit && onUpdated) onUpdated(res.data?.product || res.data);
            else if (onCreated) onCreated();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "No se pudo guardar el registro.";
            setError(msg);
            toast.error("Error", msg);
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
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleTypeSelect = (type) => {
        if (isEditMode) return;
        setFormData((prev) => ({
            ...prev,
            typeSelect: type,
            categoryId: "",
            unit: "UNIT",
        }));
        setAttributes({});
    };

    const renderAttributeField = (attr) => {
        const key = attr.attributeKey;
        const value = attributes[key] ?? "";
        const label = `${attr.attributeLabel}${attr.isRequired ? " *" : ""}`;

        if (attr.dataType === "BOOLEAN") {
            return (
                <label
                    key={attr.categoryAttributeId || key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer"
                >
                    <input
                        type="checkbox"
                        checked={boolFromStored(value)}
                        onChange={(e) => handleAttrChange(key, e.target.checked)}
                        className="rounded text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
            );
        }

        if (attr.dataType === "SELECT") {
            const options = parseAttrOptions(attr.optionsJson);
            return (
                <div key={attr.categoryAttributeId || key} className="relative">
                    <select
                        id={`attr_${key}`}
                        className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors"
                        value={value}
                        onChange={(e) => handleAttrChange(key, e.target.value)}
                        required={attr.isRequired}
                    >
                        <option value="">Selecciona…</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    <label
                        htmlFor={`attr_${key}`}
                        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                    >
                        {label}
                    </label>
                </div>
            );
        }

        return (
            <InputFloatingComponent
                key={attr.categoryAttributeId || key}
                label={label}
                type={attr.dataType === "NUMBER" ? "number" : "text"}
                name={`attr_${key}`}
                value={value}
                onChange={(e) => handleAttrChange(key, e.target.value)}
                autoComplete={null}
            />
        );
    };

    const triggerButton =
        trigger === "edit" ? (
            <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
            >
                <FaEdit />
                <span>Editar</span>
            </button>
        ) : (
            <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm text-sm font-medium"
            >
                <FaPlus />
                <span className="hidden md:inline">Agregar</span>
            </button>
        );

    return (
        <>
            {triggerButton}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />

                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {title || (isEditMode ? "Editar producto" : "Nuevo Registro")}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isEditMode
                                            ? "Actualiza los datos del producto"
                                            : "Ingresa los detalles del nuevo item"}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {loadingProduct ? (
                                    <div className="py-12 text-center text-sm text-gray-500">Cargando producto…</div>
                                ) : (
                                    <form id="addProductForm" onSubmit={handleOnSubmit} className="space-y-6">
                                        {!isEditMode && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div
                                                    onClick={() => handleTypeSelect("PRODUCT")}
                                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                                                        formData.typeSelect === "PRODUCT"
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-slate-200 hover:border-primary/40 text-slate-500"
                                                    }`}
                                                >
                                                    <FaBoxOpen className="text-2xl" />
                                                    <span className="font-semibold text-sm">Producto</span>
                                                </div>
                                                <div
                                                    onClick={() => handleTypeSelect("SERVICE")}
                                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                                                        formData.typeSelect === "SERVICE"
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-slate-200 hover:border-primary/40 text-slate-500"
                                                    }`}
                                                >
                                                    <FaHandHoldingHeart className="text-2xl" />
                                                    <span className="font-semibold text-sm">Servicio</span>
                                                </div>
                                            </div>
                                        )}

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

                                        {formData.typeSelect === "PRODUCT" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700">
                                                            Códigos de barras / QR
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            El SKU también es escaneable. Agrega EAN u otros códigos aquí.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCodes((prev) => [
                                                                ...prev,
                                                                { codeType: "BARCODE", codeValue: "", isPrimary: false },
                                                            ])
                                                        }
                                                        className="text-xs font-medium text-primary hover:underline"
                                                    >
                                                        + Agregar
                                                    </button>
                                                </div>
                                                {codes.length === 0 ? (
                                                    <p className="text-xs text-gray-400">Sin códigos adicionales.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {codes.map((code, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="grid grid-cols-[110px_1fr_auto] gap-2 items-center"
                                                            >
                                                                <select
                                                                    className="px-2 py-2 text-sm border border-slate-300 rounded-md bg-white"
                                                                    value={code.codeType}
                                                                    onChange={(e) => {
                                                                        const next = [...codes];
                                                                        next[idx] = {
                                                                            ...next[idx],
                                                                            codeType: e.target.value,
                                                                        };
                                                                        setCodes(next);
                                                                    }}
                                                                >
                                                                    <option value="BARCODE">Barcode</option>
                                                                    <option value="QR">QR</option>
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    className="px-3 py-2 text-sm border border-slate-300 rounded-md"
                                                                    placeholder="Valor del código"
                                                                    value={code.codeValue}
                                                                    onChange={(e) => {
                                                                        const next = [...codes];
                                                                        next[idx] = {
                                                                            ...next[idx],
                                                                            codeValue: e.target.value,
                                                                        };
                                                                        setCodes(next);
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setCodes((prev) =>
                                                                            prev.filter((_, i) => i !== idx),
                                                                        )
                                                                    }
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                                                    title="Quitar"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <select
                                                    id="categoryId"
                                                    name="categoryId"
                                                    className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors"
                                                    value={formData.categoryId}
                                                    onChange={handleCategoryChange}
                                                    required
                                                >
                                                    <option value="">Selecciona una opción</option>
                                                    {categories.map((c) => (
                                                        <option key={c.categoryId} value={c.categoryId}>
                                                            {c.categoryName}
                                                            {c.isSystem ? " (Sistema)" : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label
                                                    htmlFor="categoryId"
                                                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                                >
                                                    Categoría
                                                </label>
                                            </div>

                                            <div className="relative">
                                                <select
                                                    id="unit"
                                                    name="unit"
                                                    className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-primary peer transition-colors"
                                                    value={formData.unit}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Selecciona una opción
                                                    </option>
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
                                                <label
                                                    htmlFor="unit"
                                                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-primary pointer-events-none select-none"
                                                >
                                                    Unidad de medida
                                                </label>
                                            </div>
                                        </div>

                                        {visibleAttributes.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
                                                    Atributos de categoría
                                                    {selectedCategory?.categoryName
                                                        ? ` · ${selectedCategory.categoryName}`
                                                        : ""}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {visibleAttributes.map(renderAttributeField)}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                            <InputFloatingComponent
                                                label="Precio"
                                                type="number"
                                                name="price"
                                                value={formData.price || ""}
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
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        Precio Fijo
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {formData.typeSelect === "PRODUCT" && (
                                            <div className="flex items-start gap-3 p-4 bg-amber-50/60 rounded-lg border border-amber-100">
                                                <label className="relative inline-flex items-start cursor-pointer gap-3">
                                                    <input
                                                        type="checkbox"
                                                        name="allowZeroStock"
                                                        id="allowZeroStock"
                                                        checked={formData.allowZeroStock}
                                                        onChange={handleInputBoxChange}
                                                        className="mt-1 rounded text-primary focus:ring-primary border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800 block">
                                                            Permitir venta con stock en cero
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1 block leading-relaxed">
                                                            Si está activo, el producto podrá venderse aunque no haya
                                                            unidades disponibles.
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {showOpticsFields && formData.typeSelect === "PRODUCT" && (
                                            <div className="flex items-start gap-3 p-4 bg-teal-50/60 rounded-lg border border-teal-100">
                                                <label className="relative inline-flex items-start cursor-pointer gap-3">
                                                    <input
                                                        type="checkbox"
                                                        name="productRequiresLabWork"
                                                        id="productRequiresLabWork"
                                                        checked={formData.productRequiresLabWork}
                                                        onChange={handleInputBoxChange}
                                                        className="mt-1 rounded text-primary focus:ring-primary border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800 block">
                                                            Requiere orden de trabajo (laboratorio)
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1 block leading-relaxed">
                                                            Al generar OT desde una venta, este producto se
                                                            preseleccionará automáticamente.
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

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
                                )}
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t border-gray-50 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    form="addProductForm"
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || loadingProduct}
                                >
                                    {loading
                                        ? "Guardando..."
                                        : isEditMode || editingProductId
                                          ? "Guardar cambios"
                                          : "Crear Registro"}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
