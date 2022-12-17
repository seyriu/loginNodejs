import express from 'express'
import { admin, dashboard} from '../controllers/inicioController.js'
const router = express.Router();

// Rutas pagina principal
router.get('/inicio', admin)

router.get('/inicio/dashboard', dashboard)


export default router