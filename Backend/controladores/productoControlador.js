import pool from '../config/db.js';

export const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await pool.query(
            'SELECT * FROM productos ORDER BY id DESC'
        );
        res.json(productos);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

export const obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE id = ? AND activo = true',
            [id]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(productos[0]);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};
export const crearProducto = async (req, res) => {
    try {
        const { nombre, precio, categoria, descripcion, stock } = req.body;
        
        // Validaciones 
        if (!nombre || !precio || !categoria) {
            return res.status(400).json({ 
                error: 'Faltan campos: nombre, precio o categoria' 
            });
        }
        
        if (precio <= 0) {
            return res.status(400).json({ 
                error: 'El precio debe ser mayor a 0' 
            });
        }
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                error: 'El stock no puede ser negativo'
            })
        }
        const stockValor = stock !== undefined ? parseInt(stock) : 0;
        
        const [resultado] = await pool.query(
            `INSERT INTO productos (nombre, precio, categoria, descripcion, stock) 
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, precio, categoria, descripcion || '', stockValor]
        );
        
        res.status(201).json({
            success: true,
            id: resultado.insertId,
            mensaje: 'Producto creado exitosamente'
        });
        
    } catch (error) {
        console.error(' Error creando producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, categoria, descripcion, stock } = req.body;

        if (!nombre || !precio || !categoria) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre, precio y categoría son requeridos' 
            });
        }

        if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Precio debe ser un número mayor a 0' 
            });
        }

        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                error: 'El stock no puede ser negativo'
            })
        }

        const [productosExistentes] = await pool.query(
            'SELECT id FROM productos WHERE id = ? AND activo = 1',
            [id]
        );
        
        if (productosExistentes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Producto no encontrado' 
            });
        }
        
        const [resultado] = await pool.query(
            `UPDATE productos 
             SET nombre = ?, precio = ?, categoria = ?, descripcion = ?, stock = ? 
             WHERE id = ? AND activo = true`,
            [nombre, precio, categoria, descripcion, stock, id]
        );
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ 
            success: true, 
            mensaje: 'Producto actualizado' 
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

export const desactivarProducto = async (req, res) => {
    const [resultado] = await pool.query(
        'UPDATE productos SET activo = 0 WHERE id = ?',
        [req.params.id]
    );
    res.json({ mensaje: 'Producto desactivado' });
};

export const eliminarProducto = async (req, res) => {
    const [resultado] = await pool.query(
        'DELETE FROM productos WHERE id = ?',
        [req.params.id]
    );
    res.json({ mensaje: 'Producto ELIMINADO permanentemente' });
};