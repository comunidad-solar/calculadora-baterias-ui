import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageTransition from './PageTransition';
// import { bateriaService } from '../services/apiService';

const PagoPago = () => {
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const paymentURL = searchParams.get('url');
  const propuestaId = searchParams.get('propuestaId');
  // const invoiceId = searchParams.get('invoiceId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (!paymentURL) {
      setError('No se proporcionó una URL de pago válida');
      setLoading(false);
      return;
    }

  }, [paymentURL]);



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
            // console.log('✅ Iframe de pago cargado correctamente');
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
            
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PagoPago;