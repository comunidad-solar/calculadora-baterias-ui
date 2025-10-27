import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from './PageTransition';
import { bateriaService } from '../services/apiService';

const PagoExitosoContrataVisita = () => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const procesarVisitaTecnica = async () => {
      if (!propuestaId) return;
      
      setLoading(true);
      try {
        const result = await bateriaService.procesarVisitaTecnicaPagada(propuestaId);
        
        // console.log('Visita técnica procesada:', result);
        showToast('Visita técnica confirmada exitosamente', 'success');
        
        // Redirigir al dashboard del comunero después de 2 segundos
        setTimeout(() => {
          navigate(`/comunero/${propuestaId}`);
        }, 5000);
        
      } catch (error) {
        console.error('Error procesando visita técnica:', error);
        showToast('Error al confirmar la visita técnica', 'error');
        setError('Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };
    
    procesarVisitaTecnica();
  }, [propuestaId, navigate, showToast]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#FCFCF7' }}>
          <div className="row justify-content-center w-100">
            <div className="col-12 col-md-6 col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mx-auto mb-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Procesando...</span>
                      </div>
                    </div>
                    
                    <h4 className="text-primary mb-3">Pago Exitoso</h4>
                    
                    <p className="text-muted mb-0">
                      Estamos guardando tu pago de visita técnica. Por favor espera...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#FCFCF7' }}>
          <div className="row justify-content-center w-100">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                    
                    <h4 className="text-danger mb-3">Error al Procesar</h4>
                    
                    <p className="text-muted mb-4">
                      {error}
                    </p>
                    
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                      >
                        <i className="fas fa-refresh me-2"></i>
                        Reintentar
                      </button>
                      
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/')}
                      >
                        <i className="fas fa-home me-2"></i>
                        Volver al Inicio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#FCFCF7' }}>
        <div className="row justify-content-center w-100">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="fas fa-check text-success" style={{ fontSize: '2rem' }}></i>
                  </div>
                  
                  <h4 className="text-success mb-3">¡Pago Exitoso!</h4>
                  
                  <p className="text-muted mb-4">
                    Tu pago de visita técnica ha sido procesado exitosamente. Serás redirigido en unos momentos...
                  </p>
                  
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Redirigiendo...</span>
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

export default PagoExitosoContrataVisita;