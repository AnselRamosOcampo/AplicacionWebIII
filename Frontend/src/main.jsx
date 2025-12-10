import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Importa tus componentes
import Productos from './componentes/Productos.jsx'
import NuevoProducto from './componentes/NuevoProducto.jsx'
import EditarProducto from './componentes/EditarProducto.jsx'
import Login from './componentes/Login.jsx'
import Registro from './componentes/Registro.jsx'
import Layout from './componentes/Layout.jsx'
import RutasProtegidas from './componentes/RutasProtegidas.jsx'  // Asegúrate que se llame así
import ReportePDF from './componentes/ReportePDF';
import './App.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                {/* RUTAS PROTEGIDAS */}
                <Route path="/" element={
                    <RutasProtegidas>
                        <Layout>
                            <Productos />
                        </Layout>
                    </RutasProtegidas>
                } />
                
                <Route path="/nuevo" element={
                    <RutasProtegidas requireAdmin={true}>
                        <Layout>
                            <NuevoProducto />
                        </Layout>
                    </RutasProtegidas>
                } />
                
                <Route path="/editar/:id" element={
                    <RutasProtegidas requireAdmin={true}>
                        <Layout>
                            <EditarProducto />
                        </Layout>
                    </RutasProtegidas>
                } />

                <Route path="/reportes" element={<ReportePDF />} />
                {/* RUTA 404 */}
                <Route path="*" element={
                    <div style={{ 
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <h1 style={{ fontSize: '72px', color: '#6c757d', margin: 0 }}>404</h1>
                        <p style={{ fontSize: '18px', color: '#495057', margin: '20px 0 30px 0' }}>
                            Página no encontrada
                        </p>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <a href="/" style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                fontWeight: '500'
                            }}>
                                Volver al inicio
                            </a>
                            <a href="/login" style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                fontWeight: '500'
                            }}>
                                Iniciar Sesión
                            </a>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);