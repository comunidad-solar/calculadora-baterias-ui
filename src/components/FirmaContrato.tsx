import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import { comuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { useFormStore } from '../zustand/formStore';

const FirmaContrato = () => {
  const [loading, setLoading] = useState(true);
  const [preparingContract, setPreparingContract] = useState(true); // Nuevo estado para preparación
  const [error, setError] = useState('');
  const [signUrl, setSignUrl] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { form } = useFormStore();

  
  // Usar propuestaId del store si está disponible, sino usar la del state
  const propuestaId = form.propuestaId || location.state?.propuestaId;

  useEffect(() => {
    const cargarUrlFirma = async () => {
      if (!propuestaId) {
        setError('No se encontró el ID de propuesta. Por favor, inicia el proceso nuevamente.');
        setLoading(false);
        setPreparingContract(false);
        return;
      }

      try {
        // console.log('📄 Preparando contrato para propuestaId:', propuestaId);
        // console.log('⏱️ Esperando 10 segundos antes de generar el contrato...');
        
        // Esperar 10 segundos antes de hacer la llamada
        setTimeout(async () => {
          try {
            setPreparingContract(false); // Termina la fase de preparación
            // console.log('📄 Generando URL de firma para propuestaId:', propuestaId);
            
            const response = await comuneroService.obtenerUrlFirmaContrato(propuestaId);
            
            if (response.success && response.data?.signUrl) {
              // console.log('✅ URL de firma obtenida:', response.data.signUrl);
              setSignUrl(response.data.signUrl);
            } else {
              // console.error('❌ Error al obtener URL de firma:', response.error);
              setError(response.error || 'No se pudo cargar el documento de firma');
              showToast('Error al cargar el documento de firma', 'error');
            }
          } catch (err) {
            // console.error('❌ Error inesperado:', err);
            setError('Error al conectar con el servidor');
            showToast('Error al conectar con el servidor', 'error');
          } finally {
            setLoading(false);
          }
        }, 10000); // 10 segundos delay
        
      } catch (err) {
        // console.error('❌ Error inesperado en preparación:', err);
        setError('Error al conectar con el servidor');
        showToast('Error al conectar con el servidor', 'error');
        setLoading(false);
        setPreparingContract(false);
      }
    };

    cargarUrlFirma();
  }, [propuestaId, showToast]);

  // Escuchar mensajes de la página de redirección
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // console.log('📨 Mensaje recibido desde iframe:', event.data);
      
      // Verificar que el mensaje es de nuestro sistema
      if (event.data.type === 'ZOHO_CONTRACT_SIGNED' || event.data.type === 'CONTRACT_COMPLETED') {
        const { propuestaId: messagePropuestaId, targetUrl } = event.data;
        
        // console.log('✅ Contrato firmado detectado!');
        // console.log('📋 PropuestaId del mensaje:', messagePropuestaId);
        // console.log('🎯 URL objetivo:', targetUrl);
        
        // Verificar que coincida con nuestro propuestaId
        if (messagePropuestaId && messagePropuestaId === propuestaId) {
          // console.log('🚀 Navegando a página de confirmación...');
          
          // Guardar solo los datos mínimos necesarios para la página de confirmación
          const nombreComunero = form.comunero?.nombre || form.nombre || 'Usuario';
          const emailComunero = form.comunero?.email || form.mail || '';
          
          sessionStorage.setItem(`contrato_firmado_${propuestaId}`, JSON.stringify({
            nombreComunero,
            emailComunero,
            fechaFirma: new Date().toISOString(),
            propuestaId
          }));
          
          // console.log('💾 Datos de confirmación guardados para:', nombreComunero);
          showToast('¡Contrato firmado exitosamente!', 'success');
          
          // Usar navigate en lugar de window.location para mantener el estado
          navigate(`/contrato/${propuestaId}/firmado`);
        }
      } else if (event.data.type === 'ZOHO_CONTRACT_ERROR') {
        console.error('❌ Error en firma de contrato:', event.data.error);
        showToast('Error al procesar la firma del contrato', 'error');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, propuestaId, showToast]);

  const handleVolver = () => {
    navigate('/propuesta', { 
      state: { 
        propuestaId: propuestaId 
      }
    });
  };

  

  if (!propuestaId) {
    return (
      <PageTransition>
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FAFAF5' }}>
          <div className="bg-white rounded-4 p-5 shadow-lg text-center" style={{ maxWidth: '500px' }}>
            <div className="mb-4">
              <span style={{ fontSize: '3rem' }}>⚠️</span>
            </div>
            <h3 className="fw-bold mb-3">Sesión no válida</h3>
            <p className="text-muted mb-4">
              No se encontró información de la propuesta. Por favor, inicia el proceso de compra nuevamente.
            </p>
            <button 
              className="btn btn-lg"
              style={{
                background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 30px'
              }}
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-vh-100" style={{ backgroundColor: '#FAFAF5' }}>
        <div className="container-fluid py-3" style={{ maxWidth: '1400px' }}>
          
          {/* Header con botón volver */}
          <div className="position-relative mb-4">
            <BackButton />
          </div>

          {/* Título principal */}
          <div className="text-center mb-3">
            <h1 className="fw-bold mb-1" style={{ color: '#2A2A2A', fontSize: '2rem' }}>
              Firma de términos y condiciones
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
              Revisa y firma los términos y condiciones de la contratación para completar la compra.
            </p>
          </div>

          {/* Contenedor del iframe o estados de carga/error */}
          <div className="bg-white rounded-4 shadow-lg overflow-hidden" style={{ minHeight: '80vh' }}>
            {preparingContract && (
              <div className="d-flex align-items-center justify-content-center p-4" style={{ minHeight: '600px' }}>
                <div className="text-center" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
                  <div className="mb-4">
                    <div 
                      className="spinner-border" 
                      style={{ 
                        color: '#5CA00E', 
                        width: '3rem', 
                        height: '3rem',
                        borderWidth: '0.3em'
                      }} 
                      role="status"
                    >
                      <span className="visually-hidden">Preparando...</span>
                    </div>
                  </div>
                  <h4 className="fw-bold mb-3" style={{ color: '#2A2A2A' }}>
                    🔄 Estamos preparando tu contrato
                  </h4>
                  <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                    Nuestro sistema está generando tu contrato personalizado. 
                    Este proceso toma unos segundos para asegurar que todos los datos sean correctos.
                  </p>
                  <div className="mt-4 px-3">
                    <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated" 
                        style={{ 
                          background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                          width: '70%'
                        }}
                      ></div>
                    </div>
                    <p className="text-muted mt-3" style={{ fontSize: '0.9rem' }}>
                      Esto puede tomar hasta 10 segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loading && !preparingContract && (
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '600px' }}>
                <div className="text-center">
                  <div className="spinner-border mb-3" style={{ color: '#5CA00E' }} role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5 className="fw-bold mb-2">Cargando documento de firma</h5>
                  <p className="text-muted">Por favor espera mientras preparamos tu contrato...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '600px' }}>
                <div className="text-center p-4">
                  <div className="mb-4">
                    <span style={{ fontSize: '4rem' }}>❌</span>
                  </div>
                  <h5 className="fw-bold mb-3">Error al cargar el documento</h5>
                  <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
                    {error}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-lg"
                      style={{
                        background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '12px 30px'
                      }}
                      onClick={() => window.location.reload()}
                    >
                      Reintentar
                    </button>
                    <button 
                      className="btn btn-lg btn-outline-secondary"
                      style={{ borderRadius: '25px', padding: '12px 30px' }}
                      onClick={handleVolver}
                    >
                      Volver a propuesta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {signUrl && !loading && !error && !preparingContract && (
              <div style={{ height: 'calc(85vh - 100px)', position: 'relative', minHeight: '750px' }}>
                <iframe
                  src={signUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0',
                    display: 'block'
                  }}
                  title="Documento de firma de contrato"
                  onLoad={() => console.log('📄 Iframe de firma cargado correctamente')}
                  onError={() => {
                    console.error('❌ Error al cargar iframe de firma');
                    setError('Error al cargar el documento de firma');
                  }}
                />
              </div>
            )}
          </div>

          {/* Información adicional compacta */}
          {signUrl && !loading && !error && !preparingContract && (
            <div className="mt-3">
              <div className="bg-light rounded-3 p-3">
                <div className="row align-items-center">
                  <div className="col-md-9">
                    <small className="text-muted d-block">
                      <strong>💡 Importante:</strong> Revisa todos los términos antes de firmar. 
                      Una vez completada la firma, serás redirigido automáticamente y recibirás una copia por email.
                    </small>
                  </div>
                  <div className="col-md-3 text-md-end mt-2 mt-md-0">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      style={{ borderRadius: '15px', fontSize: '0.85rem' }}
                      onClick={() => window.open('https://comunidadsolar.zohobookings.eu/#/108535000004860368', '_blank')}
                    >
                      📞 Contactar Asesor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};

export default FirmaContrato;