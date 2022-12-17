import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js'; 
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        csrfToken: req.csrfToken()
    });
}

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El Password es obligatorio').
    run(req)

        // Funcion validationResult() te dice cual es el resultado de la validacion
        let resultado = validationResult(req) 

        // Verifico que el resultado este vacio
        if(!resultado.isEmpty()) { // ¿El resultado esta vacio?
            // Lo que hago aqui es Negar esta condicion, es decir, el usuario no esta vacio, por lo tanto hay errores.
            return res.render('auth/login', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
                pagina: 'Iniciar Sesión',
                errores: resultado.array(), 
                csrfToken: req.csrfToken()
            })
        }
         
        const {email, password} = req.body
        
        // Compruebo si el usuario exite
        const usuario = await Usuario.findOne({ where: {email} }); // Va a buscar en la tabla usuarios si un usuario esta registrado con su email
        if(!usuario) {
            return res.render('auth/login', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
                pagina: 'Iniciar Sesión',
                errores: [{msg: 'El usuario no existe'}], 
                csrfToken: req.csrfToken()
            })
        }

        // Compruebo si el usuario esta confirmado
        if(!usuario.confirmado) {
            return res.render('auth/login', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
                pagina: 'Iniciar Sesión',
                errores: [{msg: 'Tu cuenta no esta confirmada'}], 
                csrfToken: req.csrfToken()
            })
        }

        // Reviso si la contraseña es correcta
        if(!usuario.verificarPassword(password)) { // verificarPassword es el nombre del prototype que esta definido en el modelo 
            return res.render('auth/login', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
                pagina: 'Iniciar Sesión',
                errores: [{msg: 'El password es incorrecto'}], 
                csrfToken: req.csrfToken()
            })
        }

        // Autentico al usuario
        const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
        console.log(token)

        // Lo almaceno en un cookie
        return res.cookie('_token', token, {
            httpOnly: true, // Esto hace que un cookie no sea accesible desde la API de javascript
            // secure: true
            // sameSite: true
        }).redirect('/inicio')
 }

const formularioRegistro = (req, res) => { 
    
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
}

const registrar = async (req, res) => {

    // Validación
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').
    run(req)
    await check('repetirPassword').equals(req.body.password).withMessage('Los password no son iguales').run(req)
    
    // Funcion validationResult() te dice cual es el resultado de la validacion
    let resultado = validationResult(req) 

    // Verifico que el resultado este vacio
    if(!resultado.isEmpty()) { // ¿El resultado esta vacio?
        // Lo que hago aqui es Negar esta condicion, es decir, el usuario no esta vacio, por lo tanto hay errores.
        return res.render('auth/registro', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
            pagina: 'Crear Cuenta',
            errores: resultado.array(), 
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer los datos
    const { nombre, email, password} = req.body

    // Verificar que el usuario no este duplicado
    const existeUsuario = await  Usuario.findOne({ where : { email }})
    if(existeUsuario) { // ¿El usuario esta registrado?
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya esta Registrado'}], 
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

       // const usuarios = await Usuario.create(req.body);
    // res.json(usuarios)

    // Almaceno a un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envio un email de confirmacion
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })
    
    // Muestro mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confirmacion'
    });

}

// Funcion que compruebe una cuenta
 const confirmar = async (req, res) => {
    const { token } = req.params; // De esta forma se puede leer los valores de la url
    console.log(token);

    // Verifico si el token es correcto
    const usuario = await Usuario.findOne({where: {token}}) // Va a buscar en la tabla de usuarios el que tenga el token que se haya registrado

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirma tu cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmo la cuenta
    
    // Cambio los valores
    usuario.token = null;
    usuario.confirmado = true;

    // Almaceno en la base de datos
    await usuario.save() // Guardo los cambios en la base de datos
    
    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente'
    })
}


const formularioOlvidePassword = (req, res) => {
        res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso',
            csrfToken: req.csrfToken()
    });
}

const resetPassword = async (req, res) => {
    
    await check('email').isEmail().withMessage('El email esta vacio').run(req)
    
    // Funcion validationResult() te dice cual es el resultado de la validacion
    let resultado = validationResult(req) 

    // Verifico que el resultado este vacio
    if(!resultado.isEmpty()) { // ¿El resultado esta vacio?
        // Lo que hago aqui es Negar esta condicion, es decir, el usuario no esta vacio, por lo tanto hay errores.
        return res.render('auth/olvide-password', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
            pagina: 'Recupera tu acceso',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Busco al usuario
    const { email } = req.body
    
    const usuario = await Usuario.findOne({where: {email}}); // Va a buscar en la tabla de usuarios el email que este registrado

    console.log(usuario);
    if(!usuario) {
        return res.render('auth/olvide-password', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
            pagina: 'Recupera tu acceso',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningun usuario'}]
        })
    }


    // Genero un nuevo token y envio un correo
    usuario.token = generarId(); // Genero un nuevo id
    await usuario.save(); // Lo almaceno en la bd

    // Envio un email
    emailOlvidePassword({
        email: email,
        nombre: usuario.nombre,
        token: usuario.token
    });

    // Renderizo un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    });
}

const comprobarToken = async (req, res) => {
    
    const {token} = req.params;
    
    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu contraseña',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }

    // Mostrar un formulario para modificar la contraseña
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu contraseña',
        csrfToken: req.csrfToken()
    })
 }

const nuevoPassword = async (req, res) => {
    
    // Validar la contraseña
    await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').
    run(req)

    let resultado = validationResult(req) 

    // Verifico que el resultado este vacio
    if(!resultado.isEmpty()) { // ¿El resultado esta vacio?
        // Lo que hago aqui es Negar esta condicion, es decir, el usuario no esta vacio, por lo tanto hay errores.
        return res.render('auth/reset-password', { // Renderizo la pagina con los errores y ya no se ejecuta nada mas. 
            pagina: 'Reestablece tu contraseña',
            errores: resultado.array(), 
            csrfToken: req.csrfToken(), 
        })
    }

    const {token} = req.params
    const {password} = req.body

    // Identifico quien realiza el cambio
    const usuario = await Usuario.findOne({where: {token}});

   // Hasheo de la contraseña
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( password, salt)
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña reestablecida',
        mensaje: 'La contraseña se guardo correctamente'
    })
}   

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}