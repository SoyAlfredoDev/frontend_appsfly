import { Link } from "react-router-dom";
import { getUsersBusinessDB } from "../../api/user.js";
import { getUserGuestByBusinessIdRequest } from "../../api/userGuest.js";
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/authContext.jsx";
import { useAbortEffect, isAbortError } from "../../hooks/useAbortEffect.js";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
  ExpenseTableScroll,
  ExpenseTableLoading,
} from "../../components/ui/ExpenseTableCard.jsx";
import {
  PRIMARY_BTN,
  THEAD,
  TH,
  TBODY,
  TR_ROW,
  ACTION_VIEW,
  ACTION_DELETE,
  ACTION_EDIT,
} from "../../utils/expenseUiPatterns.js";
import {
  FaTrash,
  FaRedo,
  FaEye,
  FaUserPlus,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userGuest, setUserGuest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const { businessSelected } = useAuth();

  useAbortEffect((signal) => {
    const businessId = businessSelected?.userBusinessBusinessId;
    if (!businessId) {
      setLoading(false);
      return;
    }

    const searchData = async () => {
      try {
        setLoading(true);
        const [userGuestFound, usersFound] = await Promise.all([
          getUserGuestByBusinessIdRequest(businessId, { signal }),
          getUsersBusinessDB({ signal }),
        ]);
        if (!signal.aborted) {
          setUserGuest(userGuestFound.data);
          setUsers(usersFound.data);
        }
      } catch (error) {
        if (!isAbortError(error)) console.error(error);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };
    searchData();
  }, [businessSelected?.userBusinessBusinessId]);

  const q = globalFilter.toLowerCase().trim();
  const filteredUsers = users.filter((user) => {
    if (!q) return true;
    const name = `${user?.userFirstName} ${user?.userLastName}`.toLowerCase();
    return name.includes(q) || user?.userEmail?.toLowerCase().includes(q);
  });
  const filteredGuests = userGuest.filter((g) => {
    if (!q) return true;
    return g?.userGuestEmail?.toLowerCase().includes(q);
  });
  const totalCount = filteredUsers.length + filteredGuests.length;

  return (
    <ExpensePageLayout
      title="Usuarios"
      subtitle="Gestión de usuarios y permisos del sistema"
      actions={
        <Link to="/users/userGuest" className={PRIMARY_BTN}>
          <FaUserPlus /> Invitar Usuario
        </Link>
      }
    >
      <ExpenseTableCard
        sectionTitle="Listado de usuarios"
        recordCount={totalCount}
        loading={loading}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Buscar por nombre o correo..."
      >
        <ExpenseTableScroll>
          <table className="w-full text-left border-collapse">
            <thead className={THEAD}>
              <tr>
                <th className={TH}>Nombre y Apellido</th>
                <th className={TH}>Correo Electrónico</th>
                <th className={TH}>Rol</th>
                <th className={`${TH} text-center`}>Estado</th>
                <th className={`${TH} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={TBODY}>
              {loading ? (
                <ExpenseTableLoading colSpan={5} message="Cargando usuarios..." />
              ) : (
                <>
                  {filteredUsers.map((user) => (
                    <Motion.tr
                      key={user?.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={TR_ROW}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium text-sm">
                        {user?.userFirstName} {user?.userLastName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {user?.userEmail}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          {user?.userRole === "ADMIN" ? (
                            <FaUserShield className="text-blue-500" />
                          ) : (
                            <FaUserTie className="text-gray-400" />
                          )}
                          {user?.userRole === "ADMIN" ? "Administrador" : "Usuario"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            to={`/users/${user?.userId}`}
                            className={ACTION_VIEW}
                            title="Ver detalle"
                          >
                            <FaEye />
                          </Link>
                        </div>
                      </td>
                    </Motion.tr>
                  ))}

                  {filteredGuests.map((userG) => (
                    <Motion.tr
                      key={userG?.userGuestId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${TR_ROW} bg-gray-50/30`}
                    >
                      <td className="px-6 py-4 text-gray-400 text-sm italic">
                        (Pendiente de registro)
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {userG?.userGuestEmail}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          {userG?.userGuestRole === "ADMIN" ? (
                            <FaUserShield className="text-blue-500" />
                          ) : (
                            <FaUserTie className="text-gray-400" />
                          )}
                          {userG?.userGuestRole === "ADMIN" ? "Administrador" : "Usuario"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {userG?.userGuestStatus === "PENDIENT" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pendiente
                          </span>
                        )}
                        {userG?.userGuestStatus === "ACCEPTED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Aceptado
                          </span>
                        )}
                        {userG?.userGuestStatus === "REJECTED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rechazado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {userG?.userGuestStatus === "PENDIENT" && (
                            <Link
                              to={`/users/guest/${userG?.userGuestId}`}
                              className={ACTION_DELETE}
                              title="Eliminar invitación"
                            >
                              <FaTrash />
                            </Link>
                          )}
                          {userG?.userGuestStatus === "REJECTED" && (
                            <Link
                              to={`/users/guest/${userG?.userGuestId}`}
                              className={ACTION_EDIT}
                              title="Reenviar"
                            >
                              <FaRedo />
                            </Link>
                          )}
                        </div>
                      </td>
                    </Motion.tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </ExpenseTableScroll>
      </ExpenseTableCard>
    </ExpensePageLayout>
  );
}
