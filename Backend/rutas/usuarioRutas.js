import express from 'express';
import { 
    registrar, 
    login,
    verificarToken,
    esAdmin,
    obtenerPerfil 
} from '../controladores/usuarioControlador.js';

const rutas = express.Router();
// RUTAS PÚBLICAS
rutas.post('/registro', registrar);
rutas.post('/login', login);
// RUTAS PROTEGIDAS
rutas.get('/perfil', verificarToken, obtenerPerfil);
rutas.get('/admin', verificarToken, esAdmin, (req, res) => {
    res.json({
        success: true,
        mensaje: '✅ Bienvenido administrador',
        usuario: req.usuario
    });
});

rutas.get('/protegida', verificarToken, (req, res) => {
    res.json({
        success: true,
        mensaje: '✅ Acceso a ruta protegida',
        usuario: req.usuario
    });
});

export default rutas;