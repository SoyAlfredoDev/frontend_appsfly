import InputFloatingComponent from "../../components/inputs/InputFloatingComponent";
import FloatingSelectField from "../../components/inputs/FloatingSelectField.jsx";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { createBusiness } from "../../api/business.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion } from "framer-motion";
import { FaStore, FaBuilding, FaIdCard, FaEnvelope, FaCheck, FaSpinner } from "react-icons/fa";
import PageContainer from "../../components/layout/PageContainer.jsx";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";
import AuthAlert from "../../components/auth/AuthAlert.jsx";

const MySwal = withReactContent(Swal);

export default function RegisterBusinessPage() {
    const { user, reloadTenantContext } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        businessId: uuidv4(),
        businessName: "",
        businessEmail: "",
        businessWhatsappNumber: "",
        businessType: 0,
        businessDocumentNumber: "",
        businessDocumentType: 0,
        businessEntity: 0,
        businessPhoneNumber: "",
        businessCodePhoneNumber: "+56",
        businessCodeWhatsappNumber: "+56",
        businessCountry: 0,
        businessStatus: "PENDING",
    });

    const [validations, setValidations] = useState({});

    const businessTypesList = {
        minimarket: "Minimarket",
        cafe: "Cafetería / restaurante pequeño",
        optics: "Óptica",
        veterinary: "Veterinaria",
        hair_salon: "Peluquería / barbería",
        clothing_store: "Tienda de ropa / boutique",
    };

    const countryCodes = [
        { id: "+56", name: "Chile" },
        { id: "+54", name: "Argentina" },
        { id: "+61", name: "Australia" },
        { id: "+32", name: "Bélgica" },
        { id: "+591", name: "Bolivia" },
        { id: "+55", name: "Brasil" },
        { id: "+57", name: "Colombia" },
        { id: "+506", name: "Costa Rica" },
        { id: "+593", name: "Ecuador" },
        { id: "+34", name: "España" },
        { id: "+33", name: "Francia" },
        { id: "+49", name: "Alemania" },
        { id: "+39", name: "Italia" },
        { id: "+81", name: "Japón" },
        { id: "+52", name: "México" },
        { id: "+51", name: "Perú" },
        { id: "+44", name: "Reino Unido" },
        { id: "+1", name: "Estados Unidos" },
        { id: "+598", name: "Uruguay" },
        { id: "+58", name: "Venezuela" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidations((prev) => ({ ...prev, [name]: true }));
        if (error) setError(null);
    };

    const handleChangeSelectBusinessEntity = (e) => {
        const { value } = e.target;
        let updatedData = { ...formData, businessEntity: value };

        if (value === "INDIVIDUAL") {
            updatedData = {
                ...updatedData,
                businessDocumentNumber: user?.userDocumentNumber || "",
                businessDocumentType: user?.userDocumentType || "rut",
                businessName:
                    `${user?.userFirstName || ""} ${user?.userLastName || ""} (Negocio)`.trim(),
            };
        } else if (formData.businessEntity === "INDIVIDUAL") {
            updatedData = {
                ...updatedData,
                businessDocumentNumber: "",
                businessDocumentType: 0,
                businessName: "",
            };
        }
        setFormData(updatedData);
        setValidations((prev) => ({ ...prev, businessEntity: true }));
    };

    const validateForm = () => {
        const newValidations = {
            businessEntity: formData.businessEntity !== 0 && formData.businessEntity !== "0",
            businessName: formData.businessName.trim() !== "",
            businessCountry: formData.businessCountry !== 0 && formData.businessCountry !== "0",
            businessDocumentType:
                formData.businessDocumentType !== 0 && formData.businessDocumentType !== "0",
            businessDocumentNumber: formData.businessDocumentNumber.trim() !== "",
            businessType: formData.businessType !== 0 && formData.businessType !== "0",
            businessEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail.trim()),
            businessPhoneNumber: /^\d{3,15}$/.test(formData.businessPhoneNumber.trim()),
            businessCodePhoneNumber: formData.businessCodePhoneNumber.trim().startsWith("+"),
            businessCodeWhatsappNumber: formData.businessCodeWhatsappNumber.trim().startsWith("+"),
        };
        setValidations(newValidations);
        return Object.values(newValidations).every((v) => v === true);
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!validateForm()) {
            setError("Por favor completa todos los campos requeridos correctamente.");
            return;
        }

        setIsSubmitting(true);

        try {
            const businessCreated = await createBusiness(formData);

            if (businessCreated.status === 201 || businessCreated.status === 200) {
                await reloadTenantContext(user?.userId);

                await MySwal.fire({
                    title: <strong className="text-dark">¡Éxito!</strong>,
                    html: <p className="text-slate-600">Tu negocio ha sido registrado correctamente.</p>,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: "#01c676",
                });

                navigate("/dashboard");
            } else if (businessCreated.status === 202) {
                await reloadTenantContext(user?.userId);
                toast.success("Tu negocio se ha registrado", "pero requiere revisión adicional.");
                navigate("/dashboard");
            } else {
                setError(businessCreated.data?.message || "Ocurrió un error inesperado.");
            }
        } catch (submitError) {
            console.error("Error creating business:", submitError);
            setError(
                submitError.response?.data?.message ||
                    "Error de conexión. Por favor intenta nuevamente.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const sectionTitleClass =
        "text-base font-semibold text-dark font-display flex items-center gap-2";

    return (
        <PageContainer>
            <RestrictedAccessShell
                icon={FaStore}
                title="Registrar negocio"
                subtitle="Crea tu espacio de trabajo en AppsFly"
                headerClassName="bg-gradient-to-br from-[#021f41] via-[#0a2d52] to-[#01c676]/80"
                embedded
                maxWidthClass="max-w-4xl"
            >
                <form onSubmit={handleOnSubmit} className="space-y-8" noValidate>
                    {error && <AuthAlert variant="error">{error}</AuthAlert>}

                    <section className="space-y-4">
                        <h3 className={sectionTitleClass}>
                            <FaBuilding className="text-primary" />
                            Información general
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingSelectField
                                label="Registrar como"
                                name="businessEntity"
                                value={formData.businessEntity}
                                onChange={handleChangeSelectBusinessEntity}
                                isValid={validations.businessEntity}
                                disabled={isSubmitting}
                                options={[
                                    { value: 0, label: "Selecciona el tipo de entidad", disabled: true },
                                    { value: "INDIVIDUAL", label: "Persona Natural" },
                                    { value: "COMPANY", label: "Empresa / Jurídica" },
                                ]}
                            />
                            <InputFloatingComponent
                                label="Nombre del Negocio"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                isValid={validations.businessName}
                                disabled={isSubmitting}
                            />
                            <FloatingSelectField
                                label="Tipo de Negocio"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleChange}
                                isValid={validations.businessType}
                                disabled={isSubmitting}
                                options={[
                                    { value: 0, label: "Selecciona el rubro", disabled: true },
                                    ...Object.entries(businessTypesList).map(([key, value]) => ({
                                        value: key,
                                        label: value,
                                    })),
                                ]}
                            />
                            <FloatingSelectField
                                label="País"
                                name="businessCountry"
                                value={formData.businessCountry}
                                onChange={handleChange}
                                isValid={validations.businessCountry}
                                disabled={isSubmitting}
                                options={[
                                    { value: 0, label: "Selecciona país", disabled: true },
                                    { value: "chile", label: "Chile" },
                                ]}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className={sectionTitleClass}>
                            <FaIdCard className="text-primary" />
                            Identificación del negocio
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FloatingSelectField
                                label="Documento"
                                name="businessDocumentType"
                                value={formData.businessDocumentType}
                                onChange={handleChange}
                                isValid={validations.businessDocumentType}
                                disabled={isSubmitting}
                                options={[
                                    { value: 0, label: "Tipo", disabled: true },
                                    { value: "rut", label: "RUT" },
                                    { value: "passport", label: "Pasaporte" },
                                    { value: "other", label: "Otro" },
                                ]}
                            />
                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="Número de documento"
                                    name="businessDocumentNumber"
                                    value={formData.businessDocumentNumber}
                                    onChange={handleChange}
                                    isValid={validations.businessDocumentNumber}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className={sectionTitleClass}>
                            <FaEnvelope className="text-primary" />
                            Contacto
                        </h3>
                        <InputFloatingComponent
                            label="Correo Electrónico Principal"
                            name="businessEmail"
                            type="email"
                            value={formData.businessEmail}
                            onChange={handleChange}
                            isValid={validations.businessEmail}
                            disabled={isSubmitting}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FloatingSelectField
                                label="Código"
                                name="businessCodePhoneNumber"
                                value={formData.businessCodePhoneNumber}
                                onChange={handleChange}
                                isValid={validations.businessCodePhoneNumber}
                                disabled={isSubmitting}
                                required={false}
                                options={countryCodes.map((c) => ({
                                    value: c.id,
                                    label: `${c.name} (${c.id})`,
                                }))}
                            />
                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="Teléfono Móvil"
                                    name="businessPhoneNumber"
                                    value={formData.businessPhoneNumber}
                                    onChange={handleChange}
                                    isValid={validations.businessPhoneNumber}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FloatingSelectField
                                label="Código WhatsApp"
                                name="businessCodeWhatsappNumber"
                                value={formData.businessCodeWhatsappNumber}
                                onChange={handleChange}
                                isValid={validations.businessCodeWhatsappNumber}
                                disabled={isSubmitting}
                                required={false}
                                options={countryCodes.map((c) => ({
                                    value: c.id,
                                    label: `${c.name} (${c.id})`,
                                }))}
                            />
                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="WhatsApp (Opcional)"
                                    name="businessWhatsappNumber"
                                    value={formData.businessWhatsappNumber}
                                    onChange={handleChange}
                                    required={false}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <Link
                            to={isSubmitting ? "#" : "/dashboard"}
                            className={`btn-ghost w-full sm:w-auto justify-center no-underline ${
                                isSubmitting ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                            Cancelar
                        </Link>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={isSubmitting ? undefined : { scale: 1.02 }}
                            whileTap={isSubmitting ? undefined : { scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 24 }}
                            className="btn-primary w-full sm:w-auto !py-3 !px-8 justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin h-4 w-4" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Registrar negocio
                                    <FaCheck />
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </RestrictedAccessShell>
        </PageContainer>
    );
}
