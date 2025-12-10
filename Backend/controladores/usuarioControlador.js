import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_del_kiosco_2024';

export const registrar = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;
        
        // validaciones
        if (!nombre || !correo || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre, correo y contraseña son requeridos' 
            });
        }
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correo)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Formato de correo inválido' 
            });
        }
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: 'La contraseña debe tener al menos 8 caracteres' 
            });
        }
        
        const [usuariosExistentes] = await pool.query(
            'SELECT id FROM usuarios WHERE correo = ?',
            [correo]
        );
        
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'El correo ya está registrado' 
            });
        }
        
        // encriptacion
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contraseña, rol, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
            [nombre, correo, passwordHash, rol || 'usuario']
        );

        const token = jwt.sign(
            { 
                id: resultado.insertId,
                correo: correo,
                rol: rol || 'usuario'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            mensaje: 'Usuario registrado exitosamente',
            token: token,
            usuario: {
                id: resultado.insertId,
                nombre: nombre,
                correo: correo,
                rol: rol || 'usuario'
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al registrar usuario',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        
        // Validaciones
        if (!correo || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Correo y contraseña son requeridos' 
            });
        }
        
        const [usuarios] = await pool.query(
            'SELECT * FROM usuarios WHERE correo = ?',
            [correo]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Credenciales incorrectas' 
            });
        }
        
        const usuario = usuarios[0];
        const passwordValida = await bcrypt.compare(password, usuario.contraseña);
        if (!passwordValida) {
            return res.status(401).json({ 
                success: false, 
                error: 'Credenciales incorrectas' 
            });
        }
        const token = jwt.sign(
            { 
                id: usuario.id,
                correo: usuario.correo,
                rol: usuario.rol || 'usuario'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol || 'usuario',
                fecha_registro: usuario.fecha_registro
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error en el servidor',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'Acceso no autorizado. Token requerido.' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token inválido o expirado' 
        });
    }
};

export const esAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ 
            success: false, 
            error: 'Usuario no autenticado' 
        });
    }
    
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }
    
    next();
};
export const obtenerPerfil = async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            'SELECT id, nombre, correo, rol, fecha_registro FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Usuario no encontrado' 
            });
        }
        
        res.json({
            success: true,
            usuario: usuarios[0]
        });
        
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener perfil' 
        });
    }
};