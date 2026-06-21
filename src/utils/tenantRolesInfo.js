import { NAV_ITEMS } from "../components/layout/navigationConfig.js";
import { TENANT_ROLES, hasTenantPermission } from "./tenantPermissions.js";

export const TENANT_ROLE_LABELS = {
    [TENANT_ROLES.ADMIN]: "Administrador",
    [TENANT_ROLES.USER]: "Usuario",
};

export const TENANT_ROLE_SUMMARIES = {
    [TENANT_ROLES.ADMIN]:
        "Dueño o gerente del negocio. Control total: finanzas, configuración, equipo y suscripción.",
    [TENANT_ROLES.USER]:
        "Vendedor o cajero. Operación diaria: clientes, ventas y consulta de catálogo e inventario.",
};

/** Vistas del menú lateral visibles por rol */
export function getNavLabelsForRole(role) {
    return NAV_ITEMS.filter(
        (item) => !item.permission || hasTenantPermission(role, item.permission),
    ).map((item) => item.name);
}

export const TENANT_ROLE_CAPABILITIES = {
    [TENANT_ROLES.ADMIN]: [
        { label: "Dashboard completo", detail: "KPIs de ventas, caja, por cobrar y efectivo disponible." },
        { label: "Clientes", detail: "Ver, crear, editar y eliminar clientes." },
        { label: "Ventas", detail: "Registrar ventas, ver historial y detalle." },
        { label: "Cierres diarios", detail: "Ver historial y ejecutar cierres de caja." },
        { label: "Productos e inventario", detail: "Gestionar catálogo, categorías y ajustes de stock." },
        { label: "Compras y proveedores", detail: "Registrar compras y administrar proveedores." },
        { label: "Gastos y transacciones", detail: "Control de egresos y movimientos de caja." },
        { label: "Reportes", detail: "Reportes financieros y operativos del negocio." },
        { label: "Campaña ASMR", detail: "Crear y enviar campañas de fidelización por WhatsApp." },
        { label: "Usuarios", detail: "Invitar miembros y asignar rol Administrador o Usuario." },
        { label: "Suscripción", detail: "Ver estado, pagar plan y cancelar renovación automática." },
        { label: "Asistente IA", detail: "Consultas inteligentes sobre ventas, clientes y stock." },
    ],
    [TENANT_ROLES.USER]: [
        { label: "Dashboard operativo", detail: "Ventas del día, del mes y número de transacciones." },
        { label: "Clientes", detail: "Ver, crear y editar clientes (no eliminar)." },
        { label: "Ventas", detail: "Registrar nuevas ventas y consultar historial." },
        { label: "Productos", detail: "Consulta de catálogo para apoyar la venta." },
        { label: "Inventario", detail: "Consulta de stock y movimientos (sin ajustes)." },
        { label: "Perfil", detail: "Datos personales y estado de suscripción (solo lectura)." },
        { label: "Soporte", detail: "Crear y consultar tickets de ayuda." },
    ],
};

export const TENANT_ROLE_RESTRICTIONS = {
    [TENANT_ROLES.USER]: [
        "No accede a gastos, compras, proveedores ni transacciones.",
        "No puede ejecutar cierres diarios ni ver reportes.",
        "No gestiona usuarios, campañas ASMR ni suscripción.",
        "No usa el asistente IA ni elimina clientes.",
    ],
};
