import { useAuth } from "../../context/authContext.jsx";
import { responseUserGuestRequest } from "../../api/userGuest.js";
import { createUserBusinessRequest } from "../../api/userBusiness.js";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function PendingUserGuest() {
    const { userGuestExists, user } = useAuth();
    const navigate = useNavigate();
    const data = {
        userBusinessId: uuidv4(),
    };
    // Function to handle user response (accept/reject invitation)
    const handleResponseClick = async (
        userGuestId,
        response,
        userGuestBusinessId,
        userGuestRole,
        userBusinessRole
    ) => {
        try {
            data.userGuestId = userGuestId;
            data.response = response;

            // --- If rejected ---
            if (response === "REJECTED") {
                try {
                    const res = await responseUserGuestRequest(data);
                    if (res.status === 200) {

                        showAlert(
                            "Invitación rechazada",
                            "Has rechazado la invitación correctamente",
                            "success"
                        );
                        // Refresh the list of pending invitations after a short delay in 3 seconds
                        setTimeout(() => {
                            window.location.reload();

                        }, 3000);
                    } else {
                        showAlert("Error", "No se pudo actualizar la invitación", "error");
                    }
                    return;
                } catch (error) {
                    console.error(error);
                    showAlert("Error", "No se pudo actualizar la invitación", "error");
                    return;
                }
            }

            // --- If accepted ---
            try {
                data.userBusinessBusinessId = userGuestBusinessId;
                data.userGuestRole = userGuestRole;
                data.userBusinessRole = userGuestRole;
                const res = await responseUserGuestRequest(data);
                if (res.status === 200) {
                    console.log("Data to create user-business relation:", data);

                    const createRes = await createUserBusinessRequest(data);
                    if (createRes.status === 201) {
                        showAlert(
                            "Invitacion aceptada",
                            "La invitación ha sido actualizada, debe ingresar nuevamente al sistema",
                            "success"
                        );
                        setTimeout(() => {
                            navigate("/logout");
                        }, 5000);
                    } else {
                        showAlert(
                            "Error",
                            "No se pudo crear la relación con el negocio",
                            "error"
                        );
                    }
                } else {
                    showAlert("Error", "No se pudo actualizar la invitación", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                showAlert("Error", "No se pudo crear la relación con el negocio", "error");
            }
        } catch (error) {
            console.error(error);
        }
    };
    // SweetAlert helper
    const showAlert = (title, text, icon) => {
        MySwal.fire({
            title: <p>{title}</p>,
            text,
            icon,
            confirmButtonText: "OK",
        });
    };
    return (
        <div style={{ paddingTop: "90px" }}>
            {userGuestExists &&
                userGuestExists.map((guest, index) => (
                    <div
                        className="card shadow mb-3 rounded-3 border-0"
                        key={index}
                        style={{ maxWidth: "600px" }}
                    >
                        <div className="card-body">
                            <h5 className="card-title text-primary fw-bold">
                                Invitación pendiente
                            </h5>
                            <p className="card-text">
                                Hola <strong>{user?.userFirstName}</strong>, has recibido una
                                invitación para unirte al negocio{" "}
                                <strong>{guest.Business?.businessName}</strong> con el rol de{" "}
                                <span className="text-capitalize fw-semibold">
                                    {guest.userGuestRole === "ADMIN" && "Administrador"}
                                    {guest.userGuestRole === "USER" && "Usuario"}
                                </span>.
                            </p>
                            <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                                Invitado por:{" "}
                                <strong>
                                    {guest.User?.userFirstName} {guest.User?.userLastName}
                                </strong>
                            </p>
                        </div>
                        <div className="card-footer bg-white border-0 d-flex justify-content-end">
                            <button
                                className="btn btn-sm btn-outline-danger me-2 px-3"
                                onClick={() =>
                                    handleResponseClick(guest.userGuestId, "REJECTED", null, null)
                                }
                            >
                                Rechazar
                            </button>
                            <button
                                className="btn btn-sm btn-success px-3"
                                onClick={() =>
                                    handleResponseClick(
                                        guest.userGuestId,
                                        "ACCEPTED",
                                        guest.userGuestBusinessId,
                                        guest.userGuestRole
                                    )
                                }
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
