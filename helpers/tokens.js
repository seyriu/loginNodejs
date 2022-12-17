import jwt from 'jsonwebtoken'

// .sign eso va a crear el jwt
// Lo que esta dentro del objeto sera lo que estara dentro del jwt
const generarJWT = datos => jwt.sign({id: datos.id, nombre: datos.nombre}, process.
env.JWT_SECRET, {expiresIn: '1d'}); // Expira en 1 dia

const generarId = () => Date.now().toString(32) + Math.random().toString(32).substring(2); // Genero la id


export {
    generarJWT,
    generarId
}

