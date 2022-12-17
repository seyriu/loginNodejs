import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import db from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import inicioRoutes from './routes/inicioRoutes.js'


// Creo la app
const app = express();

// Habilito lectura de datos de formularios
app.use(express.urlencoded({extended: true}));

// Habilito Cookie Parser
app.use( cookieParser() )

// Habilito CSRF
app.use(csurf({cookie: true}))

// Habilito pug
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta Publica
app.use(express.static('public'));

// Conexion a la base de datos
try {
    await db.authenticate(); // .authenticate  es un metodo de sequelize
    db.sync();
    console.log('Conexion correcta a la base de datos');
} catch (error) { // En el caso que haya un error, debuguear el error
    console.log(error);
}

// db.authenticate()
//     .then( () => console.log('Base de datos conectada'))
//     .catch( error => console.log(error));

// Rutas
app.use('/auth', usuarioRoutes);
app.use('/', inicioRoutes)


 // Defino el puerto y arranco el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
}); 