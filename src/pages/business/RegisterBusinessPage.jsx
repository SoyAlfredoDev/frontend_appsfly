import InputFloatingComponent from "../../components/inputs/InputFloatingComponent";
import NavBarComponent from "../../components/NavBarComponent";
import { v4 as uuidv4 } from 'uuid';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext.jsx';
import { createBusiness } from '../../api/business.js'
//import { createUserBusinessRequest } from '../../api/userBusiness.js'



export default function RegisterBusinessPage() {
    const { setHasBusiness } = useAuth();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState();
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

    /*
    const userBusiness = {
        userBusinessUserId: user?.userId,
        userBusinessBusinessId: formData.businessId,
        userBusinessRole: 'ADMIN'
    }*/
    const [validations, setValidations] = useState({});
    const validateForm = () => {
        const newValidations = {
            businessCountry: formData.businessCountry !== 0,
            businessName: formData.businessName.trim() !== "",
            businessEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail.trim()),
            businessType: formData.businessType !== 0,
            businessDocumentNumber: formData.businessDocumentNumber.trim() !== "",
            businessDocumentType: formData.businessDocumentType !== 0,
            businessEntity: formData.businessEntity !== 0,
            businessPhoneNumber: /^\d{9}$/.test(formData.businessPhoneNumber.trim()),
            businessCodePhoneNumber: formData.businessCodePhoneNumber.trim().startsWith("+"),
            businessCodeWhatsappNumber: formData.businessCodeWhatsappNumber.trim().startsWith("+")
        };
        setValidations(newValidations);
        return newValidations;
    };
    const businessTypesList = {
        minimarket: 'Minimarket',
        cafe: 'Cafetería / restaurante pequeño',
        optics: 'Óptica',
        veterinary: 'Veterinaria',
        hair_salon: 'Peluquería / barbería',
        clothing_store: 'Tienda de ropa / boutique'
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidations((prev) => ({ ...prev, [name]: true }));
    };
    const handleChangeSelectDocumentType = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidations((prev) => ({ ...prev, [name]: true }));
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
    const handleChangeSelectBusinessEntity = (e) => {
        const { value } = e.target;
        if (value === 'INDIVIDUAL') {
            setFormData((prev) => ({
                ...prev,
                businessEntity: value,
                businessDocumentNumber: user?.userDocumentNumber,
                businessDocumentType: user?.userDocumentType,
                businessName: `${user?.userFirstName} ${user?.userLastName} (Negocio)`
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                businessEntity: value,
                businessDocumentNumber: '',
                businessDocumentType: 0,
                businessName: ''
            }));
        }
        setValidations((prev) => ({ ...prev, businessEntity: true }));
    };
    const handleOnSubmit = (event) => {
        event.preventDefault();
        setError(null);
        const newValidation = validateForm(formData);
        if (Object.values(newValidation).some(v => v === false)) {
            setError("Por favor, corrige los campos inválidos.");
            return;
        }
        createNewBusiness();
    };
    const handleChangeSelectBusinessCountry = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidations((prev) => ({ ...prev, [name]: true }));
    };
    const createNewBusiness = async () => {
        try {
            const businessCreated = await createBusiness(formData);
            //const userBusinesscreated = await createUserBusinessRequest(userBusiness)
            if (businessCreated.status == 201) {
                setHasBusiness(true);
                navigate('/dashboard');
            }

        } catch (error) {
            console.error('Error creating business:', error);
        }
    }

    return (
        <>
            <NavBarComponent />
            <div className="container" style={{ marginTop: '75px' }}>
                <form onSubmit={handleOnSubmit} className="needs-validation mt-5" noValidate>
                    <h4 className="text-center text-secondary mb-1">Registrar Nuevo Negocio</h4>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {/* Business Selection Entity*/}
                    <div className="form-floating">
                        <select
                            name="businessEntity"
                            id="businessEntity"
                            className={`form-select form-select-sm mb-2  ${validations.businessEntity === true
                                ? 'is-valid'
                                : validations.businessEntity === false
                                    ? 'is-invalid'
                                    : ''
                                } `}
                            onChange={handleChangeSelectBusinessEntity}
                            value={formData.businessEntity}
                        >
                            <option value={0} disabled>Seleccione un tipo</option>
                            <option value="INDIVIDUAL">Persona</option>
                            <option value="COMPANY">Empresa</option>
                        </select>
                        <label htmlFor="businessEntity">Registrar como: <span className="text-danger">*</span> </label>
                    </div>

                    {/* Business Name */}
                    <div className="form-floating">
                        <InputFloatingComponent
                            label={'Nombre Negocio'}
                            name={'businessName'}
                            onChange={handleChange}
                            value={formData.businessName}
                            isValid={validations.businessName}
                        />
                    </div>

                    {/** businessCountry */}
                    <div className="form-floating">
                        <select
                            name="businessCountry"
                            id="businessCountry"
                            className={`form-select form-select-sm mb-2  ${validations.businessCountry === true
                                ? 'is-valid'
                                : validations.businessCountry === false
                                    ? 'is-invalid'
                                    : ''
                                } `}
                            onChange={handleChangeSelectBusinessCountry}
                            value={formData.businessCountry}
                        >
                            <option value={0} disabled>Seleccione un país</option>
                            <option value="chile">Chile</option>


                        </select>
                        <label htmlFor="businessCountry">País: <span className="text-danger">*</span> </label>
                    </div>

                    {/* Business Selection Document */}
                    <div className="row">
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <select
                                    className={`form-select ${validations.businessDocumentType === true
                                        ? 'is-valid'
                                        : validations.businessDocumentType === false
                                            ? 'is-invalid'
                                            : ''
                                        } `}
                                    id="businessDocumentType"
                                    name="businessDocumentType"
                                    value={formData.businessDocumentType}
                                    onChange={handleChangeSelectDocumentType}
                                >
                                    <option value={0} disabled>Seleccione un documento</option>
                                    <option value="rut">RUT</option>
                                    <option value="passport">Pasaporte</option>
                                    <option value="other">Otro</option>
                                </select>
                                <label htmlFor="businessDocumentType">Documento Negocio:  <span className="text-danger">*</span></label>
                            </div>
                        </div>
                        <div className="col-12 col-md-8">
                            <InputFloatingComponent
                                label="Número de documento"
                                name="businessDocumentNumber"
                                value={formData.businessDocumentNumber}
                                onChange={handleChange}
                                isValid={validations.businessDocumentNumber}
                            />
                        </div>
                    </div>

                    {/* Business Selection Type */}
                    <div className="form-floating">
                        <select name="businessType" id="businessType" className={`form-select form-select-sm mb-2 ${validations.businessType === true
                            ? 'is-valid'
                            : validations.businessType === false
                                ? 'is-invalid'
                                : ''
                            }`} value={formData.businessType} onChange={handleChange} required>
                            <option value={0} disabled>Seleccione un tipo de negocio</option>
                            {
                                businessTypesList && Object.entries(businessTypesList).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))
                            }
                        </select>
                        <label htmlFor="businessType">Tipo de Negocio: <span className="text-danger">*</span></label>
                    </div>

                    {/* Email */}
                    <div className="form-floating">
                        <InputFloatingComponent
                            label={'Correo Principal'}
                            name={'businessEmail'}
                            onChange={handleChange}
                            value={formData.businessEmail}
                            type="email"
                            isValid={validations.businessEmail}
                        />

                    </div>

                    {/* Phone number with country code */}
                    <div className="row">
                        <div className="col-4">
                            <div className="form-floating mb-2">
                                <select
                                    className={`form-select ${validations.businessCodePhoneNumber === true
                                        ? 'is-valid'
                                        : validations.businessCodePhoneNumber === false
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                    id="businessCodePhoneNumber"
                                    name="businessCodePhoneNumber"
                                    value={formData.businessCodePhoneNumber}
                                    onChange={handleChange}
                                >
                                    {countryCodes.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.name} ({country.id})
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="businessCodePhoneNumber">Código de área</label>
                            </div>
                        </div>
                        <div className="col-8">
                            <InputFloatingComponent
                                label={'Teléfono'}
                                name={'businessPhoneNumber'}
                                onChange={handleChange}
                                value={formData.businessPhoneNumber}
                                type="tel"
                                isValid={validations.businessPhoneNumber}
                            />
                        </div>
                    </div>

                    {/* Whatsapp number with country code */}
                    <div className="row">
                        <div className="col-4">
                            <div className="form-floating mb-2">
                                <select
                                    className={`form-select ${validations.businessCodeWhatsappNumber === true
                                        ? 'is-valid'
                                        : validations.businessCodeWhatsappNumber === false
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                    id="businessCodeWhatsappNumber"
                                    name="businessCodeWhatsappNumber"
                                    value={formData.businessCodeWhatsappNumber}
                                    onChange={handleChange}
                                >
                                    {countryCodes.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.name} ({country.id})
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="businessCodePhoneNumber">Código de área</label>
                            </div>

                        </div>
                        <div className="col-8">
                            <InputFloatingComponent
                                label={'Whatsapp'}
                                name={'businessWhatsappNumber'}
                                onChange={handleChange}
                                value={formData.businessWhatsappNumber}
                                type="tel"
                                required={false}

                            />
                        </div>

                    </div>
                    <hr className="border border-1 text-primary opacity-75 mt-2 mb-3" />

                    <div className="d-grid gap-2 d-md-block text-center">
                        <Link to="/dashboard" className="btn btn-secondary mx-1" style={{ minWidth: '200px' }}>Volver</Link>
                        <button type="submit" className="btn btn-success mx-1" style={{ minWidth: '200px' }}>Registrar negocio</button>
                    </div>
                </form >
            </div >
        </>
    );
}