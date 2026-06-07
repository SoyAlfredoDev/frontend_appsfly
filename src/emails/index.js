/**
 * Plantillas React renderizadas en el cliente y enviadas vía POST /api/send-email
 *
 * users/auth         → confirmación de cuenta, seguridad
 * users/invitations  → invitaciones a negocios (tenant)
 */

export { RegisterEmail } from "./users/auth/RegisterEmail.jsx";
export { InvitationEmail } from "./users/invitations/InvitationEmail.jsx";
