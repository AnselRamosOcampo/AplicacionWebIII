import bcrypt from 'bcryptjs';
import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();
async function crearUsuarioAdmin() {
    try {
        console.log('🔧 Creando usuario administrador...');
        const nombre = 'Administrador';
        const correo = 'admin@kiosco.com';
        const password = 'Admin123!'; 
        const rol = 'admin';
        const [usuariosExistentes] = await pool.query(
            'SELECT id FROM usuarios WHERE correo = ?',
            [correo]
        );
        if (usuariosExistentes.length > 0) {
            console.log('⚠️  El usuario administrador ya existe');
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contraseña, rol, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
            [nombre, correo, passwordHash, rol]
        );
        
        console.log('✅ Usuario administrador creado exitosamente');
        console.log('📧 Correo:', correo);
        console.log('🔑 Contraseña:', password);
        console.log('👑 Rol:', rol);
        console.log('🆔 ID:', resultado.insertId);
    } catch (error) {
        console.error('❌ Error creando usuario admin:', error);
    } finally {
        process.exit();
    }
}

crearUsuarioAdmin();