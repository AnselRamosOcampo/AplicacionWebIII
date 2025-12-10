import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productoRutas from './rutas/productoRutas.js';
import usuarioRutas from './rutas/usuarioRutas.js';
import pedidoRutas from './rutas/pedidoRutas.js';
import reporteRutas from './rutas/reporteRutas.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use('/api/productos', productoRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/pedidos', pedidoRutas);
app.use('/api/reportes', reporteRutas);
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API del Kiosco de Comidas funcionando correctamente',
        version: '1.0.0',
        rutas_disponibles: {
            productos: {
                obtener_todos: 'GET /api/productos',
                crear: 'POST /api/productos',
                obtener_uno: 'GET /api/productos/:id',
                actualizar: 'PUT /api/productos/:id',
                eliminar: 'DELETE /api/productos/:id'
            },
            usuarios: {
                registro: 'POST /api/usuarios/registro',
                login: 'POST /api/usuarios/login'
            }
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        ruta_solicitada: req.originalUrl,
        metodo: req.method,
        sugerencia: 'Verifica la URL o consulta la ruta / para ver las rutas disponibles'
    });
});
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        detalle: process.env.NODE_ENV === 'development' ? err.message : 'Contacta al administrador'
    });
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
    console.log(`Prueba en: http://localhost:${PORT}`);
});