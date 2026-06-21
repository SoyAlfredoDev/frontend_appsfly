import { Link } from "react-router-dom";
import { getBusinessMembersRequest } from "../../api/userBusiness.js";
import {
    getUserGuestByBusinessIdRequest,
    deleteUserGuestRequest,
    resendUserGuestRequest,
} from "../../api/userGuest.js";
import { useState, useCallback, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/authContext.jsx";
import { useAbortEffect, isAbortError } from "../../hooks/useAbortEffect.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useConfirm } from "../../context/ConfirmationContext.jsx";
import ExpensePageLayout from "../../components/ui/ExpensePageLayout.jsx";
import ExpenseTableCard, {
    ExpenseTableScroll,
    ExpenseTableLoading,
    ExpenseTableEmpty,
} from "../../components/ui/ExpenseTableCard.jsx";
import {
    PRIMARY_BTN,
    THEAD,
    TH,
    TBODY,
    TR_ROW,
    TD,
    TD_MUTED,
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
    FaUsers,
    FaInfoCircle,
} from "react-icons/fa";
import TenantRolesInfoModal from "../../components/users/TenantRolesInfoModal.jsx";

const INVITE_STATUSES = new Set(["PENDIENT", "REJECTED"]);

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [userGuest, setUserGuest] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [rolesInfoOpen, setRolesInfoOpen] = useState(false);
    const { businessSelected, business } = useAuth();
    const toast = useToast();
    const confirm = useConfirm();

    const businessId = businessSelected?.userBusinessBusinessId;
    const businessName = business?.businessName;

    const loadData = useCallback(
        async (signal) => {
            if (!businessId) {
                setUsers([]);
                setUserGuest([]);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [userGuestFound, membersFound] = await Promise.all([
                    getUserGuestByBusinessIdRequest(businessId, { signal }),
                    getBusinessMembersRequest(businessId, { signal }),
                ]);
                if (!signal?.aborted) {
                    const invites = (userGuestFound.data ?? []).filter((g) =>
                        INVITE_STATUSES.has(g.userGuestStatus),
                    );
                    setUserGuest(invites);
                    setUsers(Array.isArray(membersFound.data) ? membersFound.data : []);
                }
            } catch (error) {
                if (!isAbortError(error)) {
                    console.error(error);
                    toast.error(
                        "Error al cargar",
                        error.response?.data?.message || "No se pudo obtener el listado de usuarios.",
                    );
                }
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [businessId, toast],
    );

    useAbortEffect((signal) => {
        loadData(signal);
    }, [loadData]);

    const handleDeleteInvite = async (userGuestId, email) => {
        const isConfirmed = await confirm({
            title: "Eliminar invitación",
            message: `¿Eliminar la invitación pendiente para ${email}?`,
            variant: "danger",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!isConfirmed) return;

        setActionId(userGuestId);
        try {
            await deleteUserGuestRequest(userGuestId);
            toast.success("Invitación eliminada", "La invitación fue retirada correctamente.");
            await loadData();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo eliminar la invitación.",
            );
        } finally {
            setActionId(null);
        }
    };

    const handleResendInvite = async (userGuestId, email) => {
        setActionId(userGuestId);
        try {
            const res = await resendUserGuestRequest(userGuestId);
            if (res.data?.emailSent) {
                toast.success("Correo reenviado", `Se reenvió la invitación a ${email}.`);
            } else {
                toast.info("Invitación actualizada", "No se pudo enviar el correo en este intento.");
            }
            await loadData();
        } catch (error) {
            toast.error(
                "Error",
                error.response?.data?.message || "No se pudo reenviar la invitación.",
            );
        } finally {
            setActionId(null);
        }
    };

    const q = globalFilter.toLowerCase().trim();
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            if (!q) return true;
            const name = `${user?.userFirstName ?? ""} ${user?.userLastName ?? ""}`.toLowerCase();
            return name.includes(q) || user?.userEmail?.toLowerCase().includes(q);
        });
    }, [users, q]);

    const filteredGuests = useMemo(() => {
        return userGuest.filter((g) => {
            if (!q) return true;
            return g?.userGuestEmail?.toLowerCase().includes(q);
        });
    }, [userGuest, q]);

    const totalCount = filteredUsers.length + filteredGuests.length;
    const isEmpty = !loading && totalCount === 0;

    const subtitle = businessName
        ? `Equipo de ${businessName} — miembros activos e invitaciones pendientes`
        : "Gestión de usuarios y permisos del negocio activo";

    return (
        <ExpensePageLayout
            title="Usuarios"
            subtitle={subtitle}
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setRolesInfoOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-secondary border border-secondary/25 rounded-lg hover:bg-secondary/5 transition-colors shadow-sm text-sm font-medium"
                        title="Ver permisos por rol"
                    >
                        <FaInfoCircle />
                        Roles y permisos
                    </button>
                    {businessId ? (
                        <Link to="/users/userGuest" className={PRIMARY_BTN}>
                            <FaUserPlus /> Invitar usuario
                        </Link>
                    ) : null}
                </div>
            }
        >
            {!businessId && !loading ? (
                <div className="card card-body text-center text-sm text-slate-500">
                    Selecciona o registra un negocio para ver su equipo.
                </div>
            ) : (
                <ExpenseTableCard
                    sectionTitle="Equipo del negocio"
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
                                    <th className={TH}>Nombre</th>
                                    <th className={TH}>Correo</th>
                                    <th className={TH}>Rol</th>
                                    <th className={`${TH} text-center`}>Estado</th>
                                    <th className={`${TH} text-center`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={TBODY}>
                                {loading ? (
                                    <ExpenseTableLoading
                                        colSpan={5}
                                        message="Cargando usuarios del negocio..."
                                    />
                                ) : isEmpty ? (
                                    <ExpenseTableEmpty
                                        colSpan={5}
                                        icon={<FaUsers className="text-3xl text-slate-300" />}
                                        title="No hay usuarios ni invitaciones"
                                        hint="Invita a alguien para que se una a tu negocio."
                                    />
                                ) : (
                                    <>
                                        {filteredUsers.map((user) => (
                                            <Motion.tr
                                                key={user.userId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={TR_ROW}
                                            >
                                                <td className={`${TD} font-medium text-dark`}>
                                                    {user.userFirstName} {user.userLastName}
                                                </td>
                                                <td className={TD_MUTED}>{user.userEmail}</td>
                                                <td className={TD_MUTED}>
                                                    <div className="flex items-center gap-2">
                                                        {user.userRole === "ADMIN" ? (
                                                            <FaUserShield className="text-secondary shrink-0" />
                                                        ) : (
                                                            <FaUserTie className="text-slate-400 shrink-0" />
                                                        )}
                                                        {user.userRole === "ADMIN"
                                                            ? "Administrador"
                                                            : "Usuario"}
                                                    </div>
                                                </td>
                                                <td className={`${TD} text-center`}>
                                                    <span className="badge-primary">Activo</span>
                                                </td>
                                                <td className={`${TD} text-center`}>
                                                    <Link
                                                        to={`/users/${user.userId}`}
                                                        className={ACTION_VIEW}
                                                        title="Ver detalle"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </td>
                                            </Motion.tr>
                                        ))}

                                        {filteredGuests.map((userG) => (
                                            <Motion.tr
                                                key={userG.userGuestId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`${TR_ROW} bg-slate-50/40`}
                                            >
                                                <td className={`${TD} text-slate-400 italic`}>
                                                    Invitación pendiente
                                                </td>
                                                <td className={TD_MUTED}>{userG.userGuestEmail}</td>
                                                <td className={TD_MUTED}>
                                                    <div className="flex items-center gap-2">
                                                        {userG.userGuestRole === "ADMIN" ? (
                                                            <FaUserShield className="text-secondary shrink-0" />
                                                        ) : (
                                                            <FaUserTie className="text-slate-400 shrink-0" />
                                                        )}
                                                        {userG.userGuestRole === "ADMIN"
                                                            ? "Administrador"
                                                            : "Usuario"}
                                                    </div>
                                                </td>
                                                <td className={`${TD} text-center`}>
                                                    {userG.userGuestStatus === "PENDIENT" ? (
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                                                            Pendiente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                                            Rechazada
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`${TD} text-center`}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {userG.userGuestStatus === "PENDIENT" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteInvite(
                                                                        userG.userGuestId,
                                                                        userG.userGuestEmail,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionId === userG.userGuestId
                                                                }
                                                                className={ACTION_DELETE}
                                                                title="Eliminar invitación"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                        {userG.userGuestStatus === "REJECTED" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleResendInvite(
                                                                        userG.userGuestId,
                                                                        userG.userGuestEmail,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionId === userG.userGuestId
                                                                }
                                                                className={ACTION_EDIT}
                                                                title="Reenviar invitación"
                                                            >
                                                                <FaRedo />
                                                            </button>
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
            )}
            <TenantRolesInfoModal
                isOpen={rolesInfoOpen}
                onClose={() => setRolesInfoOpen(false)}
            />
        </ExpensePageLayout>
    );
}
