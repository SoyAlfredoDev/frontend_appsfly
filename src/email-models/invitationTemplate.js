export const getInvitationEmailHtml = (role, loginUrl = 'https://appsfly.netlify.app/login') => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación a AppsFly</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(to right, #2563eb, #4f46e5); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 40px; color: #374151; }
        .content h2 { color: #111827; margin-top: 0; font-size: 20px; }
        .content p { line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
        .role-badge { display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 6px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
        .cta-button { display: block; width: 100%; max-width: 250px; margin: 30px auto; background-color: #10b981; color: #ffffff; text-decoration: none; text-align: center; padding: 14px 0; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.2s; }
        .cta-button:hover { background-color: #059669; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <div class="header">
                <h1>AppsFly</h1>
            </div>
            <div class="content">
                <h2>¡Has sido invitado a unirte al equipo!</h2>
                <p>Hola,</p>
                <p>Te hemos invitado a colaborar en <strong>AppsFly</strong>. Se te ha asignado el siguiente rol:</p>
                
                <div style="text-align: center;">
                    <span class="role-badge">${role === 'ADMIN' ? 'Administrador' : 'Usuario'}</span>
                </div>

                <p>Para aceptar la invitación y comenzar a trabajar, por favor inicia sesión o crea tu cuenta haciendo clic en el siguiente botón:</p>

                <a href="${loginUrl}" class="cta-button" target="_blank">Acceder a AppsFly</a>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} AppsFly. Todos los derechos reservados.</p>
                <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};
