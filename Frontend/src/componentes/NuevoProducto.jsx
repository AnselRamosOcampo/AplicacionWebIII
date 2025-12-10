import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertaProducto } from '../servicios/api.jsx';

function NuevoProducto() {
    const navegador = useNavigate();
    const [producto, setProducto] = useState({
        nombre: '',
        precio: '',
        categoria: 'comida',
        descripcion: '',
        stock: 0
    });
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    const categorias = ['comida', 'bebida', 'snack', 'postre'];

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
        
        // Validaciones
        if (!producto.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        
        if (!producto.precio || parseFloat(producto.precio) <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }
        const stockValor = producto.stock === '' ? 0 : parseInt(producto.stock) || 0;
        if (stockValor < 0) {
            setError('El stock no puede ser negativo');
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
            
            console.log('📤 Enviando producto:', datosEnviar);
            await insertaProducto(datosEnviar);
            
            alert('✅ Producto creado exitosamente');
            //window.location.href = '/';
            navegador('/');
            
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al crear producto');
        } finally {
            setEnviando(false);
        }
    };

    const cancelar = () => {
        navegador('/');
    };

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button 
                    onClick={cancelar}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        marginRight: '10px',
                        color: '#6c757d'
                    }}
                >
                    ←
                </button>
                <h2 style={{ margin: 0, color: '#333' }}>➕ Nuevo Producto</h2>
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
                        ❌ {error}
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
                        placeholder="Ej: Hamburguesa Especial"
                        required
                        disabled={enviando}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
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
                            boxSizing: 'border-box'
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
                            backgroundColor: 'white'
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
                            backgroundColor: enviando ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: enviando ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {enviando ? (
                            <>
                                <span style={{ marginRight: '8px' }}>🔄</span>
                                Creando
                            </>
                        ) : (
                            'Crear Producto'
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
                            cursor: enviando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevoProducto;