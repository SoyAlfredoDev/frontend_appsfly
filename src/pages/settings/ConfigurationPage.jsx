import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
    FaCreditCard,
    FaReceipt,
    FaSave,
    FaSpinner,
    FaImage,
    FaTrash,
    FaTruck,
} from "react-icons/fa";
import ExpensePageLayout, { ExpenseAnimatedSection } from "../../components/ui/ExpensePageLayout.jsx";
import ProfileSectionCard from "../../components/profile/ProfileSectionCard.jsx";
import InputFloatingComponent from "../../components/inputs/InputFloatingComponent.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import {
    getBusinessSettingsRequest,
    updateBusinessSettingsRequest,
} from "../../api/businessSettings.js";
import {
    PRIMARY_BTN,
    TABLE_INPUT,
    itemVariants,
} from "../../utils/expenseUiPatterns.js";
import {
    uploadImageToCloudinary,
    CLOUDINARY_FOLDERS,
} from "../../utils/cloudinaryUpload.js";
import { motion as Motion } from "framer-motion";

const EMPTY_FORM = {
    businessName: "",
    businessDocumentNumber: "",
    allowCreditSales: false,
    deliveryControlEnabled: false,
    receiptLogoUrl: "",
    receiptAddress: "",
    receiptPhone: "",
    receiptEmail: "",
    receiptSocial: "",
    receiptFooterNote: "",
};

export default function ConfigurationPage() {
    const { business, businessSelected, user, reloadTenantContext } = useAuth();
    const { isTenantAdmin } = useTenantPermissions();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const businessId =
        businessSelected?.userBusinessBusinessId
        ?? businessSelected?.businessId
        ?? business?.businessId
        ?? null;

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

    const loadSettings = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            const { data } = await getBusinessSettingsRequest(businessId);
            setForm({
                businessName: data.businessName ?? "",
                businessDocumentNumber: data.businessDocumentNumber ?? "",
                allowCreditSales: Boolean(data.allowCreditSales),
                deliveryControlEnabled: Boolean(data.deliveryControlEnabled),
                receiptLogoUrl: data.receiptLogoUrl ?? "",
                receiptAddress: data.receiptAddress ?? "",
                receiptPhone: data.receiptPhone ?? "",
                receiptEmail: data.receiptEmail ?? "",
                receiptSocial: data.receiptSocial ?? "",
                receiptFooterNote: data.receiptFooterNote ?? "",
            });
            setLogoPreview(data.receiptLogoUrl ?? "");
            setLogoFile(null);
        } catch (error) {
            toast.error(
                "Configuración",
                error.response?.data?.error ?? "No se pudo cargar la configuración.",
            );
        } finally {
            setLoading(false);
        }
    }, [businessId, toast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleLogoPick = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.info("Logo", "Selecciona un archivo de imagen.");
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview("");
        setForm((prev) => ({ ...prev, receiptLogoUrl: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!businessId || saving) return;

        setSaving(true);
        try {
            let receiptLogoUrl = form.receiptLogoUrl || null;
            if (logoFile) {
                receiptLogoUrl = await uploadImageToCloudinary(logoFile, {
                    folder: CLOUDINARY_FOLDERS.BUSINESS_LOGO,
                    publicId: `business-${businessId}-logo-${Date.now()}`,
                });
            }

            await updateBusinessSettingsRequest(businessId, {
                businessName: form.businessName.trim(),
                businessDocumentNumber: form.businessDocumentNumber.trim(),
                allowCreditSales: form.allowCreditSales,
                deliveryControlEnabled: form.deliveryControlEnabled,
                receiptLogoUrl,
                receiptAddress: form.receiptAddress.trim(),
                receiptPhone: form.receiptPhone.trim(),
                receiptEmail: form.receiptEmail.trim(),
                receiptSocial: form.receiptSocial.trim(),
                receiptFooterNote: form.receiptFooterNote.trim(),
            });

            if (user?.userId) {
                await reloadTenantContext(user.userId);
            }
            await loadSettings();
            toast.success("Configuración guardada", "Los cambios ya aplican en ventas y comprobantes.");
        } catch (error) {
            toast.error(
                "Error al guardar",
                error.response?.data?.error
                    ?? error.message
                    ?? "No se pudo guardar la configuración.",
            );
        } finally {
            setSaving(false);
        }
    };

    const creditHint = useMemo(
        () => (form.allowCreditSales
            ? "Los vendedores pueden registrar ventas con saldo pendiente (cuenta por cobrar)."
            : "Toda venta debe pagarse al 100 % al momento del registro."),
        [form.allowCreditSales],
    );

    const deliveryHint = useMemo(
        () => (form.deliveryControlEnabled
            ? "Las ventas con productos quedan pendientes de entrega hasta que un usuario las marque como entregadas."
            : "No se mostrarán estados ni acciones de entrega en las ventas."),
        [form.deliveryControlEnabled],
    );

    if (!isTenantAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <ExpensePageLayout
            title="Configuración"
            subtitle="Ajustes del negocio que afectan ventas y comprobantes. Solo administradores."
        >
            {loading ? (
                <ExpenseAnimatedSection>
                    <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
                        <FaSpinner className="animate-spin" />
                        <span>Cargando configuración…</span>
                    </div>
                </ExpenseAnimatedSection>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ExpenseAnimatedSection>
                        <ProfileSectionCard
                            title="Ventas"
                            subtitle="Comportamiento al registrar una nueva venta"
                            icon={FaCreditCard}
                        >
                            <div className="px-6 py-5 space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="allowCreditSales"
                                        checked={form.allowCreditSales}
                                        onChange={handleChange}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                            Permitir venta a crédito
                                        </span>
                                        <span className="block text-xs text-gray-500 mt-0.5">
                                            {creditHint}
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="deliveryControlEnabled"
                                        checked={form.deliveryControlEnabled}
                                        onChange={handleChange}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors inline-flex items-center gap-1.5">
                                            <FaTruck className="text-xs text-gray-400" />
                                            Control de entrega de productos
                                        </span>
                                        <span className="block text-xs text-gray-500 mt-0.5">
                                            {deliveryHint}
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </ProfileSectionCard>
                    </ExpenseAnimatedSection>

                    <ExpenseAnimatedSection>
                        <ProfileSectionCard
                            title="Comprobante de venta"
                            subtitle="Datos que aparecen en el PDF del comprobante interno"
                            icon={FaReceipt}
                        >
                            <div className="px-6 py-5 space-y-5">
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="w-28 h-28 rounded-xl border border-dashed border-gray-300 bg-surface flex items-center justify-center overflow-hidden shrink-0">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo del negocio"
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <FaImage className="text-2xl text-gray-300" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Logo del negocio</p>
                                        <p className="text-xs text-gray-500 max-w-md">
                                            Se muestra en la cabecera del comprobante PDF. Formatos JPG o PNG.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                                            >
                                                {logoPreview ? "Cambiar logo" : "Subir logo"}
                                            </button>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <FaTrash className="text-[10px]" />
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoPick}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <InputFloatingComponent
                                        label="Nombre del negocio"
                                        name="businessName"
                                        value={form.businessName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputFloatingComponent
                                        label="RUT / documento"
                                        name="businessDocumentNumber"
                                        value={form.businessDocumentNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputFloatingComponent
                                        label="Dirección (comprobante)"
                                        name="receiptAddress"
                                        value={form.receiptAddress}
                                        onChange={handleChange}
                                    />
                                    <InputFloatingComponent
                                        label="Teléfono (comprobante)"
                                        name="receiptPhone"
                                        value={form.receiptPhone}
                                        onChange={handleChange}
                                    />
                                    <InputFloatingComponent
                                        label="Correo (comprobante)"
                                        name="receiptEmail"
                                        type="email"
                                        value={form.receiptEmail}
                                        onChange={handleChange}
                                    />
                                    <InputFloatingComponent
                                        label="Redes sociales"
                                        name="receiptSocial"
                                        value={form.receiptSocial}
                                        onChange={handleChange}
                                        placeholder="@mi.negocio"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                        Nota al pie del comprobante
                                    </label>
                                    <textarea
                                        name="receiptFooterNote"
                                        value={form.receiptFooterNote}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`${TABLE_INPUT} resize-none w-full text-sm`}
                                        placeholder="Ej: Gracias por su compra. Válido como comprobante interno."
                                    />
                                </div>
                            </div>
                        </ProfileSectionCard>
                    </ExpenseAnimatedSection>

                    <Motion.div variants={itemVariants} className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`${PRIMARY_BTN} min-w-[160px] justify-center`}
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Guardando…
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </Motion.div>
                </form>
            )}
        </ExpensePageLayout>
    );
}
