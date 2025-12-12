import React from 'react';

export const RegisterEmail = ({ firstName, lastName, confirmationLink }) => {
  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    padding: '20px',
    color: '#333',
  };

  const contentStyle = {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const buttonStyle = {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    marginTop: '20px',
  };

  const footerStyle = {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={{ color: '#007bff' }}>¡Bienvenido a AppsFly!</h1>
        <p>Hola <strong>{firstName} {lastName}</strong>,</p>
        <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte con nosotros.</p>
        <p>Para comenzar, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>

        <a href={confirmationLink} style={buttonStyle}>
          Confirmar mi cuenta
        </a>

        <p style={{ marginTop: '30px' }}>
          Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
        </p>
      </div>
      <div style={footerStyle}>
        <p>&copy; {new Date().getFullYear()} AppsFly. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default RegisterEmail;
