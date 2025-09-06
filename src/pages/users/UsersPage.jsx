import NavBarComponent from '../../components/NavBarComponent.jsx'
import { Link } from 'react-router-dom';
import { getUsersBusinessDB } from "../../api/user.js"
import { getUserGuestsRequest } from "../../api/userGuest.js"

import { useEffect, useState } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [userGuest, setUserGuest] = useState([]);
    useEffect(() => {
        const searchData = async () => {
            try {
                const userGuestFound = await getUserGuestsRequest();
                setUserGuest(userGuestFound.data);
                const usersFound = await getUsersBusinessDB();
                setUsers(usersFound.data);
            } catch (error) {
                console.error(error);
            }
        }
        searchData();
    }, []);
    return (
        <>
            <NavBarComponent />
            <div className="container" style={{ marginTop: '80px' }}>
                <h1>Usuarios</h1>
                <div className="row mb-3">
                    <table className='table'>
                        <thead >
                            <tr>
                                <th>Nombre y Apellido</th>
                                <th>Correo Electrónico</th>
                                <th>Rol</th>
                                <th>Status</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user?.userId}>
                                    <td>{user?.userFirstName} {user?.userLastName}</td>
                                    <td>{user?.userEmail}</td>
                                    <td>
                                        {user?.userRole == "ADMIN" && 'Administrador'}
                                        {user?.userRole == "USER" && 'Usuario'}
                                    </td>
                                    <td>
                                        <span className={`badge bg-success`}> Activo</span>

                                    </td>

                                    <td>
                                        <Link to={`/users/${user?.userId}`} className="btn btn-sm btn-primary py-0">Ver</Link>
                                    </td>
                                </tr>
                            ))}
                            {
                                userGuest.map(userG => (
                                    <tr key={userG?.userGuestId}>
                                        <td></td>
                                        <td>{userG?.userGuestEmail}</td>
                                        <td>
                                            {userG?.userGuestRole == "ADMIN" && 'Administrador'}
                                            {userG?.userGuestRole == "USER" && 'Usuario'}
                                        </td>
                                        <td>
                                            <span className={`badge bg-warning`}>
                                                Pendiente
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/users/userGuest/${userG?.userGuestId}`} className="btn btn-sm btn-primary py-0">Ver</Link>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className="d-grid gap-2 d-md-block">
                    <Link to="/users/userGuest" className="btn btn-success" style={{ minWidth: '200px' }}>Invitar Usuario</Link>
                </div>
            </div>
        </>
    );
}
