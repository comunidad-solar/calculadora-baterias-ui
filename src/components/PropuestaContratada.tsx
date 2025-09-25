import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from './PageTransition';

interface PropuestaContratadaProps {
  data: {
    fsmState: string;
    propuesta: {
      id: string;
      estado: string;
      producto: {
        nombre: string;
        modelo: string;
        capacidad: string;
        precio: number;
        moneda: string;
      };
      fechaContratacion: string;
      numeroContrato?: string;
    };
    comunero: {
      nombre: string;
      email: string;
      telefono: string;
    };
  };
}

const PropuestaContratada: React.FC<PropuestaContratadaProps> = ({ data }) => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isContactingAdvisor, setIsContactingAdvisor] = useState(false);

  const { propuesta, comunero } = data;

  // Formatear fecha de contratación
  const formatFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  };

  // Formatear precio
  const formatPrecio = (precio: number, moneda: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Manejar contacto con asesor
  const handleContactarAsesor = async () => {
    setIsContactingAdvisor(true);
    try {
      // Aquí se podría hacer una llamada al backend para registrar la solicitud de contacto
      // Por ahora, simplemente mostrar el toast y abrir el email/teléfono
      
      showToast('Solicitud de contacto registrada. Un asesor se comunicará contigo pronto.', 'success');
      
      // Opcional: Abrir cliente de email con información predefinida
      const emailSubject = encodeURIComponent(`Consulta sobre propuesta contratada - ${propuesta.numeroContrato || propuestaId}`);
      const emailBody = encodeURIComponent(`Hola,\n\nTengo una consulta sobre mi propuesta contratada para el producto ${propuesta.producto.nombre}.\n\nPropuesta: ${propuesta.numeroContrato || propuestaId}\nCliente: ${comunero.nombre}\n\nGracias.`);
      
      // Esta URL se podría obtener del backend o configuración
      const emailAsesor = 'asesor@comunidadsolar.es';
      window.open(`mailto:${emailAsesor}?subject=${emailSubject}&body=${emailBody}`, '_blank');
      
    } catch (error) {
      console.error('Error al solicitar contacto con asesor:', error);
      showToast('Error al procesar la solicitud. Inténtalo de nuevo.', 'error');
    } finally {
      setIsContactingAdvisor(false);
    }
  };

  return (
    <PageTransition>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            
            {/* Encabezado de estado */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center bg-warning bg-opacity-15 rounded-pill px-4 py-2 mb-3">
                <span className="text-warning me-2" style={{fontSize: '1.2rem'}}>📝</span>
                <span className="text-white fw-semibold">Contrato Generado - Esperando Firma</span>
              </div>
              <h1 className="h3 fw-bold text-dark mb-2">¡Casi terminamos, {comunero.nombre}!</h1>
              <p className="text-muted">Tu contrato ha sido generado y está listo para firmar</p>
            </div>

            {/* Card principal con información del producto */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary bg-opacity-10 border-0 py-3">
                <h2 className="h5 mb-0 text-primary fw-bold">
                  <span className="me-2">🔋</span>
                  Producto Seleccionado
                </h2>
              </div>
              <div className="card-body p-4">
                
                {/* Información del producto */}
                <div className="row align-items-center mb-4">
                  <div className="col-md-8">
                    <h3 className="h4 fw-bold text-dark mb-2">{propuesta.producto.nombre}</h3>
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      <div className="d-flex align-items-center text-muted">
                        <span className="me-1">📋</span>
                        <small><strong>Modelo:</strong> {propuesta.producto.modelo}</small>
                      </div>
                      {/* <div className="d-flex align-items-center text-muted">
                        <span className="me-1">⚡</span>
                        <small><strong>Capacidad:</strong> {propuesta.producto.capacidad}</small>
                      </div> */}
                    </div>
                    
                    {/* Estado y número de contrato */}
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <span className="badge bg-warning bg-opacity-20 text-white px-3 py-2 rounded-pill">
                        Contrato Generado - Esperando Firma
                      </span>
                      {propuesta.numeroContrato && (
                        <small className="text-muted">
                          <strong>Contrato:</strong> {propuesta.numeroContrato}
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-4 text-md-end">
                    <div className="bg-light rounded-3 p-3 text-center">
                      <div className="text-muted small mb-1">Precio total</div>
                      <div className="h4 fw-bold text-primary mb-0">
                        {formatPrecio(propuesta.producto.precio, propuesta.producto.moneda)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="border-top pt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">
                        <strong>Fecha de generación:</strong><br />
                        {formatFecha(propuesta.fechaContratacion)}
                      </small>
                    </div>
                    {/* <div className="col-md-6">
                      <small className="text-muted">
                        <strong>ID Propuesta:</strong><br />
                        {propuestaId}
                      </small>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de contacto con asesor */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4 text-center">
                <div className="mb-3">
                  <span className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-20 rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
                    <span style={{fontSize: '1.5rem'}}>�</span>
                  </span>
                </div>
                
                <h3 className="h5 fw-bold mb-2">¿Listo para firmar tu contrato?</h3>
                <p className="text-muted mb-4">
                  Tu contrato está generado y preparado. Si tienes alguna duda sobre los términos, 
                  condiciones, o el proceso de firma, nuestro equipo de asesores está aquí para ayudarte.
                </p>
                
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  {/* <button 
                    className="btn btn-success btn-lg px-4 py-2 rounded-pill"
                    onClick={() => {
                      // Aquí se podría redirigir al proceso de firma del contrato
                      showToast('Redirigiendo al proceso de firma...', 'info');
                      // navigate(`/contratacion/firma-contrato?propuestaId=${propuestaId}`);
                    }}
                  >
                    <span className="me-2">✍️</span>
                    Firmar Contrato
                  </button> */}
                  
                  <button 
                    className="btn btn-outline-primary btn-lg px-4 py-2 rounded-pill"
                    onClick={handleContactarAsesor}
                    disabled={isContactingAdvisor}
                  >
                    {isContactingAdvisor ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <span className="me-2">📞</span>
                        Consultar con Asesor
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-3">
                  <small className="text-muted">
                    ¿Tienes dudas? Contacta al{' '}
                    <a href="tel:+34900802812" className="text-decoration-none">900 802 812</a>
                  </small>
                </div>
              </div>
            </div>

            {/* Botones de acción adicionales */}
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
              >
                <span className="me-1">🏠</span>
                Volver al Inicio
              </button>
              
              {/* Se podría agregar más botones aquí como "Descargar Contrato", "Ver Estado de Instalación", etc. */}
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PropuestaContratada;