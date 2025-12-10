import express from 'express';
import {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    desactivarProducto
} from '../controladores/productoControlador.js';

const rutas = express.Router();
import { verificarToken, esAdmin } from '../controladores/usuarioControlador.js';

// Rutas publicas
rutas.get('/', obtenerProductos);           // Obtener todos
rutas.get('/:id', obtenerProducto);         // Obtener uno por ID
// RUTAS PROTEGIDAS (requieren autenticación)
rutas.post('/', verificarToken, esAdmin, crearProducto); // Solo admin puede crear
rutas.put('/:id', verificarToken, esAdmin, actualizarProducto); // Solo admin puede editar
rutas.delete('/:id', verificarToken, esAdmin, eliminarProducto); // Solo admin puede eliminar
rutas.delete('/:id', verificarToken, esAdmin, desactivarProducto); 

export default rutas;