import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from './PageTransition';
import { bateriaService } from '../services/apiService';

const PagoExitosoPropuestaContrata = () => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const procesarPagoBaterias = async () => {
      if (!propuestaId) {
        setError('ID de propuesta no encontrado');
        setLoading(false);
        return;
      }

      try {
       

        // Mostrar éxito primero
        setShowSuccess(true);
        setLoading(false);

                // Después de mostrar el éxito, procesamos la propuesta
        setTimeout(async () => {
          try {
            const result = await bateriaService.procesarBateriasPagadas(propuestaId);
            
            // console.log('Propuesta procesada:', result);
            
            // Redirigir al dashboard del comunero
            navigate(`/comunero/${propuestaId}`);
            
          } catch (error) {
            console.error('Error procesando propuesta:', error);
            showToast('Error al procesar la propuesta, contacta con soporte', 'error');
            // Aún así redirigir al dashboard
            navigate(`/comunero/${propuestaId}`);
          }
        }, 3220);

      } catch (error) {
        console.error('❌ Error inesperado:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        setLoading(false);
      }
    };

    procesarPagoBaterias();
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
                    
                    <h4 className="text-primary mb-3">Procesando Pago</h4>
                    
                    <p className="text-muted mb-0">
                      Estamos verificando tu pago. Por favor espera...
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

  if (showSuccess) {
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
                      Tu pago ha sido procesado exitosamente. Estamos preparando tu pedido de baterías...
                    </p>
                    
                    <div className="alert alert-info" role="alert">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Procesando pedido...</strong> Serás redirigido automáticamente.
                    </div>
                    
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Procesando...</span>
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

  return null;
};

export default PagoExitosoPropuestaContrata;