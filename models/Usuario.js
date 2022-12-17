import { DataTypes } from 'sequelize'; // DataTypes es una forma de definir los tipos de datos de una tabla
import bcrypt from 'bcrypt'
import db from '../config/db.js'

const Usuario = db.define('usuarios', { // 'usuarios' es el nombre de la tabla que se va a crear con estos registros 
    nombre: {
        type: DataTypes.STRING, // En lenguaje SQL una cadena de texto seria 'varchar' pero en sequelize es STRING
        allowNull: false
    },  
    email: {
        type: DataTypes.STRING, // En lenguaje SQL una cadena de texto seria 'varchar' pero en sequelize es STRING
        allowNull: false
    },
    password: {
        type: DataTypes.STRING, // En lenguaje SQL una cadena de texto seria 'varchar' pero en sequelize es STRING
        allowNull: false
    },
     token: DataTypes.STRING,
     confirmado: DataTypes.BOOLEAN // Esta columna mostrara si el usuario esta confirmado
}, {
    hooks: { 
        beforeCreate: async function(usuario) { // hash de la contraseña antes de confirmar el usuario
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash( usuario.password, salt)
        }
    }
});

// Metodos personalizados
Usuario.prototype.verificarPassword = function(password) { // Tengo un objeto de tipo usuario y dentro de su prototype voy a registrar la funcion de verificarPassword
    return bcrypt.compareSync(password, this.password)
}   

export default Usuario