import React from 'react';
import { useAsesores } from '../hooks/useAsesores';

/**
 * Componente que muestra un loading específico para la carga de deals de asesores
 * Se muestra cuando estamos en modo asesores, hay dealId, y se está cargando la información
 */
export const AsesoresDealLoader: React.FC = () => {
  const { 
    isAsesores, 
    hasValidDeal, 
    isLoadingDeal
  } = useAsesores();

  // Solo mostrar si cumple todas las condiciones
  if (!isAsesores || !hasValidDeal() || !isLoadingDeal) {
    return null;
  }

  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '100vh',
        backgroundColor: '#FCFCF7',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div className="text-center">
        <div className="mb-4">
          <div 
            className="spinner-border text-primary mb-3" 
            role="status" 
            style={{ width: '4rem', height: '4rem' }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="h3 fw-bold text-primary mb-2">
            <i className="fas fa-handshake me-2"></i>
            Cargando información del asesor
          </h2>
          <p className="text-muted mb-0">
            Obteniendo los datos de tu consulta...
          </p>
        </div>

        <div className="row g-3 justify-content-center">
          <div className="col-auto">
            <div className="bg-white rounded-3 p-3 shadow-sm">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-success me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <small className="text-muted">Verificando datos del cliente</small>
              </div>
            </div>
          </div>
          
          <div className="col-auto">
            <div className="bg-white rounded-3 p-3 shadow-sm">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-info me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <small className="text-muted">Cargando instalación</small>
              </div>
            </div>
          </div>
          
          <div className="col-auto">
            <div className="bg-white rounded-3 p-3 shadow-sm">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-warning me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <small className="text-muted">Preparando propuesta</small>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <small className="text-muted">
            <i className="fas fa-shield-alt me-1"></i>
            Conexión segura con nuestros servidores
          </small>
        </div>
      </div>
    </div>
  );
};

export default AsesoresDealLoader;