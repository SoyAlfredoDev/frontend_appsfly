import { useAuth } from "../../context/authContext.jsx";
import { useEffect, useState } from "react";
import { createUserBusinessRequest } from '../../api/userBusiness.js';
import { userGuestUpdateAcceptRequest } from '../../api/userGuest.js';
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function UserGuestPendient() {
    const { userGuestExists, user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        console.log(userGuestExists);
    }, [userGuestExists]);

    const [dataFrom, setDataFrom] = useState({
        userBusinessUserId: user.userId,
        userBusinessBusinessId: '',
        userBusinessRole: '',
        userGuestId: ''
    });
    const handleSubmit = (businessId, userGuestRole, userGuestId) => {
        const newData = { ...dataFrom, userBusinessBusinessId: businessId, userBusinessRole: userGuestRole, userGuestId: userGuestId };
        setDataFrom(newData);
        createUserBusiness(newData);

    };
    const createUserBusiness = async (data) => {
        try {
            const response = await createUserBusinessRequest(data);
            if (response.status === 201) {
                showAlert("invitación aceptada correctamente", "debes ingresar nuevamente al sistema", "success");
                const update = await userGuestUpdateAcceptRequest(data.userGuestId);
                if (update.status === 200) {
                    navigate('/logout');

                } else {
                    showAlert("Error", "Error al actualizar el estado de la invitación", "error");
                }
            } else if (response.status === 500) {
                alert("Error al aceptar la invitación")
            }
        } catch (error) {
            console.error(error);
        }
    };

    const showAlert = (message, text, icon) => {
        MySwal.fire({
            title: <p>{message}</p>,
            text: text,
            icon: icon,
            confirmButtonText: "OK"
        })
    }

    return (
        <>
            {
                userGuestExists && (
                    userGuestExists.map((guest, index) => (
                        <>
                            <hr />
                            <div className="card shadow-sm mb-3 rounded-3 border-0" key={index} style={{ maxWidth: "600px" }}>
                                <div className="card-body">
                                    <h5 className="card-title text-primary fw-bold">
                                        Invitación pendiente
                                    </h5>
                                    <p className="card-text">
                                        Hola <strong>{user?.userFirstName}</strong>, has recibido una invitación
                                        para unirte al negocio <strong>{guest.Business?.businessName}</strong>{" "}
                                        con el rol de{" "}
                                        <span className="text-capitalize fw-semibold">
                                            {guest.userGuestRole === "ADMIN" && "Administrador"}
                                            {guest.userGuestRole === "USER" && "Usuario"}
                                        </span>.
                                    </p>
                                    <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                                        Invitado por: <strong>{guest.User?.userFirstName} {guest.User?.userLastName}</strong>
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-0 d-flex justify-content-end">
                                    <button className="btn btn-outline-danger me-2 px-4">
                                        Rechazar
                                    </button>
                                    <button className="btn btn-success px-4" onClick={() => handleSubmit(guest.Business?.businessId, guest.userGuestRole, guest.userGuestId)}>
                                        Aceptar
                                    </button>
                                </div>
                            </div>

                        </>
                    )
                    )
                )
            }


        </>
    );
}
