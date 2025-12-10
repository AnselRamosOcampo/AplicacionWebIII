import axios from "axios";
const API_URL = 'http://localhost:3001/api';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ Error de API:', error.response?.status, error.message);
        
        if (error.response) {
            if (error.response.status === 401) {
                console.warn('⚠️ Token inválido o expirado. Cerrando sesión...');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/login';
            }
            if (error.response.status === 403) {
                console.warn('⚠️ Permisos insuficientes');
                alert('No tienes permisos para realizar esta acción');
            }
            const serverError = error.response.data?.error || error.response.data?.mensaje;
            if (serverError) {
                return Promise.reject(new Error(serverError));
            }
        }
        
        return Promise.reject(error);
    }
);
export const obtProductos = async () => {
    try {
        console.log('Obteniendo productos de:', `${API_URL}/productos`);
        const respuesta = await api.get('/productos');
        console.log('Productos recibidos:', respuesta.data.length, 'productos');
        return respuesta.data;
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        throw error;
    }
};
export const obtProducto = async (id) => {
    try {
        const respuesta = await api.get(`/productos/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        throw error;
    }
};
export const insertaProducto = async (producto) => {
    try {
        console.log('Enviando producto:', producto);
        const respuesta = await api.post('/productos', producto);
        console.log('Producto creado:', respuesta.data);
        return respuesta.data;
    } catch (error) {
        console.error('Error creando producto:', error);
        throw error;
    }
};
export const actualizaProducto = async (id, producto) => {
    try {
        const respuesta = await api.put(`/productos/${id}`, producto);
        return respuesta.data;
    } catch (error) {
        console.error('Error actualizando producto:', error);
        throw error;
    }
};
export const eliminaProducto = async (id) => {
    try {
        const respuesta = await api.delete(`/productos/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error('Error eliminando producto:', error);
        throw error;
    }
};
export const registrarUsuario = async (usuario) => {
    try {
        const datos = {
            nombre: usuario.nombre,
            correo: usuario.correo || usuario.email, 
            password: usuario.password,
            rol: usuario.rol || 'usuario'
        };
        
        console.log('📤 Enviando registro:', datos);
        const respuesta = await api.post('/usuarios/registro', datos);
        return respuesta.data;
    } catch (error) {
        console.error('Error registrando usuario:', error);
        throw error;
    }
};
export const loginUsuario = async (credenciales) => {
    try {
        const datos = {
            correo: credenciales.correo || credenciales.email,
            password: credenciales.password
        };
        
        console.log('📤 Enviando login:', { correo: datos.correo });
        const respuesta = await api.post('/usuarios/login', datos);
        
        if (respuesta.data.token) {
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
        }
        
        return respuesta.data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};
export const logoutUsuario = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    console.log('🚪 Sesión cerrada');
};

export const obtenerUsuarioActual = () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
};

export const estaAutenticado = () => {
    return localStorage.getItem('token') !== null;
};

export const esAdministrador = () => {
    const usuario = obtenerUsuarioActual();
    return usuario && usuario.rol === 'admin';
};

export const obtenerPerfil = async () => {
    try {
        console.log('👤 Obteniendo perfil...');
        const respuesta = await api.get('/usuarios/perfil');
        console.log('✅ Perfil obtenido');
        return respuesta.data;
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error.message);
        throw error;
    }
};
export const verificarPermisosAdmin = async () => {
    try {
        if (!estaAutenticado()) return false;
        
        console.log('👑 Verificando permisos de admin...');
        await api.get('/usuarios/admin');
        console.log('✅ Usuario es administrador');
        return true;
    } catch (error) {
        console.warn('⚠️ Usuario no es administrador:', error.message);
        return false;
    }
};