import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtProducto, actualizaProducto } from '../servicios/api.jsx';

function EditarProducto() {
    const navegador = useNavigate();
    const { id } = useParams(); //el id de la url
    
    const [producto, setProducto] = useState({
        nombre: '',
        precio: '',
        categoria: 'comida',
        descripcion: '',
        stock: 0
    });
    
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [productoCargado, setProductoCargado] = useState(false);

    const categorias = ['comida', 'bebida', 'snack', 'postre'];
    useEffect(() => {
        const cargarProducto = async () => {
            if (!id) {
                setError('No se especificó ID del producto');
                setCargando(false);
                return;
            }
            
            try {
                setCargando(true);
                setError('');
                console.log(`📥 Cargando producto ID: ${id}`);
                
                const datos = await obtProducto(id);
                console.log('✅ Producto cargado:', datos);
                
                setProducto({
                    nombre: datos.nombre || '',
                    precio: datos.precio || '',
                    categoria: datos.categoria || 'comida',
                    descripcion: datos.descripcion || '',
                    stock: datos.stock || 0
                });
                setProductoCargado(true);
                
            } catch (err) {
                console.error('❌ Error cargando producto:', err);
                setError('No se pudo cargar el producto. ¿Existe en la base de datos?');
                setProductoCargado(false);
            } finally {
                setCargando(false);
            }
        };

        cargarProducto();
    }, [id]);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        if (name === 'stock') {
            setProducto({
                ...producto,
                [name]: value === '' ? '': parseInt(value) || 0
            });
        } else {
            setProducto({
                ...producto,
                [name]: value
            });
        }
        setProducto({
            ...producto,
            [name]: value
        });
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        console.log('📊 Estado actual del producto:', producto);
        console.log('🔢 Tipo de stock:', typeof producto.stock, 'Valor:', producto.stock);
        
        // validaciones
        if (!producto.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        
        if (!producto.precio || parseFloat(producto.precio) <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }
        const stockValue = producto.stock === '' ? 0 : parseInt(producto.stock) || 0;
        if (stockValue < 0) {
            setError('El stock no puede ser negativo');
            return;
        }
        
        if (!id) {
            setError('ID de producto no válido');
            return;
        }
        
        setError('');
        setEnviando(true);
        
        try {
            const datosEnviar = {
                ...producto,
                precio: parseFloat(producto.precio),
                stock: parseInt(producto.stock) || 0
            };
            console.log('📤 Datos a enviar al backend:', datosEnviar);
            console.log('📋 Stock a enviar:', datosEnviar.stock, 'Tipo:', typeof datosEnviar.stock);
            
            console.log(`📤 Actualizando producto ID ${id}:`, datosEnviar);
            await actualizaProducto(id, datosEnviar);
            
            alert('✅ Producto actualizado exitosamente');
            navegador('/');
        } catch (err) {
            console.error('❌ Error actualizando producto:', err);
            setError(err.response?.data?.error || 'Error al actualizar producto');
        } finally {
            setEnviando(false);
        }
    };
    const cancelar = () => {
        if (window.confirm('¿Cancelar edición? Los cambios no guardados se perderán.')) {
            navegador('/');
        }
    };
    if (cargando) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '15px' }}>🔄</div>
                <p>Cargando producto #{id}...</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    Conectando con el backend
                </p>
            </div>
        );
    }
    if (error && !productoCargado) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: '#f44336', marginBottom: '20px' }}>❌</div>
                <h3 style={{ color: '#333' }}>Error al cargar producto</h3>
                <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
                <button 
                    onClick={() => navegador('/')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Volver a la lista
                </button>
            </div>
        );
    }
    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                <button 
                    onClick={cancelar}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        marginRight: '15px',
                        color: '#6c757d',
                        padding: '5px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ←
                </button>
                <div>
                    <h2 style={{ margin: 0, color: '#333' }}>✏️ Editar Producto</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                        ID: <strong>#{id}</strong>
                    </p>
                </div>
            </div>
            
            <form onSubmit={manejarEnvio}>
                {error && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '12px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        border: '1px solid #f5c6cb'
                    }}>
                         {error}
                    </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Nombre del producto *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={producto.nombre}
                        onChange={manejarCambio}
                        placeholder="Nombre del producto"
                        required
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: enviando ? '#f8f9fa' : 'white'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Precio (Bs.) *
                    </label>
                    <input
                        type="number"
                        name="precio"
                        value={producto.precio}
                        onChange={manejarCambio}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: enviando ? '#f8f9fa' : 'white'
                        }}
                    />
                </div>
                
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Categoría
                    </label>
                    <select
                        name="categoria"
                        value={producto.categoria}
                        onChange={manejarCambio}
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: enviando ? '#f8f9fa' : 'white',
                            cursor: enviando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {categorias.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'comida' ? '🍲 Comida' : 
                                 cat === 'bebida' ? '🥤 Bebida' : 
                                 cat === 'snack' ? '🍟 Snack' : '🍰 Postre'}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={producto.descripcion}
                        onChange={manejarCambio}
                        placeholder="Describe el producto, ingredientes, etc."
                        rows="3"
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: enviando ? '#f8f9fa' : 'white',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Stock disponible
                    </label>
                    <input
                        type="number"
                        name="stock"
                        value={producto.stock}
                        onChange={manejarCambio}
                        placeholder="Ej: 10"
                        min="0"
                        step="1"
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            backgroundColor: enviando ? '#f8f9fa' : 'white'
                        }}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                        {producto.stock === '' || producto.stock === 0 ? '0 = sin disponibilidad' : 'Cantidad disponible en inventario'}
                    </small>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={enviando}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: enviando ? '#6c757d' : '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: enviando ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {enviando ? (
                            <>
                                <span>🔄</span>
                                Actualizando
                            </>
                        ) : (
                            <>
                                <span>💾</span>
                                Guardar Cambios
                            </>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={cancelar}
                        disabled={enviando}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: enviando ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span></span>
                        Cancelar
                    </button>
                </div>
                
                <div style={{
                    marginTop: '25px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6c757d'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>📝 Información:</p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>ID del producto: <strong>#{id}</strong></li>
                        <li>Los campos marcados con * son obligatorios</li>
                        <li>Los cambios se guardan permanentemente</li>
                    </ul>
                </div>
            </form>
        </div>
    );
}

export default EditarProducto;