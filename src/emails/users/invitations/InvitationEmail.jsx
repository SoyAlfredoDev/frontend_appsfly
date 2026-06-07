/**
 * Plantilla React de invitación — alineada con backend/emails/users/invitations/.
 * El envío principal ocurre en el backend al crear/reenviar invitaciones.
 */
export const InvitationEmail = ({
    role = "USER",
    businessName,
    inviterName,
    loginUrl,
    registerUrl,
}) => {
    const actionUrl =
        registerUrl ||
        loginUrl ||
        `${import.meta.env.VITE_FRONTEND_URL || "https://appsfly.app"}/register`;
    const roleLabel = role === "ADMIN" ? "Administrador" : "Usuario";

    return (
        <html lang="es">
            <head>
                <meta charSet="UTF-8" />
                <title>Invitación a AppsFly</title>
            </head>
            <body style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#eef2f6", margin: 0 }}>
                <div style={{ maxWidth: 600, margin: "24px auto", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ background: "#021f41", color: "#fff", padding: "24px 28px" }}>
                        <h1 style={{ margin: 0, fontSize: 22 }}>AppsFly</h1>
                        <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
                            Invitación a colaborar
                        </p>
                    </div>
                    <div style={{ padding: "28px 32px", color: "#374151", lineHeight: 1.6 }}>
                        <p>
                            {inviterName ? <strong>{inviterName}</strong> : "Un administrador"} te invitó
                            {businessName ? (
                                <>
                                    {" "}
                                    a <strong>{businessName}</strong>
                                </>
                            ) : (
                                " a un negocio en AppsFly"
                            )}
                            .
                        </p>
                        <p>
                            Rol asignado: <strong style={{ color: "#021f41" }}>{roleLabel}</strong>
                        </p>
                        <p>Crea tu cuenta o inicia sesión con este correo y acepta la invitación desde tu panel.</p>
                        <a
                            href={actionUrl}
                            style={{
                                display: "inline-block",
                                marginTop: 16,
                                background: "#01c676",
                                color: "#fff",
                                textDecoration: "none",
                                padding: "12px 20px",
                                borderRadius: 8,
                                fontWeight: 700,
                            }}
                        >
                            Crear cuenta o iniciar sesión
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
};
