import NavBarComponent from '../../components/NavBarComponent.jsx';
import ProtectedView from "../../components/ProtectedView";
import { Link } from 'react-router-dom';
import { getUsersBusinessDB } from "../../api/user.js"
import { getUserGuestsRequest } from "../../api/userGuest.js"
import { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaUserTag, FaTrash, FaRedo, FaEye, FaUserPlus, FaUserShield, FaUserTie } from 'react-icons/fa';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [userGuest, setUserGuest] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const searchData = async () => {
            try {
                setLoading(true);
                const userGuestFound = await getUserGuestsRequest();
                setUserGuest(userGuestFound.data);
                const usersFound = await getUsersBusinessDB();
                setUsers(usersFound.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        searchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 mt-[35px]">
                 <Motion.div 
                    className="max-w-7xl mx-auto space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaUser className="text-emerald-600" />
                                Usuarios
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Gestión de usuarios y permisos del sistema</p>
                        </div>
                        <Link 
                            to="/users/userGuest" 
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
                        >
                            <FaUserPlus /> Invitar Usuario
                        </Link>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Nombre y Apellido</th>
                                        <th className="px-6 py-4">Correo Electrónico</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                                                    <p className="text-sm">Cargando usuarios...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {/* Active Users */}
                                            {users.map(user => (
                                                <Motion.tr 
                                                    key={user?.userId}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-gray-800 font-medium text-sm">
                                                        {user?.userFirstName} {user?.userLastName}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                                        {user?.userEmail}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {user?.userRole === "ADMIN" ? <FaUserShield className="text-blue-500"/> : <FaUserTie className="text-gray-400"/>}
                                                            {user?.userRole === "ADMIN" ? 'Administrador' : 'Usuario'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                            Activo
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Link 
                                                            to={`/users/${user?.userId}`} 
                                                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Ver Detalles"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                    </td>
                                                </Motion.tr>
                                            ))}

                                            {/* Guest/Pending Users */}
                                            {userGuest.map(userG => (
                                                <Motion.tr 
                                                    key={userG?.userGuestId}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 transition-colors bg-gray-50/30"
                                                >
                                                    <td className="px-6 py-4 text-gray-400 text-sm italic">
                                                        (Pendiente de registro)
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                                        {userG?.userGuestEmail}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                                            <div className="flex items-center gap-2">
                                                            {userG?.userGuestRole === "ADMIN" ? <FaUserShield className="text-blue-500"/> : <FaUserTie className="text-gray-400"/>}
                                                            {userG?.userGuestRole === "ADMIN" ? 'Administrador' : 'Usuario'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {userG?.userGuestStatus === "PENDIENT" && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                                Pendiente
                                                            </span>
                                                        )}
                                                        {userG?.userGuestStatus === "ACCEPTED" && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                                Aceptado
                                                            </span>
                                                        )}
                                                        {userG?.userGuestStatus === "REJECTED" && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Rechazado
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {userG?.userGuestStatus === "PENDIENT" && (
                                                            <Link
                                                                to={`/users/guest/${userG?.userGuestId}`}
                                                                className="inline-flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                title='Eliminar invitación'
                                                            >
                                                                <FaTrash />
                                                            </Link>
                                                        )}
                                                        {userG?.userGuestStatus === "REJECTED" && (
                                                            <Link
                                                                to={`/users/guest/${userG?.userGuestId}`}
                                                                className="inline-flex items-center justify-center p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title='Reenviar'
                                                            >
                                                                <FaRedo />
                                                            </Link>
                                                        )}
                                                    </td>
                                                </Motion.tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </ProtectedView>
    );
}
