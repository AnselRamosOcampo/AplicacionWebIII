import { Navigate } from 'react-router-dom';
import { obtenerUsuarioActual } from '../servicios/api.jsx';
function rutaProtegida({ children, requireAdmin = false }) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }
    if (requireAdmin && usuario.rol !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default rutaProtegida;