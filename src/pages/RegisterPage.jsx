import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logoappsfly from "../../public/logoappsfly.png";
import InputFloatingComponent from '../components/inputs/InputFloatingComponent';
import validateRut from '../libs/validateRut.js';
import { useAuth } from '../context/authContext.jsx';
import { v4 as uuidv4 } from 'uuid';

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
                alert('Su registro se completó exitosamente; debe iniciar sesión nuevamente.')
                navigate('/logout');
            } else {
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
        <>
            <img
                src={logoappsfly}
                className="img-fluid mx-auto d-block"
                alt="logo appsfly"
                style={{ maxWidth: "350px" }}
            />

            <hr className="border border-1 text-primary opacity-75 mt-2 mb-3" />

            <div className="container">
                <h4 className="text-center text-secondary mb-1">Regístrate como nuevo usuario</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleOnSubmit} className="needs-validation" noValidate>
                    <div className="row p-0">
                        <div className="col-12 col-md-6">
                            <InputFloatingComponent
                                label="Nombre"
                                name="userFirstName"
                                value={formData.userFirstName}
                                onChange={handleInputChange}
                                onBlur={handleOnBlur}
                                autoComplete="given-name"
                                isValid={validations.userFirstName}
                            />
                        </div>
                        <div className="col-12 col-md-6">
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
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <select
                                    className={`form-select ${validations.userDocumentType === true
                                        ? 'is-valid'
                                        : validations.userDocumentType === false
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                    id="userDocumentType"
                                    name="userDocumentType"
                                    value={formData.userDocumentType}
                                    onChange={handleInputChange}
                                    onBlur={handleOnBlur}
                                >
                                    <option value="rut">RUT</option>
                                    <option value="passport">Pasaporte</option>
                                    <option value="other">Otro</option>
                                </select>
                                <label htmlFor="userDocumentType">Tipo de documento</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-8">
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

                    <div className="row">
                        <div className="col-4">
                            <div className="form-floating mb-2">
                                <select
                                    className={`form-select ${validations.userCodePhoneNumber === true
                                        ? 'is-valid'
                                        : validations.userCodePhoneNumber === false
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                    id="userCodePhoneNumber"
                                    name="userCodePhoneNumber"
                                    value={formData.userCodePhoneNumber}
                                    onChange={handleInputChange}
                                    onBlur={handleOnBlur}
                                >
                                    {countryCodes.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.name} ({country.id})
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="userCodePhoneNumber">Código de área</label>
                            </div>
                        </div>
                        <div className="col-8">
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

                    <InputFloatingComponent
                        label="Password"
                        type="password"
                        name="userPassword"
                        value={formData.userPassword}
                        onChange={handleInputChange}
                        onBlur={handleOnBlur}
                        autoComplete="new-password"
                        isValid={validations.userPassword}
                    />

                    <InputFloatingComponent
                        label="Confirmar password"
                        type="password"
                        name="userPasswordConfirmation"
                        value={formData.userPasswordConfirmation}
                        onChange={handleInputChange}
                        onBlur={handleOnBlur}
                        autoComplete="new-password"
                        isValid={validations.userPasswordConfirmation}
                    />

                    <div className="text-center small text-muted mt-3">
                        Al hacer clic en <strong>Regístrame</strong>, acepto los&nbsp;
                        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                            términos y condiciones
                        </a> y las&nbsp;
                        <a href="/politicas" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                            políticas de privacidad
                        </a> de Appsfly.
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-md-6 mb-2">
                            <button type="submit" className="btn btn-success w-100 " disabled={isLoading}>
                                Regístrarme
                            </button>
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <Link to="/" className="btn btn-secondary w-100" disabled={isLoading}>
                                Volver
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
