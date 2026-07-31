import { useCallback, useEffect, useState } from "react";
import InputFloatingComponent from "../inputs/InputFloatingComponent";
import { useAuth } from "../../context/authContext";
import {
    createCategory,
    getCategories,
    deleteCategory,
    createCategoryAttribute,
    updateCategoryAttribute,
    deleteCategoryAttribute,
} from "../../api/category";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaTags,
    FaPlus,
    FaTrash,
    FaEye,
    FaEyeSlash,
    FaChevronLeft,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext.jsx";

const MySwal = withReactContent(Swal);

const ATTR_TYPES = [
    { value: "TEXT", label: "Texto" },
    { value: "NUMBER", label: "Número" },
    { value: "BOOLEAN", label: "Sí/No" },
    { value: "SELECT", label: "Lista" },
];

export default function CategoryModal({ onCategoryAdded }) {
    const { user } = useAuth();
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("list"); // list | create | attributes
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        categoryName: "",
        allowedForProducts: true,
        allowedForServices: true,
        createdByUserId: user.userId,
    });

    const [attrForm, setAttrForm] = useState({
        attributeKey: "",
        attributeLabel: "",
        dataType: "TEXT",
        optionsText: "",
        isRequired: false,
    });

    const loadCategories = useCallback(async () => {
        try {
            setListLoading(true);
            const res = await getCategories({ params: { includeHiddenAttrs: true } });
            setCategories(res.data ?? []);
        } catch (err) {
            console.log(err);
            toast.error("Error", "No se pudieron cargar las categorías.");
        } finally {
            setListLoading(false);
        }
        // toast is stable enough; omit from deps to avoid reload loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            setView("list");
            setSelectedCategory(null);
            setError(null);
        }
    }, [isOpen, loadCategories]);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setError(null);
        setView("list");
        setSelectedCategory(null);
        setFormData({
            categoryName: "",
            allowedForProducts: true,
            allowedForServices: true,
            createdByUserId: user.userId,
        });
        setAttrForm({
            attributeKey: "",
            attributeLabel: "",
            dataType: "TEXT",
            optionsText: "",
            isRequired: false,
        });
    };

    const notifyParent = () => {
        if (onCategoryAdded) onCategoryAdded();
    };

    const createCategoryFn = async (data) => {
        try {
            setLoading(true);
            const category = await createCategory(data);
            if (category.status === 200) {
                toast.success("Categoría creada", `${category.data.categoryName} se creó con éxito`);
                setFormData({
                    categoryName: "",
                    allowedForProducts: true,
                    allowedForServices: true,
                    createdByUserId: user.userId,
                });
                await loadCategories();
                setView("list");
                notifyParent();
            } else {
                toast.error("Error", "La categoría no se pudo crear");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Error desconocido";
            setError(msg);
            toast.error("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        let allowedFor = "NONE";
        if (formData.allowedForProducts && formData.allowedForServices) {
            allowedFor = "BOTH";
        } else if (formData.allowedForProducts) {
            allowedFor = "PRODUCTS";
        } else if (formData.allowedForServices) {
            allowedFor = "SERVICES";
        } else {
            setError("Debe seleccionar para qué tipo aplica la categoría (Producto o Servicio)");
            return;
        }

        const formattedName = formData.categoryName
            .trim()
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase());

        createCategoryFn({
            ...formData,
            categoryName: formattedName,
            allowedFor,
        });
    };

    const handleDeleteCategory = async (cat) => {
        if (cat.isSystem) return;
        const result = await MySwal.fire({
            title: `¿Eliminar “${cat.categoryName}”?`,
            text: "Solo se puede eliminar si no tiene productos o servicios asociados.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            customClass: { confirmButton: "bg-red-600" },
        });
        if (!result.isConfirmed) return;

        try {
            await deleteCategory(cat.categoryId);
            toast.success("Eliminada", "La categoría se eliminó correctamente.");
            await loadCategories();
            notifyParent();
        } catch (err) {
            toast.error("Error", err.response?.data?.message || "No se pudo eliminar.");
        }
    };

    const openAttributes = (cat) => {
        setSelectedCategory(cat);
        setView("attributes");
        setAttrForm({
            attributeKey: "",
            attributeLabel: "",
            dataType: "TEXT",
            optionsText: "",
            isRequired: false,
        });
        setError(null);
    };

    const refreshSelected = async () => {
        const res = await getCategories({ params: { includeHiddenAttrs: true } });
        const list = res.data ?? [];
        setCategories(list);
        if (selectedCategory) {
            const fresh = list.find((c) => c.categoryId === selectedCategory.categoryId);
            setSelectedCategory(fresh || null);
        }
        notifyParent();
    };

    const handleToggleVisibility = async (attr) => {
        try {
            await updateCategoryAttribute(selectedCategory.categoryId, attr.categoryAttributeId, {
                isVisible: !attr.isVisible,
            });
            await refreshSelected();
            toast.success(
                attr.isVisible ? "Atributo oculto" : "Atributo visible",
                attr.attributeLabel,
            );
        } catch (err) {
            toast.error("Error", err.response?.data?.message || "No se pudo actualizar.");
        }
    };

    const handleDeleteAttribute = async (attr) => {
        if (attr.isSystem) return;
        const result = await MySwal.fire({
            title: `¿Eliminar “${attr.attributeLabel}”?`,
            text: "Se borrarán los valores de este atributo en los productos.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            customClass: { confirmButton: "bg-red-600" },
        });
        if (!result.isConfirmed) return;

        try {
            await deleteCategoryAttribute(selectedCategory.categoryId, attr.categoryAttributeId);
            await refreshSelected();
            toast.success("Atributo eliminado", attr.attributeLabel);
        } catch (err) {
            toast.error("Error", err.response?.data?.message || "No se pudo eliminar.");
        }
    };

    const handleCreateAttribute = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return;
        if (!attrForm.attributeLabel.trim()) {
            setError("El nombre del atributo es obligatorio.");
            return;
        }
        const key =
            attrForm.attributeKey.trim() ||
            attrForm.attributeLabel
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "");

        const payload = {
            attributeKey: key,
            attributeLabel: attrForm.attributeLabel.trim(),
            dataType: attrForm.dataType,
            isRequired: attrForm.isRequired,
            optionsJson:
                attrForm.dataType === "SELECT"
                    ? JSON.stringify(
                          attrForm.optionsText
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                      )
                    : null,
        };

        try {
            setLoading(true);
            await createCategoryAttribute(selectedCategory.categoryId, payload);
            setAttrForm({
                attributeKey: "",
                attributeLabel: "",
                dataType: "TEXT",
                optionsText: "",
                isRequired: false,
            });
            setError(null);
            await refreshSelected();
            toast.success("Atributo creado", payload.attributeLabel);
        } catch (err) {
            const msg = err.response?.data?.message || "No se pudo crear el atributo.";
            setError(msg);
            toast.error("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const headerTitle =
        view === "create"
            ? "Nueva categoría"
            : view === "attributes"
              ? `Atributos · ${selectedCategory?.categoryName || ""}`
              : "Administrar categorías";

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
                            className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-2 min-w-0">
                                    {view !== "list" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setView("list");
                                                setSelectedCategory(null);
                                                setError(null);
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800 truncate">{headerTitle}</h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {view === "list" && (
                                    <div className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setView("create");
                                                setError(null);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                                        >
                                            <FaPlus /> Nueva categoría
                                        </button>

                                        {listLoading ? (
                                            <p className="text-sm text-gray-500 text-center py-6">Cargando…</p>
                                        ) : categories.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-6">
                                                No hay categorías aún.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {categories.map((cat) => (
                                                    <li
                                                        key={cat.categoryId}
                                                        className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                                    {cat.categoryName}
                                                                </span>
                                                                {cat.isSystem && (
                                                                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                                                                        Sistema
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {(cat.attributes?.length ?? 0)} atributo
                                                                {(cat.attributes?.length ?? 0) === 1 ? "" : "s"}
                                                                {cat.categoryCode ? ` · ${cat.categoryCode}` : ""}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openAttributes(cat)}
                                                            className="px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20"
                                                        >
                                                            Atributos
                                                        </button>
                                                        {!cat.isSystem && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteCategory(cat)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                                                title="Eliminar"
                                                            >
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {view === "create" && (
                                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <InputFloatingComponent
                                                label="Nombre de Categoría"
                                                name="categoryName"
                                                value={formData.categoryName}
                                                onChange={handleInputChange}
                                                autoComplete={null}
                                            />

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-sm font-semibold text-gray-700 mb-3 block">
                                                    Disponible para:
                                                </p>
                                                <div className="flex gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                                            type="checkbox"
                                                            name="allowedForProducts"
                                                            checked={formData.allowedForProducts}
                                                            onChange={handleCheckboxChange}
                                                        />
                                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                                            Productos
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                                            type="checkbox"
                                                            name="allowedForServices"
                                                            checked={formData.allowedForServices}
                                                            onChange={handleCheckboxChange}
                                                        />
                                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                                            Servicios
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => setView("list")}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                disabled={loading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                {loading ? "Creando..." : "Crear Categoría"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {view === "attributes" && selectedCategory && (
                                    <div className="space-y-5">
                                        {selectedCategory.isSystem && (
                                            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
                                                Categoría de sistema: no se puede eliminar ni renombrar. Puedes
                                                ocultar atributos del sistema y agregar atributos personalizados.
                                            </p>
                                        )}

                                        <ul className="space-y-2">
                                            {(selectedCategory.attributes || []).map((attr) => (
                                                <li
                                                    key={attr.categoryAttributeId}
                                                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                                                        attr.isVisible
                                                            ? "border-gray-100 bg-white"
                                                            : "border-dashed border-gray-200 bg-gray-50 opacity-70"
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {attr.attributeLabel}
                                                            </span>
                                                            {attr.isSystem && (
                                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                                                                    Sistema
                                                                </span>
                                                            )}
                                                            {!attr.isVisible && (
                                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                                                                    Oculto
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {attr.attributeKey} · {attr.dataType}
                                                            {attr.isRequired ? " · requerido" : ""}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleVisibility(attr)}
                                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                                        title={attr.isVisible ? "Ocultar" : "Mostrar"}
                                                    >
                                                        {attr.isVisible ? <FaEye /> : <FaEyeSlash />}
                                                    </button>
                                                    {!attr.isSystem && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAttribute(attr)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                            {(selectedCategory.attributes || []).length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    Sin atributos. Agrega uno personalizado abajo.
                                                </p>
                                            )}
                                        </ul>

                                        <form
                                            onSubmit={handleCreateAttribute}
                                            className="space-y-3 border-t border-gray-100 pt-4"
                                        >
                                            <p className="text-sm font-semibold text-gray-700">
                                                Agregar atributo personalizado
                                            </p>
                                            <InputFloatingComponent
                                                label="Etiqueta"
                                                name="attributeLabel"
                                                value={attrForm.attributeLabel}
                                                onChange={(e) =>
                                                    setAttrForm((prev) => ({
                                                        ...prev,
                                                        attributeLabel: e.target.value,
                                                    }))
                                                }
                                                autoComplete={null}
                                            />
                                            <InputFloatingComponent
                                                label="Clave (opcional)"
                                                name="attributeKey"
                                                value={attrForm.attributeKey}
                                                onChange={(e) =>
                                                    setAttrForm((prev) => ({
                                                        ...prev,
                                                        attributeKey: e.target.value,
                                                    }))
                                                }
                                                autoComplete={null}
                                            />
                                            <div className="relative">
                                                <select
                                                    id="attrDataType"
                                                    className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:border-primary peer"
                                                    value={attrForm.dataType}
                                                    onChange={(e) =>
                                                        setAttrForm((prev) => ({
                                                            ...prev,
                                                            dataType: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {ATTR_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label
                                                    htmlFor="attrDataType"
                                                    className="absolute text-sm text-slate-500 -translate-y-3 scale-75 top-3.5 start-3 origin-[0] pointer-events-none"
                                                >
                                                    Tipo
                                                </label>
                                            </div>
                                            {attrForm.dataType === "SELECT" && (
                                                <InputFloatingComponent
                                                    label="Opciones (separadas por coma)"
                                                    name="optionsText"
                                                    value={attrForm.optionsText}
                                                    onChange={(e) =>
                                                        setAttrForm((prev) => ({
                                                            ...prev,
                                                            optionsText: e.target.value,
                                                        }))
                                                    }
                                                    autoComplete={null}
                                                />
                                            )}
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={attrForm.isRequired}
                                                    onChange={(e) =>
                                                        setAttrForm((prev) => ({
                                                            ...prev,
                                                            isRequired: e.target.checked,
                                                        }))
                                                    }
                                                    className="rounded text-emerald-600 border-gray-300"
                                                />
                                                Obligatorio
                                            </label>

                                            {error && (
                                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {loading ? "Guardando…" : "Agregar atributo"}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
