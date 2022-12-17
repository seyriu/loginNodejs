import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({path:'.env'});

const db = new Sequelize(process.env.BD_NOMBRE , process.env.BD_USER, process.env.PASS ?? '', {
// Primer valor: nombre bd, Segundo valor: usuario, tercer valor: password
    host: process.env.BD_HOST, // Hosting local
    port: '3306',
    dialect: 'mysql',
    define: {
        timestamps: false // Cuando un usuario se registra agrega 2 columnas extras a la tabla, 
                            //cuando se registro y cuando fue actualizado
    },
    pool: { // Pool de conexion
        max: 5, // max de conexiones
        min: 0, // min de conexiones
        acquire: 30000, // 30 segundos es el tiempo que va a pasar tratando de elaborar una conexion antes de marcar un error
        idle: 10000 // 10 segundos en lo que ve que no hay nada de movimiento, nadie visitando el sitio
    },
    operatorAliases: false
});

export default db;