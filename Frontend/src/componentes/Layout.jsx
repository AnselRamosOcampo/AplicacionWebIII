import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual, logoutUsuario } from '../servicios/api.jsx';

function Layout({ children }) {
    const navegador = useNavigate();
    const usuario = obtenerUsuarioActual();
    const esAdmin = usuario && usuario.rol === 'admin';
    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logoutUsuario();
            navegador('/login');
        }
    };
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Navbar */}
            <nav style={{
                backgroundColor: '#343a40',
                color: 'white',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" style={{ 
                        color: 'white', 
                        textDecoration: 'none',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        🛒 Kiosco App
                    </Link>
                    
                    {esAdmin && (
                        <Link to="/nuevo" style={{ 
                            color: 'white', 
                            textDecoration: 'none',
                            fontSize: '14px',
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            ➕ Nuevo Producto
                        </Link>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {usuario ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    backgroundColor: usuario.rol === 'admin' ? '#dc3545' : '#17a2b8',
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {usuario.rol === 'admin' ? '👑 Admin' : '👤 Usuario'}
                                </div>
                                <span style={{ fontSize: '14px' }}>
                                    {usuario.nombre}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <span>🚪</span>
                                Salir
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link to="/login" style={{ 
                                color: 'white', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '8px 15px',
                                backgroundColor: '#007bff',
                                borderRadius: '5px'
                            }}>
                                Iniciar Sesión
                            </Link>
                            <Link to="/registro" style={{ 
                                color: 'white', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '8px 15px',
                                backgroundColor: '#28a745',
                                borderRadius: '5px'
                            }}>
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
            
            {/* Contenido principal */}
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {children}
            </main>
            
            {/* Footer */}
            <footer style={{
                backgroundColor: '#f8f9fa',
                padding: '15px 20px',
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '14px',
                borderTop: '1px solid #dee2e6',
                marginTop: 'auto'
            }}>
                <p style={{ margin: 0 }}>
                    © 2024 Kiosco App - Proyecto de Programacion Web III | 
                    {usuario && ` Conectado como: ${usuario.nombre} (${usuario.rol})`}
                </p>
            </footer>
        </div>
    );
}

export default Layout;