import NavBarComponent from "../../components/NavBarComponent";
import InputFloatingComponent from '../../components/inputs/InputFloatingComponent';
import { useState } from "react";
import { createUserGuest } from '../../api/userGuest.js';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "../../context/authContext.jsx";
import { useNavigate } from "react-router-dom";

export default function UserGuestPage() {
    const { businessSelected } = useAuth();
    const navigate = useNavigate();
    const [dataFromForm, setDataFromForm] = useState({
        userGuestId: uuidv4(),
        userGuestEmail: '',
        userGuestBusinessId: businessSelected.userBusinessBusinessId,
        userGuestRole: 'ADMIN',
        userGuestStatus: 'PENDIENT'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataFromForm((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const createNewUserGuest = async () => {
        try {
            const response = await createUserGuest(dataFromForm);
            console.log('Usuario invitado creado:', response);
            if (response.status === 201) {
                alert('Usuario invitado creado con éxito');
                navigate('/users');
            } else if (response.status === 500) {
                alert('Error al invitar a un usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario invitado:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createNewUserGuest();
    };

    return (
        <>
            <NavBarComponent />
            <div className="container" style={{ marginTop: '80px' }}>
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="card-header">
                        <h5 className="card-title">Invitar Usuario</h5>
                    </div>
                    <div className="card-body">
                        <InputFloatingComponent
                            label="Correo Electrónico invitado"
                            type="email"
                            name='userGuestEmail'
                            value={dataFromForm.userGuestEmail}
                            onChange={handleChange}
                        />
                        <select
                            name='userGuestRole'
                            value={dataFromForm.userGuestRole}
                            onChange={handleChange}
                            className="form-select mb-3"
                            required
                        >
                            <option value="ADMIN">Administrador</option>
                            <option value="USER">Usuario</option>
                        </select>
                    </div>
                    <div className="card-footer">
                        <button className="btn btn-success" type="submit" onClick={handleSubmit}>Enviar Invitación</button>
                    </div>
                </div>
            </div>
        </>
    );
}
