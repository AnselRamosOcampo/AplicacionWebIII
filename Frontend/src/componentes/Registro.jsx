import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../servicios/api.jsx';

function Registro() {
    const navegador = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navegador('/');
        }
    }, [navegador]);
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        password: '',
        confirmPassword: '',
        rol: 'usuario'
    });
    const [fortalezaPassword, setFortalezaPassword] = useState('');
    const [colorFortaleza, setColorFortaleza] = useState('#dc3545');
    const [puntajeFortaleza, setPuntajeFortaleza] = useState(0);
    const [captcha, setCaptcha] = useState({
        pregunta: '',
        respuestaCorrecta: 0,
        respuestaUsuario: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const generarCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({
            pregunta: `¿Cuánto es ${num1} + ${num2}?`,
            respuestaCorrecta: num1 + num2,
            respuestaUsuario: ''
        });
    };
    const validarPassword = (password) => {
        let fortaleza = 0;
        let mensaje = '';
        let color = '#dc3545';
        const tieneLongitud = password.length >= 8;
        const tieneMayuscula = /[A-Z]/.test(password);
        const tieneMinuscula = /[a-z]/.test(password);
        const tieneNumero = /[0-9]/.test(password);
        const tieneEspecial = /[^A-Za-z0-9]/.test(password);
        if (tieneLongitud) fortaleza += 1;
        if (tieneMayuscula) fortaleza += 1;
        if (tieneMinuscula) fortaleza += 1;
        if (tieneNumero) fortaleza += 1;
        if (tieneEspecial) fortaleza += 1;
        switch(fortaleza) {
            case 0:
            case 1:
                mensaje = 'Muy débil';
                color = '#dc3545';
                break;
            case 2:
                mensaje = 'Débil';
                color = '#fd7e14';
                break;
            case 3:
                mensaje = 'Moderada';
                color = '#ffc107';
                break;
            case 4:
                mensaje = 'Fuerte';
                color = '#28a745';
                break;
            case 5:
                mensaje = 'Muy fuerte';
                color = '#20c997';
                break;
            default:
                mensaje = 'Muy débil';
                color = '#dc3545';
        }

        setFortalezaPassword(mensaje);
        setColorFortaleza(color);
        setPuntajeFortaleza(fortaleza);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'password') {
            validarPassword(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        
        if (!formData.correo.trim()) {
            setError('El correo es requerido');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo)) {
            setError('El formato del correo no es válido');
            return;
        }
        
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (parseInt(captcha.respuestaUsuario) !== captcha.respuestaCorrecta) {
            setError('Respuesta CAPTCHA incorrecta');
            generarCaptcha();
            return;
        }
        if (puntajeFortaleza < 3) {
            setError('La contraseña es demasiado débil. Mejora tu contraseña.');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            console.log('📤 Intentando registrar usuario...');
            
            const usuarioData = {
                nombre: formData.nombre,
                correo: formData.correo,
                password: formData.password,
                rol: formData.rol
            };
            
            const resultado = await registrarUsuario(usuarioData);
            
            console.log('✅ Registro exitoso:', resultado);
            alert('✅ Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
            navegador('/login'); 
        } catch (err) {
            console.error('❌ Error en registro:', err);
            setError(err.message || 'Error al registrar usuario. Intenta nuevamente.');
            generarCaptcha();
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        generarCaptcha();
    }, []);

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                    📝 Registro de Usuario
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                    Crea una cuenta para gestionar el kiosco
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
                        Nombre completo *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
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
                        placeholder="Mínimo 8 caracteres"
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
                    {formData.password && (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ 
                                fontSize: '14px',
                                color: '#6c757d',
                                marginBottom: '5px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Fortaleza:</span>
                                <span style={{ fontWeight: 'bold', color: colorFortaleza }}>
                                    {fortalezaPassword}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '5px'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${puntajeFortaleza * 20}%`,
                                    backgroundColor: colorFortaleza,
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#6c757d',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Débil</span>
                                <span>Fuerte</span>
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                        Confirmar Contraseña *
                    </label>
                    <input
                        type={mostrarPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
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
                    marginBottom: '25px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: '500', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🔒</span> Verificación de seguridad
                        </label>
                        <button
                            type="button"
                            onClick={generarCaptcha}
                            disabled={loading}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span>🔄</span> Nuevo
                        </button>
                    </div>
                    
                    <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: '#495057',
                        textAlign: 'center',
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        border: '1px dashed #ced4da'
                    }}>
                        {captcha.pregunta}
                    </div>
                    
                    <input
                        type="number"
                        value={captcha.respuestaUsuario}
                        onChange={(e) => setCaptcha(prev => ({...prev, respuestaUsuario: e.target.value}))}
                        placeholder="Escribe la respuesta"
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: loading ? '#6c757d' : '#28a745',
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
                            gap: '8px'
                        }}
                    >
                        {loading ? (
                            <>
                                <span>🔄</span>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <span>📝</span>
                                Registrarse
                            </>
                        )}
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ color: '#6c757d', margin: 0 }}>
                        ¿Ya tienes una cuenta?{' '}
                        <Link 
                            to="/login" 
                            style={{ 
                                color: '#007bff', 
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </form>
            <div style={{
                marginTop: '25px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#6c757d'
            }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>📋 Requisitos de contraseña:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra mayúscula (A-Z)</li>
                    <li>Al menos una letra minúscula (a-z)</li>
                    <li>Al menos un número (0-9)</li>
                    <li>Al menos un carácter especial (!@#$%^&*)</li>
                </ul>
            </div>
        </div>
    );
}

export default Registro;