import { useAuth } from "../context/authContext";
import NavBarComponent from "../components/NavBarComponent";

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="customer-container">
            <div className="container-fluid">
                <NavBarComponent />
                <div className="row align-items-center mb-2">
                    <div className="col-md-8">
                        <h1 className="mb-4 fw-bold text-dark">Tu Perfil</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <p className="text-muted">Información del usuario:</p>
                        <ul>
                            <li>Nombre: {user?.userFirstName} {user?.userLastName}</li>
                            <li>{user?.userDocumentType}: {user?.userDocumentNumber}</li>
                            <li>Telefono: {user?.userCodePhoneNumber} {user?.userPhoneNumber}</li>
                            <li>Email: {user?.userEmail}</li>
                            <li>Rol: {user?.roleId}</li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}   