import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtProductos } from '../servicios/api.jsx';
import { obtenerUsuarioActual, esAdministrador } from '../servicios/api.jsx';
function ReportePDF() {
    const navegador = useNavigate();
    const [productos, setProductos] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [usuario, setUsuario] = useState(null);
    const esAdmin = esAdministrador();
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                const datos = await obtProductos();
                setProductos(datos);
                setFiltrados(datos);
                
                const usuarioActual = obtenerUsuarioActual();
                setUsuario(usuarioActual);
            } catch (error) {
                console.error('Error cargando productos:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);
    useEffect(() => {
        let resultado = [...productos];
        
        switch(filtro) {
            case 'agotados':
                resultado = resultado.filter(p => (parseInt(p.stock) || 0) === 0);
                break;
            case 'stock-bajo':
                resultado = resultado.filter(p => {
                    const stock = parseInt(p.stock) || 0;
                    return stock > 0 && stock <= 5;
                });
                break;
            case 'comida':
                resultado = resultado.filter(p => p.categoria === 'comida');
                break;
            case 'bebida':
                resultado = resultado.filter(p => p.categoria === 'bebida');
                break;
            case 'snack':
                resultado = resultado.filter(p => p.categoria === 'snack');
                break;
            case 'postre':
                resultado = resultado.filter(p => p.categoria === 'postre');
                break;
            default:
                break;
        }
        
        setFiltrados(resultado);
    }, [filtro, productos]);
    const generarPDF = async () => {
        console.log('🖱️ Iniciando generación de PDF...');
        
        try {
            const { jsPDF } = await import('jspdf');
            console.log('✅ jsPDF cargado correctamente');
            const doc = new jsPDF();
            doc.setFont('helvetica');
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Reporte de Inventario - Kiosco', 14, 22);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const fecha = new Date().toLocaleDateString();
            const hora = new Date().toLocaleTimeString();
            doc.text(`Fecha: ${fecha} ${hora}`, 14, 32);
            doc.text(`Generado por: ${usuario?.nombre || 'Usuario'} (${usuario?.rol || 'Rol'})`, 14, 39);
            doc.text(`Productos: ${filtrados.length} | Filtro: ${obtenerNombreFiltro(filtro)}`, 14, 46);
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 52, 196, 52);
            const agotados = filtrados.filter(p => (parseInt(p.stock) || 0) === 0).length;
            const stockBajo = filtrados.filter(p => {
                const stock = parseInt(p.stock) || 0;
                return stock > 0 && stock <= 5;
            }).length;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('📊 ESTADÍSTICAS', 14, 62);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`• Total productos: ${filtrados.length}`, 20, 70);
            doc.text(`• Productos agotados: ${agotados}`, 20, 77);
            doc.text(`• Productos con stock bajo: ${stockBajo}`, 20, 84);
            if (filtrados.length > 0) {
                let yPos = 95;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('ID', 14, yPos);
                doc.text('NOMBRE', 30, yPos);
                doc.text('CAT.', 110, yPos);
                doc.text('PRECIO', 130, yPos);
                doc.text('STOCK', 160, yPos);
                doc.text('ESTADO', 180, yPos);
                doc.line(14, yPos + 2, 196, yPos + 2);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                yPos += 10;
                
                filtrados.forEach((producto, index) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    const stock = parseInt(producto.stock) || 0;
                    const estado = stock === 0 ? 'AGOTADO' : (stock <= 5 ? 'BAJO' : 'OK');
                    const estadoColor = stock === 0 ? [255, 0, 0] : 
                                      (stock <= 5 ? [255, 152, 0] : [76, 175, 80]);
                    doc.text(`#${producto.id}`, 14, yPos);
                    const nombre = producto.nombre.length > 25 
                        ? producto.nombre.substring(0, 25) + '...' 
                        : producto.nombre;
                    doc.text(nombre, 30, yPos);
                    const catEmoji = {
                        'comida': '🍔',
                        'bebida': '🥤',
                        'snack': '🍟',
                        'postre': '🍰'
                    }[producto.categoria] || '📦';
                    doc.text(`${catEmoji} ${producto.categoria}`, 110, yPos);
                    doc.text(`Bs. ${parseFloat(producto.precio).toFixed(2)}`, 130, yPos);
                    doc.text(stock.toString(), 160, yPos);
                    doc.setTextColor(...estadoColor);
                    doc.text(estado, 180, yPos);
                    doc.setTextColor(0, 0, 0); 
                    yPos += 7;
                    if ((index + 1) % 5 === 0 && index < filtrados.length - 1) {
                        doc.setDrawColor(240, 240, 240);
                        doc.line(14, yPos - 3, 196, yPos - 3);
                        yPos += 2;
                    }
                });
                const totalValor = filtrados.reduce((sum, p) => {
                    return sum + (parseFloat(p.precio) * (parseInt(p.stock) || 0));
                }, 0);
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`💰 VALOR TOTAL DEL INVENTARIO: Bs. ${totalValor.toFixed(2)}`, 14, yPos + 10);
            }
            const totalPaginas = doc.getNumberOfPages();
            for (let i = 1; i <= totalPaginas; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text(
                    `Página ${i} de ${totalPaginas} | Reporte generado el ${fecha} ${hora}`,
                    14,
                    doc.internal.pageSize.height - 10
                );
            }
            const nombreArchivo = `reporte-inventario-${fecha.replace(/\//g, '-')}.pdf`;
            doc.save(nombreArchivo);
            
            console.log('✅ PDF generado exitosamente:', nombreArchivo);
            alert(`✅ Reporte generado: ${nombreArchivo}`);
            
        } catch (error) {
            console.error('❌ ERROR generando PDF:', error);
            console.error('📋 Detalles:', error.message);
            generarPDFUltraSimple();
        }
    };
    const generarPDFUltraSimple = () => {
        try {
            const pdfContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reporte de Inventario</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .agotado { color: red; font-weight: bold; }
                        .bajo { color: orange; }
                        .ok { color: green; }
                    </style>
                </head>
                <body>
                    <h1>📊 Reporte de Inventario - Kiosco</h1>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    <p><strong>Generado por:</strong> ${usuario?.nombre || 'Usuario'} (${usuario?.rol || 'Rol'})</p>
                    <p><strong>Productos:</strong> ${filtrados.length}</p>
                    <p><strong>Filtro:</strong> ${obtenerNombreFiltro(filtro)}</p>
                    
                    <h3>📦 Lista de Productos</h3>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                        </tr>
                        ${filtrados.map(p => {
                            const stock = parseInt(p.stock) || 0;
                            const estado = stock === 0 ? 'AGOTADO' : (stock <= 5 ? 'BAJO' : 'OK');
                            const clase = stock === 0 ? 'agotado' : (stock <= 5 ? 'bajo' : 'ok');
                            return `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.nombre}</td>
                                    <td>${p.categoria}</td>
                                    <td>Bs. ${parseFloat(p.precio).toFixed(2)}</td>
                                    <td>${stock}</td>
                                    <td class="${clase}">${estado}</td>
                                </tr>
                            `;
                        }).join('')}
                    </table>
                    
                    <p style="margin-top: 30px;">
                        <strong>💡 Este es un reporte HTML que puedes imprimir como PDF (Ctrl+P → Guardar como PDF)</strong>
                    </p>
                </body>
                </html>
            `;
            const ventana = window.open('', '_blank');
            ventana.document.write(pdfContent);
            ventana.document.close();
            
            alert('📄 Reporte generado en nueva ventana. Presiona Ctrl+P para guardar como PDF.');
            
        } catch (error) {
            console.error('❌ Error en fallback:', error);
            alert('⚠️ Error al generar reporte. Revisa la consola para más detalles.');
        }
    };
    const generarReporteAgotados = async () => {
        const agotados = productos.filter(p => (parseInt(p.stock) || 0) === 0);
        
        if (agotados.length === 0) {
            alert('✅ No hay productos agotados');
            return;
        }
        
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            
            doc.setFont('helvetica');
            doc.setFontSize(18);
            doc.text('⚠️ REPORTE DE PRODUCTOS AGOTADOS', 14, 22);
            
            doc.setFontSize(11);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
            doc.text(`Total agotados: ${agotados.length}`, 14, 39);
            
            let yPos = 50;
            agotados.forEach((producto, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${producto.nombre}`, 20, yPos);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`   ID: #${producto.id} | Categoría: ${producto.categoria}`, 25, yPos + 7);
                doc.text(`   Precio: Bs. ${parseFloat(producto.precio).toFixed(2)}`, 25, yPos + 14);
                
                yPos += 25;
            });
            
            doc.save(`productos-agotados-${Date.now()}.pdf`);
            alert(`✅ Reporte de ${agotados.length} productos agotados generado`);
            
        } catch (error) {
            console.error('Error en reporte agotados:', error);
            alert(`Productos agotados (${agotados.length}):\n` + 
                  agotados.map(p => `• ${p.nombre} - Bs. ${p.precio}`).join('\n'));
        }
    };

    const obtenerNombreFiltro = (valor) => {
        const opciones = {
            'todos': 'Todos los productos',
            'agotados': 'Productos agotados',
            'stock-bajo': 'Stock bajo (≤5 unidades)',
            'comida': 'Comida',
            'bebida': 'Bebidas',
            'snack': 'Snacks',
            'postre': 'Postres'
        };
        return opciones[valor] || valor;
    };

    if (cargando) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '32px', marginBottom: '15px' }}>📊</div>
                <p>Cargando datos para el reporte...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h1 style={{ color: '#333', margin: 0 }}>📊 Generar Reportes</h1>
                    <p style={{ color: '#666', margin: '5px 0 0 0' }}>
                        {productos.length} productos disponibles
                    </p>
                </div>
                
                <button
                    onClick={() => navegador('/')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Volver al menú
                </button>
            </div>
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '30px',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '20px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>📦</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{productos.length}</div>
                    <div style={{ color: '#666' }}>Productos totales</div>
                </div>
                
                <div style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '20px',
                    backgroundColor: '#ffebee',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
                        {productos.filter(p => (parseInt(p.stock) || 0) === 0).length}
                    </div>
                    <div style={{ color: '#666' }}>Agotados</div>
                </div>
                
                <div style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '20px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔔</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
                        {productos.filter(p => {
                            const stock = parseInt(p.stock) || 0;
                            return stock > 0 && stock <= 5;
                        }).length}
                    </div>
                    <div style={{ color: '#666' }}>Stock bajo</div>
                </div>
            </div>
            <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📋 Opciones de Reporte</h3>
                
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                        Filtrar productos:
                    </label>
                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                    >
                        <option value="todos">Todos los productos</option>
                        <option value="agotados">Productos agotados</option>
                        <option value="stock-bajo">Stock bajo (≤5 unidades)</option>
                        <option value="comida">Comida</option>
                        <option value="bebida">Bebidas</option>
                        <option value="snack">Snacks</option>
                        <option value="postre">Postres</option>
                    </select>
                    <p style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                        Mostrando <strong>{filtrados.length}</strong> productos
                    </p>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '15px',
                    maxWidth: '500px'
                }}>
                    <button
                        onClick={generarPDF}
                        style={{
                            padding: '15px 25px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196f3'}
                    >
                        <span style={{ fontSize: '20px' }}>📄</span>
                        Generar Reporte Completo (PDF)
                    </button>
                    <button
                        onClick={generarReporteAgotados}
                        style={{
                            padding: '15px 25px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        Reporte de Productos Agotados
                    </button>
                </div>
                
                <div style={{ 
                    marginTop: '25px', 
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <p style={{ margin: 0 }}>
                        <strong>💡 Información:</strong> Los reportes se generan en formato PDF y se descargan automáticamente.
                        Si hay problemas técnicos, se mostrará una versión alternativa en el navegador.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ReportePDF;