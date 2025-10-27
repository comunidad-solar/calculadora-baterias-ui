import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { bateriaService } from '../services/apiService';
import PageTransition from './PageTransition';

const PagoExitoso = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { propuestaId: urlPropuestaId, type } = useParams<{ propuestaId: string; type: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(false); // null = pendiente, true = éxito, false = error
  
  // Datos del pago exitoso - puede venir de la URL o del state
  const { propuestaId: statePropuestaId, invoiceId } = location.state || {};
  const propuestaId = urlPropuestaId || statePropuestaId;

  // Si tenemos parámetros de URL (nueva funcionalidad), hacer la llamada al backend
  const procesarFaseReserva = async () => {
      if (urlPropuestaId && type) {
        setApiLoading(true);
        try {
          console.log('🔄 Procesando fase reserva pagada...');
          const result = await bateriaService.procesarFaseReservaPagado(urlPropuestaId, type);
          console.log('✅ Respuesta del backend:', result);
          
          if (result.success) {
            setPaymentSuccess(true);
            showToast('Pago procesado exitosamente', 'success');
            // Redirigir a la propuesta después de 2 segundos
            setTimeout(() => {
              navigate(`/propuesta/${urlPropuestaId}`);
            }, 2000);
          } else {
            setPaymentSuccess(false);
            showToast(result.message || 'El pago aún está siendo procesado', 'warning');
          }
        } catch (error: any) {
          console.error('❌ Error procesando fase reserva:', error);
          setPaymentSuccess(false);
          showToast('Error al procesar el pago. Por favor contacta con soporte.', 'error');
        } finally {
          setApiLoading(false);
        }
      }
    };

 

  useEffect(() => {
    // Debug: verificar qué datos llegan

    // Solo redirigir si realmente no hay ningún dato útil
    if (!propuestaId && !invoiceId && !location.state) {
      console.warn('⚠️ No hay datos de pago válidos');
      // Comentamos la redirección automática para evitar el problema
      // setTimeout(() => navigate('/'), 2000);
    }

    // Opcional: Confirmar el pago en el backend (funcionalidad antigua)
    const confirmarPago = async () => {
      if (propuestaId && invoiceId && !urlPropuestaId) {
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

    procesarFaseReserva();
    confirmarPago();
  }, []); // Solo ejecutar una vez al montar el componente



  return (
    <PageTransition>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  {/* Icono dinámico */}
                  <div className="mb-4">
                    <div 
                      className={`d-inline-flex align-items-center justify-content-center rounded-circle mx-auto ${
                        paymentSuccess === false ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className={`fas ${
                        paymentSuccess === false ? 'fa-exclamation-triangle' : 'fa-check'
                      } text-white`} style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  </div>

                  {/* Título dinámico */}
                  <h1 className={`h2 mb-3 fw-bold ${
                    paymentSuccess === false ? 'text-warning' : 'text-success'
                  }`}>
                    {paymentSuccess === false ? '¡Pago Pendiente!' : '¡Pago Exitoso!'}
                  </h1>
                  
                  <p className="lead text-muted mb-4">
                    {apiLoading ? (
                      'Verificando el estado de tu pago...'
                    ) : paymentSuccess === false ? (
                      'Tu pago aún no se ha completado. Por favor realiza el pago para continuar.'
                    ) : paymentSuccess === true ? (
                      'Tu reserva ha sido confirmada exitosamente. Hemos recibido tu pago.'
                    ) : (
                      'Verificando el estado de tu pago...'
                    )}
                  </p>

                  {/* Loading indicator mientras se procesa la API */}
                  {apiLoading && (
                    <div className="mb-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Procesando...</span>
                      </div>
                      <p className="mt-2 text-muted">
                        Verificando el estado de tu pago, por favor espera...
                      </p>
                    </div>
                  )}

                  {/* Información del pago */}
                  <div className="bg-light rounded-3 p-4 mb-4">
                    <h5 className="text-dark mb-3">
                      <i className="fas fa-receipt me-2 text-primary"></i>
                      Detalles de la Reserva
                    </h5>
                    <div className="row text-start">
                      {propuestaId && (
                        <div className="col-sm-6 mb-2">
                          <strong>Propuesta ID:</strong><br />
                          <small className="text-muted font-monospace">{propuestaId}</small>
                        </div>
                      )}
                      {type && (
                        <div className="col-sm-6 mb-2">
                          <strong>Tipo:</strong><br />
                          <small className="text-muted">
                            {type === 'reserva' ? 'Reserva' : type === 'visitaTecnica' ? 'Visita Técnica' : type}
                          </small>
                        </div>
                      )}
                      {invoiceId && (
                        <div className="col-sm-6 mb-2">
                          <strong>Factura ID:</strong><br />
                          <small className="text-muted font-monospace">{invoiceId}</small>
                        </div>
                      )}
                      {!propuestaId && !invoiceId && !type && (
                        <div className="col-12 mb-2">
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Tu pago ha sido procesado exitosamente. Los detalles específicos se enviarán por email.
                          </small>
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

                  {/* Próximos pasos - solo si el pago fue exitoso */}
                  {paymentSuccess === true && (
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
                          Nuestro equipo de asesores se pondrá en contacto contigo en las próximas horas
                        </li>
                        {/* <li className="mb-2">
                          <i className="fas fa-calendar text-primary me-2"></i>
                          Programaremos la instalación según tu disponibilidad
                        </li>
                        <li>
                          <i className="fas fa-tools text-primary me-2"></i>
                          Instalación profesional en tu hogar
                        </li> */}
                      </ul>
                    </div>
                  )}

                  {/* Información adicional para pagos pendientes */}
                  {paymentSuccess === false && (
                    <div className="text-start bg-warning bg-opacity-10 rounded-3 p-4 mb-4">
                      <h5 className="text-warning mb-3">
                        <i className="fas fa-clock me-2"></i>
                        Información del Pago
                      </h5>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="fas fa-info-circle text-warning me-2"></i>
                          Tu pago está siendo procesado por el sistema bancario
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-bell text-warning me-2"></i>
                          Te notificaremos por email cuando se complete
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-headset text-warning me-2"></i>
                          Si tienes dudas, contacta con nuestro soporte
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/')}
                      disabled={loading || apiLoading}
                    >
                      {(loading || apiLoading) ? (
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
                      disabled={loading || apiLoading}
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
                      <a href="mailto:info@comunidad.solar" className="text-decoration-none">
                        info@comunidad.solar
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