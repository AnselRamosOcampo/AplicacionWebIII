import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ mensaje: 'Rutas de pedidos (próximamente)' });
});

export default router;