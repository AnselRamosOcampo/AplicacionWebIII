import { useState, useEffect } from 'react';
import { obtProductos } from '../servicios/api.jsx';
import { obtenerUsuarioActual, esAdministrador } from '../servicios/api.jsx';

function Dashboard() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const esAdmin = esAdministrador();
    
    useEffect(() => {
        const cargarDatos = async () => {
            const usuarioActual = obtenerUsuarioActual();
            setUsuario(usuarioActual);
            
            try {
                const datos = await obtProductos();
                setProductos(datos);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, []);
    
    if (cargando) {
        return <div>Cargando...</div>;
    }
    
    if (esAdmin) { //solo para admins
        return (
            <div>
                <h1>👑 Panel de Administración</h1>
            </div>
        );
    }

    return ( //vista solo para usuarios
        <div>
            <h1>🍽️ Menú del Kiosco</h1>
            <p>Bienvenido, {usuario?.nombre}</p>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                marginTop: '30px'
            }}>
                {productos.map(producto => (
                    <div key={producto.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <h3>{producto.nombre}</h3>
                        <p>{producto.descripcion}</p>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ 
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#28a745'
                            }}>
                                Bs. {producto.precio}
                            </span>
                            <span style={{
                                padding: '5px 10px',
                                backgroundColor: producto.stock > 0 ? '#28a745' : '#dc3545',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '12px'
                            }}>
                                {producto.stock > 0 ? `Disponible: ${producto.stock}` : 'Agotado'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;