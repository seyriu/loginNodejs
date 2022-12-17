import express from 'express';
import { formularioLogin, autenticar, formularioRegistro, registrar, confirmar, 
comprobarToken, nuevoPassword, formularioOlvidePassword, resetPassword } 
from '../controllers/usuarioController.js';

const router = express.Router();

// Rutas login
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Rutas Registro
router.get('/registro', formularioRegistro);
router.post('/registro', registrar);


router.get('/confirmar/:token', confirmar);

// Rutas para cambiar contraseña
router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

// Almacenar el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);




export default router