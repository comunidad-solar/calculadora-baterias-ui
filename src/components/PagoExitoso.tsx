import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageTransition from './PageTransition';

const PagoExitoso = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Datos del pago exitoso
  const { propuestaId, invoiceId } = location.state || {};

  useEffect(() => {
    // Si no hay datos del pago, redirigir al home
    if (!propuestaId) {
      console.warn('⚠️ No hay datos de pago, redirigiendo al home');
      setTimeout(() => navigate('/'), 2000);
    }

    // Opcional: Confirmar el pago en el backend
    const confirmarPago = async () => {
      if (propuestaId && invoiceId) {
        setLoading(true);
        try {
          console.log('🔄 Confirmando pago en el backend...');
          // Aquí podrías hacer una llamada al backend para confirmar el pago
          // await bateriaService.confirmarPago({ propuestaId, invoiceId });
          console.log('✅ Pago confirmado en el backend');
        } catch (error) {
          console.error('❌ Error confirmando pago:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    confirmarPago();
  }, [propuestaId, invoiceId, navigate]);

  return (
    <PageTransition>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  {/* Icono de éxito */}
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle mx-auto"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="fas fa-check text-white" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  </div>

                  {/* Título y mensaje principal */}
                  <h1 className="h2 text-success mb-3 fw-bold">
                    ¡Pago Exitoso!
                  </h1>
                  
                  <p className="lead text-muted mb-4">
                    Tu reserva ha sido confirmada exitosamente. 
                    Hemos recibido tu pago y tu instalación de baterías está en proceso.
                  </p>

                  {/* Información del pago */}
                  {propuestaId && (
                    <div className="bg-light rounded-3 p-4 mb-4">
                      <h5 className="text-dark mb-3">
                        <i className="fas fa-receipt me-2 text-primary"></i>
                        Detalles de la Reserva
                      </h5>
                      <div className="row text-start">
                        <div className="col-sm-6 mb-2">
                          <strong>Propuesta ID:</strong><br />
                          <small className="text-muted font-monospace">{propuestaId}</small>
                        </div>
                        {invoiceId && (
                          <div className="col-sm-6 mb-2">
                            <strong>Factura ID:</strong><br />
                            <small className="text-muted font-monospace">{invoiceId}</small>
                          </div>
                        )}
                        <div className="col-12 mt-2">
                          <strong>Fecha y Hora:</strong><br />
                          <small className="text-muted">
                            {new Date().toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Próximos pasos */}
                  <div className="text-start bg-info bg-opacity-10 rounded-3 p-4 mb-4">
                    <h5 className="text-info mb-3">
                      <i className="fas fa-calendar-check me-2"></i>
                      Próximos Pasos
                    </h5>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className="fas fa-envelope text-primary me-2"></i>
                        Recibirás un email de confirmación en los próximos minutos
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-phone text-primary me-2"></i>
                        Nuestro equipo técnico se pondrá en contacto contigo en 24-48 horas
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-calendar text-primary me-2"></i>
                        Programaremos la instalación según tu disponibilidad
                      </li>
                      <li>
                        <i className="fas fa-tools text-primary me-2"></i>
                        Instalación profesional en tu hogar
                      </li>
                    </ul>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/')}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-home me-2"></i>
                          Volver al Inicio
                        </>
                      )}
                    </button>
                    
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => window.print()}
                    >
                      <i className="fas fa-print me-2"></i>
                      Imprimir Confirmación
                    </button>
                  </div>

                  {/* Información de contacto */}
                  <div className="mt-4 pt-4 border-top">
                    <small className="text-muted">
                      <strong>¿Necesitas ayuda?</strong><br />
                      Contacta con nuestro equipo en{' '}
                      <a href="mailto:soporte@comunidad.solar" className="text-decoration-none">
                        soporte@comunidad.solar
                      </a>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PagoExitoso;