import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../servicios/api.jsx';

function Login() {
    const navegador = useNavigate();
    
    // Si ya está autenticado, redirigir al inicio
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('✅ Usuario ya autenticado, redirigiendo...');
            navegador('/');
        }
    }, [navegador]);
    
    const [formData, setFormData] = useState({
        correo: '',
        password: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [recordarme, setRecordarme] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.correo.trim()) {
            setError('El correo es requerido');
            return;
        }
        
        if (!formData.password) {
            setError('La contraseña es requerida');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            console.log('🔐 Intentando iniciar sesión...', { correo: formData.correo });
            
            const credenciales = {
                correo: formData.correo,
                password: formData.password
            };
            
            const resultado = await loginUsuario(credenciales);
            
            console.log('✅ Login exitoso:', resultado);
            if (recordarme) {
                console.log('💾 Recordando usuario...');
                localStorage.setItem('recordarme', 'true');
            }
            alert('✅ Inicio de sesión exitoso');
            navegador('/');
            
        } catch (err) {
            console.error('❌ Error en login:', err);
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            setFormData(prev => ({
                ...prev,
                password: ''
            }));
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '450px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                    🔐 Iniciar Sesión
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                    Accede a tu cuenta del kiosco
                </p>
            </div>
            
            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '12px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                         {error}
                    </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Correo electrónico *
                    </label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        required
                        disabled={loading}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: '500', color: '#495057' }}>
                            Contraseña *
                        </label>
                        <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#17a2b8',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            {mostrarPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
                        </button>
                    </div>
                    <input
                        type={mostrarPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tu contraseña"
                        required
                        disabled={loading}
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
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={recordarme}
                            onChange={(e) => setRecordarme(e.target.checked)}
                            disabled={loading}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: '#495057', fontSize: '14px' }}>Recordarme</span>
                    </label>
                    
                    <Link 
                        to="/recuperar-password" 
                        style={{ 
                            color: '#17a2b8', 
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                
                {/* Botón de login */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: loading ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '15px'
                    }}
                >
                    {loading ? (
                        <>
                            <span>🔄</span>
                            Iniciando sesión...
                        </>
                    ) : (
                        <>
                            <span>🔐</span>
                            Iniciar Sesión
                        </>
                    )}
                </button>
                
                {/* Enlace a registro */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                        ¿No tienes una cuenta?{' '}
                        <Link 
                            to="/registro" 
                            style={{ 
                                color: '#28a745', 
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ 
                        marginTop: '25px', 
                        paddingTop: '20px', 
                        borderTop: '1px dashed #dee2e6'
                    }}>
                        <p style={{ 
                            textAlign: 'center', 
                            color: '#6c757d', 
                            fontSize: '12px',
                            marginBottom: '10px'
                        }}>
                            DEMO (Solo desarrollo)
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        correo: 'admin@kiosco.com',
                                        password: 'Admin123!'
                                    });
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Admin Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        correo: 'usuario@kiosco.com',
                                        password: 'Usuario123!'
                                    });
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Usuario Demo
                            </button>
                        </div>
                    </div>
                )}
            </form>
            <div style={{
                marginTop: '25px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#6c757d',
                textAlign: 'center'
            }}>
                <p style={{ margin: '0 0 5px 0' }}>
                    <strong>⚠️ Importante:</strong> Este sistema es para gestión del kiosco.
                </p>
                <p style={{ margin: 0 }}>
                    Contacta al administrador si no puedes acceder a tu cuenta.
                </p>
            </div>
        </div>
    );
}

export default Login;