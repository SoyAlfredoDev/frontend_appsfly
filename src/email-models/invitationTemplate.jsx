import React from 'react';

export const InvitationEmail = ({ role, loginUrl = 'https://appsfly.netlify.app/register' }) => {
    
    // Definimos los estilos como objetos JS para garantizar compatibilidad con clientes de correo
    const styles = {
        body: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: '#f3f4f6',
            margin: 0,
            padding: 0,
            width: '100%',
        },
        wrapper: {
            padding: '20px',
            backgroundColor: '#f3f4f6',
        },
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        header: {
            // BRANDING: Usando tus colores AppsFly (Green -> Blue)
            background: 'linear-gradient(to right, #01c676, #094fd1)', 
            padding: '30px',
            textAlign: 'center',
        },
        headerTitle: {
            color: '#ffffff',
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'Chillax, sans-serif', // Tu fuente de headers
        },
        content: {
            padding: '40px',
            color: '#374151',
        },
        h2: {
            color: '#021f41', // Tu color Dark Navy
            marginTop: 0,
            fontSize: '20px',
            fontWeight: 'bold',
        },
        text: {
            lineHeight: '1.6',
            fontSize: '16px',
            marginBottom: '20px',
            color: '#374151',
        },
        badgeContainer: {
            textAlign: 'center',
            margin: '20px 0',
        },
        roleBadge: {
            display: 'inline-block',
            backgroundColor: '#e0e7ff',
            color: '#094fd1', // Brand Blue
            padding: '6px 12px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '14px',
        },
        button: {
            display: 'block',
            width: '100%',
            maxWidth: '250px',
            margin: '30px auto',
            backgroundColor: '#01c676', // Brand Green (Action)
            color: '#ffffff',
            textDecoration: 'none',
            textAlign: 'center',
            padding: '14px 0',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
        },
        footer: {
            backgroundColor: '#f9fafb',
            padding: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
        },
    };

    return (
        <html lang="es">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Invitación a AppsFly</title>
            </head>
            <body style={styles.body}>
                <div style={styles.wrapper}>
                    <div style={styles.container}>
                        {/* Header */}
                        <div style={styles.header}>
                            <h1 style={styles.headerTitle}>AppsFly</h1>
                        </div>

                        {/* Content */}
                        <div style={styles.content}>
                            <h2 style={styles.h2}>¡Has sido invitado a unirte al equipo!</h2>
                            <p style={styles.text}>Hola,</p>
                            <p style={styles.text}>
                                Te hemos invitado a colaborar en <strong>AppsFly</strong>. Se te ha asignado el siguiente rol:
                            </p>
                            
                            <div style={styles.badgeContainer}>
                                <span style={styles.roleBadge}>
                                    {role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>

                            <p style={styles.text}>
                                Para aceptar la invitación y comenzar a trabajar, por favor inicia sesión o crea tu cuenta haciendo clic en el siguiente botón:
                            </p>

                            <a href={loginUrl} style={styles.button} target="_blank" rel="noreferrer">
                                Acceder a AppsFly
                            </a>

                            <p style={{ ...styles.text, fontSize: '14px', color: '#6b7280', marginTop: '30px' }}>
                                Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
                            </p>
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <p style={{ margin: '5px 0' }}>&copy; {new Date().getFullYear()} AppsFly. Todos los derechos reservados.</p>
                            <p style={{ margin: '5px 0' }}>Este es un mensaje automático, por favor no respondas a este correo.</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
};