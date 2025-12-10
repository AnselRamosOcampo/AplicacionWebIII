import { useState, useEffect } from "react";
import { obtProductos, eliminaProducto } from '../servicios/api.jsx';
import { useNavigate } from "react-router-dom";
import { obtenerUsuarioActual, esAdministrador } from '../servicios/api.jsx';
import ProductoCard from './ProductoCard.jsx';
function Productos() {
    const navegador = useNavigate();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [anchoVentana, setAnchoVentana] = useState(window.innerWidth);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [orden, setOrden] = useState('reciente');
    const [usuario, setUsuario] = useState(null);
    const esAdmin = esAdministrador();
    const categorias = ['todas', 'comida', 'bebida', 'snack', 'postre'];
    const obtenerColumnas = () => {
        if (anchoVentana < 480) return 1;
        if (anchoVentana < 768) return 2;
        if (anchoVentana < 1024) return 3;
        return 4;
    };

    useEffect(() => {
        const usuarioActual = obtenerUsuarioActual();
        setUsuario(usuarioActual);
        cargarProductos();
        const manejarResize = () => setAnchoVentana(window.innerWidth);
        window.addEventListener('resize', manejarResize);
        return () => window.removeEventListener('resize', manejarResize);
    }, []);
    const cargarProductos = async () => {
        try {
            setCargando(true);
            setError('');
            const datos = await obtProductos();
            console.log('📦 Productos recibidos:', datos);
            if (datos && datos.length > 0) {
                console.log('📊 Primer producto:', datos[0]);
                console.log('🔢 Stock del primer producto:', datos[0].stock, 'Tipo:', typeof datos[0].stock);
            }
            
            setProductos(datos);
        } catch (err) {
            console.error('❌ Error cargando productos:', err);
            setError('No se pudieron cargar los productos.');
            setProductos([]);
        } finally {
            setCargando(false);
        }
    };

    const manejarEliminar = async (id, nombre) => {
        if (!esAdmin) {
            alert('❌ Solo los administradores pueden eliminar productos');
            return;
        }
        
        if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
        
        try {
            await eliminaProducto(id);
            alert('✅ Producto eliminado');
            cargarProductos();
        } catch (err) {
            console.error('Error eliminando:', err);
            alert('Error al eliminar producto');
        }
    };
    const productosFiltrados = productos
        .filter(producto => {
            // Filtro por búsqueda
            if (busqueda && !producto.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
                return false;
            }
            
            if (categoriaFiltro !== 'todas' && producto.categoria !== categoriaFiltro) {
                return false;
            }
            
            return true;
        })
        .sort((a, b) => {
            switch(orden) {
                case 'nombre':
                    return a.nombre.localeCompare(b.nombre);
                case 'precio-asc':
                    return a.precio - b.precio;
                case 'precio-desc':
                    return b.precio - a.precio;
                case 'stock':
                    return b.stock - a.stock;
                case 'reciente':
                default:
                    return b.id - a.id;
            }
        });
    const totalProductos = productos.length;
    const productosAgotados = productos.filter(p => {
        const stock = parseInt(p.stock) || 0;
        return stock === 0;
    }).length;
    
    const stockBajo = productos.filter(p => {
        const stock = parseInt(p.stock) || 0;
        return stock > 0 && stock <= 5;
    }).length;
    if (cargando) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
                <p>Cargando productos...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#f44336' }}>❌</div>
                <h3>Error de conexión</h3>
                <p>{error}</p>
                <button 
                    onClick={cargarProductos}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }
    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h1 style={{ color: '#333', margin: 0 }}>
                        {esAdmin ? '👑 Administración de Productos' : '🍽️ Menú del Kiosco'}
                    </h1>
                    
                    {esAdmin && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => navegador('/reportes')}
                                style={{
                                padding: '12px 24px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            >
                                <span>📊</span>
                                Generar Reportes
                            </button>

                        <button 
                            onClick={() => navegador('/nuevo')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                            <span style={{ fontSize: '20px' }}>➕</span>
                            Nuevo Producto
                        </button>
                        </div>
                    )}
                </div>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginTop: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        flex: '1',
                        minWidth: '150px',
                        borderLeft: '5px solid #28a745'
                    }}>
                        <div style={{ color: '#6c757d', fontSize: '14px' }}>Total Productos</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{totalProductos}</div>
                    </div>
                    
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        flex: '1',
                        minWidth: '150px',
                        borderLeft: '5px solid #dc3545'
                    }}>
                        <div style={{ color: '#6c757d', fontSize: '14px' }}>Agotados</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc3545' }}>{productosAgotados}</div>
                    </div>
                    
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        flex: '1',
                        minWidth: '150px',
                        borderLeft: '5px solid #ffc107'
                    }}>
                        <div style={{ color: '#6c757d', fontSize: '14px' }}>Stock Bajo (≤5)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>{stockBajo}</div>
                    </div>
                </div>
            </div>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                    {/* Barra de búsqueda */}
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                            🔍 Buscar producto
                        </label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Nombre del producto..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ced4da',
                                borderRadius: '8px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                            📂 Categoría
                        </label>
                        <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ced4da',
                                borderRadius: '8px',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'todas' ? 'Todas las categorías' : 
                                     cat === 'comida' ? '🍔 Comida' :
                                     cat === 'bebida' ? '🥤 Bebida' :
                                     cat === 'snack' ? '🍟 Snack' : '🍰 Postre'}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Ordenar */}
                    <div style={{ minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                            📊 Ordenar por
                        </label>
                        <select
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ced4da',
                                borderRadius: '8px',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="reciente">Más recientes</option>
                            <option value="nombre">Nombre (A-Z)</option>
                            <option value="precio-asc">Precio (menor a mayor)</option>
                            <option value="precio-desc">Precio (mayor a menor)</option>
                            <option value="stock">Stock (mayor a menor)</option>
                        </select>
                    </div>
                    {(busqueda || categoriaFiltro !== 'todas' || orden !== 'reciente') && (
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setBusqueda('');
                                    setCategoriaFiltro('todas');
                                    setOrden('reciente');
                                }}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>🗑️</span>
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {productosFiltrados.length === 0 ? (
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '72px', color: '#e9ecef', marginBottom: '20px' }}>📦</div>
                    <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
                        {productos.length === 0 ? 'No hay productos' : 'No se encontraron productos'}
                    </h3>
                    <p style={{ color: '#999', marginBottom: '30px' }}>
                        {productos.length === 0 
                            ? 'Agrega tu primer producto haciendo clic en el botón "Nuevo Producto"' 
                            : 'Prueba con otros filtros de búsqueda'}
                    </p>
                    {esAdmin && productos.length === 0 && (
                        <button 
                            onClick={() => navegador('/nuevo')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            Crear primer producto
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ 
                        marginBottom: '20px', 
                        color: '#6c757d',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>
                            Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos
                        </span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span>Vista:</span>
                            <button style={{
                                padding: '5px 10px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                🗃️ Grid
                            </button>
                            <button style={{
                                padding: '5px 10px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                📋 Lista
                            </button>
                        </div>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${obtenerColumnas()}, 1fr)`,
                        gap: '25px',
                        marginBottom: '40px'
                    }}>
                        {productosFiltrados.map((producto) => (
                            <ProductoCard 
                                key={producto.id} 
                                producto={producto} 
                                onDelete={manejarEliminar}
                                esAdmin={esAdmin}
                            />
                        ))}
                    </div>
                    <div style={{ 
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: '#6c757d',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: '15px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <span>
                                📦 <strong>{totalProductos}</strong> productos totales
                            </span>
                            <span style={{ color: '#dc3545' }}>
                                ⚠️ <strong>{productosAgotados}</strong> agotados
                            </span>
                            <span style={{ color: '#ffc107' }}>
                                🔔 <strong>{stockBajo}</strong> con stock bajo
                            </span>
                        </div>
                        
                        <div>
                            {usuario && (
                                <span>
                                    Conectado como: <strong>{usuario.nombre}</strong> ({usuario.rol})
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Productos;