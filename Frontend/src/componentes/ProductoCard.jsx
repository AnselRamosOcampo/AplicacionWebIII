import { useState } from 'react';
import { Link } from 'react-router-dom';
import { esAdministrador } from '../servicios/api.jsx';
function ProductoCard({ producto, onDelete }) {
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const esAdmin = esAdministrador();
    console.log(`📦 Producto ${producto.id} - Nombre: ${producto.nombre}, Stock: ${producto.stock}, Tipo: ${typeof producto.stock}`);
    const stockNum = parseInt(producto.stock) || 0;
    console.log(`🔢 Stock parseado: ${stockNum}`);
    const obtenerIcono = (categoria) => {
        switch(categoria) {
            case 'comida': return '🍔';
            case 'bebida': return '🥤';
            case 'snack': return '🍟';
            case 'postre': return '🍰';
            default: return '📦';
        }
    };
    
    // Obtener color de categoría
    const obtenerColorCategoria = (categoria) => {
        switch(categoria) {
            case 'comida': return '#28a745';
            case 'bebida': return '#17a2b8';
            case 'snack': return '#ffc107';
            case 'postre': return '#e83e8c';
            default: return '#6c757d';
        }
    };
    const obtenerColorStock = () => {
        if (stockNum === 0) return '#dc3545';
        if (stockNum <= 5) return '#ffc107';
        return '#28a745';
    };
    const descripcionCorta = producto.descripcion 
        ? (producto.descripcion.length > 80 
            ? producto.descripcion.substring(0, 80) + '...' 
            : producto.descripcion)
        : 'Sin descripción disponible';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid #e9ecef',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        >
            <div style={{
                backgroundColor: obtenerColorCategoria(producto.categoria),
                color: 'white',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>
                        {obtenerIcono(producto.categoria)}
                    </span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {producto.categoria}
                    </span>
                </div>
                
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                }}>
                    ID: #{producto.id}
                </div>
            </div>
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Nombre del producto */}
                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    lineHeight: '1.4'
                }}>
                    {producto.nombre}
                </h3>
                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '15px',
                    flexGrow: 1
                }}>
                    {descripcionCorta}
                </p>
                {mostrarDetalles && producto.descripcion && producto.descripcion.length > 80 && (
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '13px',
                        color: '#495057'
                    }}>
                        <strong>Descripción completa:</strong><br />
                        {producto.descripcion}
                    </div>
                )}
                {producto.descripcion && producto.descripcion.length > 80 && (
                    <button
                        onClick={() => setMostrarDetalles(!mostrarDetalles)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#17a2b8',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: '5px 0',
                            marginBottom: '15px',
                            textAlign: 'left',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        {mostrarDetalles ? (
                            <>🙈 Ver menos</>
                        ) : (
                            <>👁️ Ver descripción completa</>
                        )}
                    </button>
                )}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                }}>
                    <div>
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#28a745'
                        }}>
                            Bs. {parseFloat(producto.precio).toFixed(2)}
                        </span>
                    </div>
                    
                    <div style={{
                        backgroundColor: obtenerColorStock(),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        <span>📦</span>
                        <span>{stockNum === 0 ? 'AGOTADO' : `Stock: ${stockNum}`}</span>
                    </div>
                </div>
            </div>
            <div style={{
                borderTop: '1px solid #e9ecef',
                padding: '15px 20px',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Botón VER DETALLES (para todos) */}
                    <button
                        onClick={() => setMostrarDetalles(!mostrarDetalles)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>🔍</span>
                        {mostrarDetalles ? 'Ocultar' : 'Ver detalles'}
                    </button>
                    {esAdmin && (
                        <>
                            <Link 
                                to={`/editar/${producto.id}`}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>✏️</span>
                                Editar
                            </Link>
                            
                            <button
                                onClick={() => onDelete(producto.id, producto.nombre)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>🗑️</span>
                                Eliminar
                            </button>
                        </>
                    )}
                </div>
                {!esAdmin && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        fontSize: '12px',
                        color: '#6c757d'
                    }}>
                        👤 Vista de usuario - Solo lectura
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductoCard;