import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageTransition from './PageTransition';
import { bateriaService } from '../services/apiService';

const PagoPago = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentURL = searchParams.get('url');
  const propuestaId = searchParams.get('propuestaId');
  const invoiceId = searchParams.get('invoiceId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (!paymentURL) {
      setError('No se proporcionó una URL de pago válida');
      setLoading(false);
      return;
    }

    // Escuchar mensajes del iframe (PostMessage API)
    const handleMessage = (event: MessageEvent) => {
      // Verificar origen por seguridad (ajustar según dominio de Zoho)
      const allowedOrigins = [
        'https://zohosecurepay.eu',
        'https://securepay.zoho.eu',
        'https://books.zoho.eu'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        console.warn('🚫 Mensaje de origen no permitido:', event.origin);
        return;
      }

      console.log('📨 Mensaje recibido del iframe de pago:', event.data);

      // Procesar diferentes tipos de eventos
      if (event.data) {
        const { type, status, data } = event.data;

        switch (type) {
          case 'PAYMENT_STATUS':
            console.log('💳 Estado de pago actualizado:', status);
            setPaymentStatus(status);
            
            if (status === 'success') {
              console.log('✅ Pago completado exitosamente');
              // Opcional: redirigir después de unos segundos
              setTimeout(() => {
                navigate('/pago-exitoso', { 
                  state: { 
                    propuestaId, 
                    invoiceId, 
                    paymentData: data 
                  } 
                });
              }, 2000);
            } else if (status === 'failed') {
              console.log('❌ Pago falló');
              setError('El pago no se pudo completar. Por favor, inténtalo de nuevo.');
            }
            break;

          case 'PAYMENT_STARTED':
            console.log('🔄 Pago iniciado');
            setPaymentStatus('processing');
            break;

          case 'IFRAME_LOADED':
            console.log('✅ Iframe de pago cargado completamente');
            setLoading(false);
            break;

          default:
            console.log('📋 Evento no manejado:', type, event.data);
        }
      }
    };

    // Agregar listener
    window.addEventListener('message', handleMessage);

    // Simular un pequeño delay para mostrar el loading si no hay PostMessage
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [paymentURL, navigate, propuestaId, invoiceId]);

  // ✅ ESTRATEGIA 2: Monitorear cambios en la URL del iframe (si es posible)
  // NOTA: Zoho SecurePay bloquea esto por CORS (comportamiento de seguridad esperado)
  useEffect(() => {
    let corsBlocked = false;
    
    const monitorIframe = () => {
      if (corsBlocked) return; // No intentar más si ya sabemos que está bloqueado
      
      try {
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          // Esto solo funcionará si el iframe está en el mismo dominio
          const currentUrl = iframe.contentWindow.location.href;
          console.log('📍 URL del iframe accesible:', currentUrl);
          
          // Detectar patrones en la URL que indiquen éxito/fallo
          if (currentUrl.includes('success') || currentUrl.includes('paid')) {
            setPaymentStatus('success');
          } else if (currentUrl.includes('error') || currentUrl.includes('failed')) {
            setPaymentStatus('failed');
          }
        }
      } catch (error) {
        // CORS está bloqueando el acceso - esto es normal y esperado
        corsBlocked = true;
        console.log('🔒 Iframe protegido por CORS (normal) - usando solo PostMessage');
      }
    };

    // Intentar una vez inmediatamente, luego cada 3 segundos si no está bloqueado
    monitorIframe();
    const intervalId = setInterval(monitorIframe, 3000);
    
    return () => clearInterval(intervalId);
  }, []);

  // ✅ ESTRATEGIA 3: Detectar interacciones del usuario con el iframe
  useEffect(() => {
    let clickCount = 0;
    let lastInteraction = Date.now();
    let focusCount = 0;

    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe) return;

    // Detectar cuando el iframe recibe focus (usuario hace clic dentro)
    const handleIframeFocus = () => {
      focusCount++;
      lastInteraction = Date.now();
      console.log(`🎯 Usuario interactuó con iframe (focus #${focusCount})`);
      
      // Solo mostrar sugerencia después de varias interacciones (no cambiar estado automáticamente)
      if (focusCount >= 5 && paymentStatus === 'pending') {
        console.log('� Usuario muy activo - sugerir verificación manual');
      }
    };

    // Detectar clics en el área del iframe
    const handleIframeClick = (event: MouseEvent) => {
      const iframeRect = iframe.getBoundingClientRect();
      const isClickOnIframe = (
        event.clientX >= iframeRect.left &&
        event.clientX <= iframeRect.right &&
        event.clientY >= iframeRect.top &&
        event.clientY <= iframeRect.bottom
      );

      if (isClickOnIframe) {
        clickCount++;
        lastInteraction = Date.now();
        console.log(`🖱️ Click detectado en iframe (#${clickCount})`);
        
        // Solo registrar actividad (no cambiar estado automáticamente)
        if (clickCount >= 3) {
          console.log('🎯 Usuario muy activo en iframe - posible proceso de pago');
        }
      }
    };

    // Detectar cuando el usuario sale y regresa al iframe después de un tiempo
    const handleDocumentFocus = () => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      
      // Si han pasado más de 2 minutos desde la última interacción, sugerir verificación
      if (timeSinceLastInteraction > 120000 && paymentStatus === 'pending') {
        console.log('👀 Usuario regresó después de tiempo prolongado - sugerir verificación');
        setTimeout(() => {
          if (paymentStatus === 'pending') {
            const shouldCheck = window.confirm(
              '¡Hola de nuevo! 👋\n\n¿Ya completaste el pago?\n\nSi es así, podemos verificar el estado para ti.'
            );
            if (shouldCheck) {
              verificarPagoManual();
            }
          }
        }, 2000);
      }
    };

    // Event listeners
    iframe.addEventListener('focus', handleIframeFocus);
    document.addEventListener('click', handleIframeClick);
    window.addEventListener('focus', handleDocumentFocus);

    return () => {
      iframe.removeEventListener('focus', handleIframeFocus);
      document.removeEventListener('click', handleIframeClick);
      window.removeEventListener('focus', handleDocumentFocus);
    };
  }, [paymentStatus]);

  // ✅ ESTRATEGIA 4: Detectar cambios en el tamaño del iframe (puede indicar nuevas páginas)
  useEffect(() => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log('📐 Tamaño del iframe cambió:', entry.contentRect);
        // Algunos iframes cambian de tamaño al mostrar mensajes de éxito/error
      }
    });

    resizeObserver.observe(iframe);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // ✅ ESTRATEGIA 5: Verificación MANUAL (solo cuando el usuario lo solicite)
  const verificarPagoManual = async () => {
    if (!propuestaId) return;
    
    setPaymentStatus('processing');
    
    try {
      console.log('🔍 Verificando estado de pago manualmente...');
      const response = await bateriaService.verificarEstadoPago(propuestaId);
      
      if (response.success && response.data) {
        const { status } = response.data;
        console.log('📊 Estado del pago desde backend:', status);
        setPaymentStatus(status);
        
        if (status === 'success') {
          console.log('✅ Pago confirmado por backend');
        } else if (status === 'failed') {
          console.log('❌ Pago falló según backend');
        } else {
          // Si sigue pendiente, volver a pending
          setTimeout(() => setPaymentStatus('pending'), 2000);
        }
      } else {
        setTimeout(() => setPaymentStatus('pending'), 2000);
      }
    } catch (error) {
      console.error('❌ Error verificando estado de pago:', error);
      setTimeout(() => setPaymentStatus('pending'), 2000);
    }
  };

  // ✅ ESTRATEGIA 6: Detectar cuando el usuario vuelve a la pestaña (puede indicar que completó el pago)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && paymentStatus === 'processing') {
        console.log('👀 Usuario regresó a la pestaña durante procesamiento');
        // Opcional: preguntar al usuario si completó el pago
        setTimeout(() => {
          if (paymentStatus === 'processing') {
            const completed = window.confirm(
              '¿Has completado el pago? Si es así, haz clic en "Aceptar" para continuar.'
            );
            if (completed) {
              setPaymentStatus('success');
            }
          }
        }, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [paymentStatus]);

  if (error) {
    return (
      <PageTransition>
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
              <hr />
              <p className="mb-0">
                <button 
                  className="btn btn-outline-danger" 
                  onClick={() => window.history.back()}
                >
                  Volver
                </button>
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h4>Preparando tu pago...</h4>
            <p className="text-muted">Te estamos redirigiendo a la pasarela de pago segura</p>
            {propuestaId && (
              <small className="text-muted d-block mt-2">
                Propuesta: {propuestaId}
              </small>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container-fluid p-0 min-vh-100">
        {/* Header con información y estado de pago */}
        {/* <div className={`py-3 ${
          paymentStatus === 'success' ? 'bg-success' : 
          paymentStatus === 'failed' ? 'bg-danger' : 
          paymentStatus === 'processing' ? 'bg-warning' : 'bg-primary'
        } text-white`}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center">
                  <i className={`fas ${
                    paymentStatus === 'success' ? 'fa-check-circle' :
                    paymentStatus === 'failed' ? 'fa-exclamation-triangle' :
                    paymentStatus === 'processing' ? 'fa-spinner fa-spin' :
                    'fa-credit-card'
                  } me-2`}></i>
                  <div>
                    <h5 className="mb-0">
                      {paymentStatus === 'success' ? 'Pago Completado' :
                       paymentStatus === 'failed' ? 'Error en el Pago' :
                       paymentStatus === 'processing' ? 'Procesando Pago...' :
                       'Pago Seguro - Comunidad Solar'}
                    </h5>
                    {paymentStatus === 'success' && (
                      <small className="opacity-75">¡Gracias por tu confianza! Tu reserva ha sido confirmada.</small>
                    )}
                    {paymentStatus === 'processing' && (
                      <small className="opacity-75">
                        <i className="fas fa-search me-1"></i>
                        Verificando estado del pago...
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-auto">
                {propuestaId && (
                  <div className="text-end">
                    <small className="d-block">Propuesta: {propuestaId}</small>
                    {invoiceId && <small className="d-block">Factura: {invoiceId}</small>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* Mensaje de pago exitoso */}
        {paymentStatus === 'success' && (
          <div className="alert alert-success mx-3 mt-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle text-success me-3" style={{ fontSize: '2rem' }}></i>
              <div>
                <h4 className="alert-heading mb-1">¡Pago Exitoso!</h4>
                <p className="mb-2">Tu reserva ha sido confirmada. En breve recibirás un email con todos los detalles.</p>
                <small className="text-muted">Serás redirigido automáticamente en unos segundos...</small>
              </div>
            </div>
          </div>
        )}

        {/* Panel de control manual para el usuario */}
        {paymentStatus !== 'success' && (
          <div className="mx-3 mt-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <div className="d-flex align-items-center">
                      <i className={`fas ${paymentStatus === 'processing' ? 'fa-spinner fa-spin text-warning' : 'fa-info-circle text-info'} me-2`}></i>
                      <div>
                        <small className="fw-bold text-dark">
                          {paymentStatus === 'processing' ? 'Verificando pago...' : 'Una vez que completes el pago, el estado de la factura pasará a Pagado automáticamente. Puedes cerrar la página si lo deseas.'}
                        </small>
                        <br />
                        <small className="text-muted">
                          {paymentStatus === 'processing' 
                            ? 'Consultando el estado en nuestros sistemas...' 
                            : 'En caso de que no pagues ahora, se enviará un correo con el enlace de pago para que puedas completar la reserva más tarde, junto con la factura.'
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                  {/* <div className="col-auto">
                    <button
                      className={`btn btn-sm ${paymentStatus === 'processing' ? 'btn-outline-secondary' : 'btn-primary'}`}
                      onClick={verificarPagoManual}
                      disabled={paymentStatus === 'processing'}
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} role="status"></div>
                          Verificando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sync me-1"></i>
                          Verificar Pago
                        </>
                      )}
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Iframe con la URL de pago */}
        <iframe
          src={paymentURL || ''}
          width="100%"
          height={`calc(100vh - ${paymentStatus === 'success' ? '220px' : '120px'})`}
          frameBorder="0"
          style={{
            minHeight: `calc(100vh - ${paymentStatus === 'success' ? '220px' : '120px'})`,
            border: 'none',
            opacity: paymentStatus === 'success' ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
          }}
          title="Pasarela de Pago Segura"
          onLoad={() => {
            console.log('✅ Iframe de pago cargado correctamente');
            // Enviar mensaje al iframe para establecer comunicación
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'PARENT_READY',
                origin: window.location.origin
              }, '*');
            }
          }}
          onError={() => {
            console.error('❌ Error al cargar iframe de pago');
            setError('Error al cargar la pasarela de pago. Por favor, inténtalo de nuevo.');
          }}
        />

        {/* Footer con información de seguridad */}
        <div className="bg-light border-top py-2">
          <div className="container">
            <div className="row align-items-center">
              <div className="col">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1 text-success"></i>
                  Pago procesado de forma segura por Zoho SecurePay
                </small>
              </div>
              <div className="col-auto">
                <small className="text-muted">
                  {invoiceId && `Factura: ${invoiceId}`}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PagoPago;