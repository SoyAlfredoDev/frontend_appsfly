import InputFloatingComponent from "../../components/inputs/InputFloatingComponent";
import NavBarComponent from "../../components/NavBarComponent";
import { v4 as uuidv4 } from 'uuid';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createBusiness } from '../../api/business.js';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion } from "framer-motion";
import { FaStore, FaBuilding, FaIdCard, FaEnvelope, FaCheck } from "react-icons/fa";
const MySwal = withReactContent(Swal);

export default function RegisterBusinessPage() {
    const { setHasBusiness, user , setBusinessSelected} = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
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
        businessCodePhoneNumber: '+56',
        businessCodeWhatsappNumber: '+56',
        businessCountry: 0,
        businessStatus: 'PENDING'
    });

    // Validation State
    const [validations, setValidations] = useState({});

    // Lists
    const businessTypesList = {
        minimarket: 'Minimarket',
        cafe: 'Cafetería / restaurante pequeño',
        optics: 'Óptica',
        veterinary: 'Veterinaria',
        hair_salon: 'Peluquería / barbería',
        clothing_store: 'Tienda de ropa / boutique'
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
        { id: "+58", name: "Venezuela" }
    ];


    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        setValidations((prev) => ({ ...prev, [name]: true }));
        if (error) setError(null);
    };

    const handleChangeSelectBusinessEntity = (e) => {
        const { value } = e.target;
        let updatedData = { ...formData, businessEntity: value };

        if (value === 'INDIVIDUAL') {
            updatedData = {
                ...updatedData,
                businessDocumentNumber: user?.userDocumentNumber || '',
                businessDocumentType: user?.userDocumentType || 'rut',
                businessName: `${user?.userFirstName || ''} ${user?.userLastName || ''} (Negocio)`.trim()
            };
        } else {
             // Reset if switching back to company or other
             if (formData.businessEntity === 'INDIVIDUAL') {
                 updatedData = {
                     ...updatedData,
                     businessDocumentNumber: '',
                     businessDocumentType: 0,
                     businessName: ''
                 };
             }
        }
        setFormData(updatedData);
        setValidations((prev) => ({ ...prev, businessEntity: true }));
    };


    const validateForm = () => {
        const newValidations = {
            businessEntity: formData.businessEntity !== 0 && formData.businessEntity !== '0',
            businessName: formData.businessName.trim() !== "",
            businessCountry: formData.businessCountry !== 0 && formData.businessCountry !== '0',
            businessDocumentType: formData.businessDocumentType !== 0 && formData.businessDocumentType !== '0',
            businessDocumentNumber: formData.businessDocumentNumber.trim() !== "",
            businessType: formData.businessType !== 0 && formData.businessType !== '0',
            businessEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail.trim()),
            businessPhoneNumber: /^\d{3,15}$/.test(formData.businessPhoneNumber.trim()), // flexible length for international
            businessCodePhoneNumber: formData.businessCodePhoneNumber.trim().startsWith("+"),
            businessCodeWhatsappNumber: formData.businessCodeWhatsappNumber.trim().startsWith("+")
        };
        setValidations(newValidations);
        return Object.values(newValidations).every(v => v === true);
    };

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        
        if (!validateForm()) {
            setError("Por favor completa todos los campos requeridos correctamente.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const businessCreated = await createBusiness(formData);

            if (businessCreated.status === 201 || businessCreated.status === 200) {
                setHasBusiness(true);
                await MySwal.fire({
                    title: <strong>¡Éxito!</strong>,
                    html: <p>Tu negocio ha sido registrado correctamente.</p>,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                console.log({businessSelected:businessCreated.data})
                console.log({businessSelected:businessCreated.data.businessId})
                setBusinessSelected({userBusinessBusinessId:businessCreated.data.businessId});
                
                navigate('/dashboard');
            } else if (businessCreated.status === 202) {
                 setHasBusiness(true);
                 toast.success(
                    'Tu negocio se ha registrado', 
                    'pero requiere revisión adicional.');
                navigate('/logout'); // Or dashboard depending on flow
            } else {
                setError(businessCreated.data?.message || "Ocurrió un error inesperado.");
            }
        } catch (error) {
            console.error('Error creating business:', error);
            setError("Error de conexión. Por favor intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for input classes (reusing logic or creating consistency)
    // Helper for input classes (reusing logic or creating consistency)
    const getSelectClass = (fieldName) => {
        // Updated to match InputFloatingComponent exactly: px-3 pb-2 pt-4
        // Removed h-[50px] and leading-tight to let browser handle height naturally
        const base = "block w-full px-3 pb-2 pt-4 text-sm text-slate-800 bg-white rounded-md border appearance-none focus:outline-none focus:ring-0 peer transition-colors";
        const valid = "border-emerald-500 focus:border-emerald-500";
        const invalid = "border-red-500 focus:border-red-500";
        const def = "border-slate-300 focus:border-emerald-600";
        
        if (validations[fieldName] === true) return `${base} ${valid}`;
        if (validations[fieldName] === false) return `${base} ${invalid}`;
        return `${base} ${def}`;
    };

    return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <NavBarComponent />

        <div className="flex-grow container mx-auto px-4 py-2 mt-[75px] max-w-4xl">

            {/* CARD PRINCIPAL */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
            >

                {/* NUEVO HEADER MINIMALISTA */}
                <div className="bg-white px-8 py-8 border-b border-gray-100 flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <FaStore className="text-3xl" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Registrar Negocio
                        </h1>
                    </div>

                    <p className="text-gray-500 text-center md:text-left text-sm md:text-base max-w-md">
                        Ingresa la información necesaria para crear tu espacio de trabajo en AppsFly.
                    </p>
                </div>

                {/* FORMULARIO */}
                <form 
                    onSubmit={handleOnSubmit} 
                    className="px-6 md:px-10 py-8 space-y-10"
                    noValidate
                >

                    {/* ERROR BOX */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* SECTION: GENERAL INFO */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FaBuilding className="text-emerald-500" />
                            Información General
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Tipo de entidad */}
                            <div className="relative">
                                <select
                                    name="businessEntity"
                                    id="businessEntity"
                                    className={getSelectClass("businessEntity")}
                                    onChange={handleChangeSelectBusinessEntity}
                                    value={formData.businessEntity}
                                >
                                    <option value={0} disabled>Selecciona el tipo de entidad</option>
                                    <option value="INDIVIDUAL">Persona Natural</option>
                                    <option value="COMPANY">Empresa / Jurídica</option>
                                </select>

                                <label className="floating-label">
                                    Registrar como <span className="text-red-500">*</span>
                                </label>

                                {validations.businessEntity === false && (
                                    <p className="text-xs text-red-500 mt-1">Requerido</p>
                                )}
                            </div>

                            {/* Nombre */}
                            <InputFloatingComponent
                                label="Nombre del Negocio"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                isValid={validations.businessName}
                                required
                            />

                            {/* Rubro */}
                            <div className="relative">
                                <select
                                    name="businessType"
                                    id="businessType"
                                    className={getSelectClass("businessType")}
                                    value={formData.businessType}
                                    onChange={handleChange}
                                >
                                    <option value={0} disabled>Selecciona el rubro</option>
                                    {Object.entries(businessTypesList).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>

                                <label className="floating-label">
                                    Tipo de Negocio <span className="text-red-500">*</span>
                                </label>

                                {validations.businessType === false && (
                                    <p className="text-xs text-red-500 mt-1">Requerido</p>
                                )}
                            </div>

                            {/* País */}
                            <div className="relative">
                                <select
                                    name="businessCountry"
                                    id="businessCountry"
                                    className={getSelectClass("businessCountry")}
                                    value={formData.businessCountry}
                                    onChange={handleChange}
                                >
                                    <option value={0} disabled>Selecciona país</option>
                                    <option value="chile">Chile</option>
                                </select>

                                <label className="floating-label">
                                    País <span className="text-red-500">*</span>
                                </label>

                                {validations.businessCountry === false && (
                                    <p className="text-xs text-red-500 mt-1">Requerido</p>
                                )}
                            </div>

                        </div>
                    </section>

                    {/* SECTION: IDENTIFICATION */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FaIdCard className="text-emerald-500" />
                            Identificación del Negocio
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <select
                                    name="businessDocumentType"
                                    id="businessDocumentType"
                                    className={getSelectClass("businessDocumentType")}
                                    value={formData.businessDocumentType}
                                    onChange={handleChange}
                                >
                                    <option value={0} disabled>Tipo</option>
                                    <option value="rut">RUT</option>
                                    <option value="passport">Pasaporte</option>
                                    <option value="other">Otro</option>
                                </select>

                                <label className="floating-label">
                                    Documento <span className="text-red-500">*</span>
                                </label>

                                {validations.businessDocumentType === false && (
                                    <p className="text-xs text-red-500 mt-1">Requerido</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="Número de documento"
                                    name="businessDocumentNumber"
                                    value={formData.businessDocumentNumber}
                                    onChange={handleChange}
                                    isValid={validations.businessDocumentNumber}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION: CONTACTO */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FaEnvelope className="text-emerald-500" />
                            Contacto
                        </h3>

                        {/* Email */}
                        <InputFloatingComponent
                            label="Correo Electrónico Principal"
                            name="businessEmail"
                            type="email"
                            value={formData.businessEmail}
                            onChange={handleChange}
                            isValid={validations.businessEmail}
                            required
                        />

                        {/* Teléfono + código */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <select
                                    className={getSelectClass("businessCodePhoneNumber")}
                                    name="businessCodePhoneNumber"
                                    value={formData.businessCodePhoneNumber}
                                    onChange={handleChange}
                                >
                                    {countryCodes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.id})
                                        </option>
                                    ))}
                                </select>

                                <label className="floating-label">Código</label>
                            </div>

                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="Teléfono Móvil"
                                    name="businessPhoneNumber"
                                    value={formData.businessPhoneNumber}
                                    onChange={handleChange}
                                    isValid={validations.businessPhoneNumber}
                                    required
                                />
                            </div>
                        </div>

                        {/* Whatsapp */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <select
                                    className="block w-full px-3 pb-2 pt-4 text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:border-emerald-600"
                                    name="businessCodeWhatsappNumber"
                                    value={formData.businessCodeWhatsappNumber}
                                    onChange={handleChange}
                                >
                                    {countryCodes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.id})
                                        </option>
                                    ))}
                                </select>

                                <label className="floating-label">Código</label>
                            </div>

                            <div className="md:col-span-2">
                                <InputFloatingComponent
                                    label="WhatsApp (Opcional)"
                                    name="businessWhatsappNumber"
                                    value={formData.businessWhatsappNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* BOTONES */}
                    <div className="pt-6 border-t border-gray-200 flex flex-col-reverse md:flex-row justify-end gap-4">

                        <Link
                            to={isSubmitting ? "#" : "/dashboard"}
                            className={`w-full md:w-auto px-6 py-3 text-sm rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition ${
                                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full md:w-auto px-8 py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 shadow-lg transition ${
                                isSubmitting
                                    ? "bg-emerald-400 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Registrar Negocio <FaCheck />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <p className="text-center text-gray-400 text-sm mt-8 pb-4">
                &copy; {new Date().getFullYear()} AppsFly. Todos los derechos reservados.
            </p>
        </div>
    </div>
);

}
