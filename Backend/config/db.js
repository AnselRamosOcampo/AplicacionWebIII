import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; //Esto sirve para leer las variables de entorno desde un archivo .env

dotenv.config(); //Carga las variables de entorno

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kiosco_comidas',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a MySQL exitosa');
        connection.release();
    } catch (error) {
        console.error('Error conectando a MySQL:', error.message);
        process.exit(1);
    }
}

testConnection();

export default pool;