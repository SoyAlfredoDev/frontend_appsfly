import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link, useNavigate } from "react-router-dom";
import logoappsfly from "../../public/logo_appsfly.png";
import InputFloatingComponent from '../components/inputs/InputFloatingComponent';
import SelectFloatingComponent from '../components/inputs/SelectFloatingComponent';
import validateRut from '../libs/validateRut.js';
import { useAuth } from '../context/authContext.jsx';
import { useToast } from "../context/ToastContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import { sendEmailRequest } from '../api/email.js';
import { RegisterEmail } from '../email-models/RegisterEmail';
import { motion } from 'framer-motion';

const validateForm = (data) => ({
    userFirstName: data.userFirstName.trim() !== "",
    userLastName: data.userLastName.trim() !== "",
    userEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail.trim()),
    userPassword: data.userPassword.length >= 6,
    userPasswordConfirmation: data.userPasswordConfirmation === data.userPassword && data.userPasswordConfirmation.length > 0,
    userDocumentType: !!data.userDocumentType?.trim(),
    userDocumentNumber: data.userDocumentNumber.trim().length > 0,
    userCodePhoneNumber: data.userCodePhoneNumber.trim().startsWith("+"),
    userPhoneNumber: /^\d{7,15}$/.test(data.userPhoneNumber.trim())
});

export default function RegisterPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: uuidv4(),
        userFirstName: '',
        userLastName: '',
        userEmail: '',
        userPassword: '',
        userPasswordConfirmation: '',
        userDocumentType: "rut",
        userDocumentNumber: "",
        userCodePhoneNumber: "+56",
        userPhoneNumber: "",
    });
    const [validations, setValidations] = useState({});
    const [error, setError] = useState(null);
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

    const baseURL = import.meta.env.VITE_FRONTEND_URL;
    // Manejar cambios de inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Validar campo al perder foco
    const handleOnBlur = () => {
        //console.log('ignorar')
    };

    const validatePassword = (pwd) => {
        const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(pwd);
    };

    // Validar y enviar
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const newValidation = validateForm(formData);
        setValidations(newValidation);

        const rutFormated = validateRut(formData.userDocumentNumber);
        const passwordValidated = validatePassword(formData.userPassword);
        if (rutFormated === false && formData.userDocumentType === "rut") {
            setValidations((prev) => ({ ...prev, userDocumentNumber: false }));
            setError("Por favor, ingrese un rut válido ej:(12345678-K)");
            setIsLoading(false);
            return;
        };

        if (!passwordValidated) {
            setValidations((prev) => ({ ...prev, userPassword: false, userPasswordConfirmation: false }));
            setError("La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula y al menos un número.");
            setIsLoading(false);
            return;
        };
        if (Object.values(newValidation).some(v => v === false)) {
            console.log(newValidation)
            setError("Por favor, corrige los campos inválidos.");
            setIsLoading(false);
            return;
        }
        setError(null);
        try {
            const res = await signup(formData);
            if (res.error === 1) {
                setValidations((prev) => ({ ...prev, userEmail: false }));
                setError("El correo electrónico ya está en uso.");
                setIsLoading(false);
                return;
            } else if (res?.error === 2) {
                setValidations((prev) => ({ ...prev, userPassword: false, userPasswordConfirmation: false }));
                setError("Las contraseñas no coinciden.");
                setIsLoading(false);
                return;
            }
            if (res.userId) {
                toast.success(
                    'Su registro se completó exitosamente',
                    'Ahora debe iniciar sesión'
                );
                const emailData = {
                    to: formData.userEmail,
                    subject: 'Confirmación de registro',
                    html: renderToStaticMarkup(<RegisterEmail firstName={formData.userFirstName} lastName={formData.userLastName} confirmationLink={`${baseURL}/users/${res.userId}/confirm-email`} />),
                };
                sendEmailRequest(emailData);
                navigate('/logout');
            } else {
                toast.error(
                    'Hubo un error al registrarse.',
                    'Por favor, intente de nuevo.'
                );
                setIsLoading(false);
                setError(res?.data?.message || "Hubo un error al registrarse.");
            }
        } catch (err) {
            console.log(err);
            setError("Hubo un error al registrarse.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-3 w-full flex items-center justify-center bg-gray-50 py-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-3 md:p-8 rounded-lg shadow-md w-full max-w-2xl border border-slate-200"
            >
                <div className="text-center mb-2">
                    <Link to="/">
                        <img
                            src={logoappsfly}
                            className="h-8 mx-auto mb-3 object-contain"
                            alt="logo appsfly"
                        />
                    </Link>
                    <h4 className="text-xl font-bold text-slate-800">Crear Cuenta Nueva</h4>
                    <p className="text-slate-500 text-sm">Gestiona tu negocio de forma simple.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md mb-4 text-xs font-medium border border-red-100 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleOnSubmit} className="space-y-1" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputFloatingComponent
                            label="Nombre"
                            name="userFirstName"
                            value={formData.userFirstName}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="given-name"
                            isValid={validations.userFirstName}
                        />
                        <InputFloatingComponent
                            label="Apellido"
                            name="userLastName"
                            value={formData.userLastName}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="family-name"
                            isValid={validations.userLastName}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <SelectFloatingComponent
                                label="Tipo Documento"
                                name="userDocumentType"
                                value={formData.userDocumentType}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userDocumentType}
                                options={[
                                    { value: 'rut', label: 'RUT' },
                                    { value: 'passport', label: 'Pasaporte' },
                                    { value: 'other', label: 'Otro' }
                                ]}
                            />
                        </div>
                        <div className="md:col-span-2">
                             <InputFloatingComponent
                                label="Número de documento"
                                name="userDocumentNumber"
                                value={formData.userDocumentNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userDocumentNumber}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <SelectFloatingComponent
                                label="Código"
                                name="userCodePhoneNumber"
                                value={formData.userCodePhoneNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userCodePhoneNumber}
                                options={countryCodes.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))}
                            />
                        </div>
                        <div className="md:col-span-2">
                             <InputFloatingComponent
                                label="Número de Teléfono"
                                type="number"
                                name="userPhoneNumber"
                                value={formData.userPhoneNumber}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                isValid={validations.userPhoneNumber}
                            />
                        </div>
                    </div>

                    <InputFloatingComponent
                        label="Correo electrónico"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleInputChange}
                        onBlur={handleOnBlur}
                        autoComplete="email"
                        isValid={validations.userEmail}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputFloatingComponent
                            label="Contraseña"
                            type="password"
                            name="userPassword"
                            value={formData.userPassword}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="new-password"
                            isValid={validations.userPassword}
                        />
                         <InputFloatingComponent
                            label="Confirmar contraseña"
                            type="password"
                            name="userPasswordConfirmation"
                            value={formData.userPasswordConfirmation}
                            onChange={handleInputChange}
                            onBlur={handleOnBlur}
                            autoComplete="new-password"
                            isValid={validations.userPasswordConfirmation}
                        />
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-2 mb-4">
                        Al hacer clic en <strong className="text-slate-700">Regístrarme</strong>, acepto los&nbsp;
                        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                            términos y condiciones
                        </a> y las&nbsp;
                        <a href="/politicas" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                            políticas de privacidad
                        </a> de Appsfly.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Registrando...' : 'Regístrarme'}
                        </button>
                        <Link 
                            to="/" 
                            disabled={isLoading}
                            className="bg-white text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-md hover:bg-slate-50 transition-colors text-center text-sm flex items-center justify-center"
                        >
                            Volver
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
