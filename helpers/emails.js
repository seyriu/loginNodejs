import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const { email, nombre, token} = datos

      // Enviar el email
      await transport.sendMail({
        from: 'AgenFaceRecognizer',
        to: email,
        subject: 'Confirma tu cuenta en nuestro establecimiento',
        text: 'Confirma tu cuenta en nuestro establecimiento',
        html: `
              <p> Hola ${nombre}, comprueba tu cuenta en nuestro establecimiento  
              
              <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
              <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar 
              Cuenta</a> </p>

              <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      });
}


const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const { email, nombre, token} = datos

    // Enviar el email
    await transport.sendMail({
      from: 'AgenFaceRecognizer',
      to: email,
      subject: 'Reestablece tu contraseña en nuestro establecimiento',
      text: 'Reestablece tu en nuestro establecimiento',
      html: `
            <p> Hola ${nombre}, haz solicitado establecer tu contraseña en nuestro establecimiento</p>  
            
            <p>Sigue el siguiente enlace para generar una nueva contraseña:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablece 
            Tu contraseña</a> </p>

            <p>Si tu no pediste el cambio de contraseña, puedes ignorar este mensaje</p>
      `
    });
}

  

export {
    emailRegistro,
    emailOlvidePassword
}